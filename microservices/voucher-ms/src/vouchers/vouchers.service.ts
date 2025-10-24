import { CreateVoucherDto } from './dto/create-voucher.dto';
import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConditionPayment, PrismaClient } from '@prisma/client';
import { PaginationDto } from './dto/pagination.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { envs, NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { VoucherType } from 'src/enum';
import * as QRCode from 'qrcode';

@Injectable()
export class VouchersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(VouchersService.name);
  private _normalizeText(text: string) {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  private _calculateIva(totalAmount: number) {
    const ivaRate = 0.21;
    const neto = +(totalAmount / (1 + ivaRate)).toFixed(2);
    const ivaAmount = +(totalAmount - neto).toFixed(2);

    return { ivaAmount };
  }

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected successfully');
  }

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
  }

  private _voucherTypeMap: Record<VoucherType, number> = {
    [VoucherType.FACTURA_A]: 1,
    [VoucherType.FACTURA_B]: 6,
    [VoucherType.NOTA_CREDITO_A]: 3,
    [VoucherType.NOTA_CREDITO_B]: 8,
    [VoucherType.NOTA_DEBITO_A]: 2,
    [VoucherType.NOTA_DEBITO_B]: 7,
    [VoucherType.PRESUPUESTO]: 0,
  };
  private async _generateAfipQr(voucher: any, contact: any): Promise<string> {
    const qrData = {
      ver: 1,
      fecha: new Date(voucher.emissionDate).toISOString().slice(0, 10),
      cuit: Number(voucher.issuerCuit ?? '20169658146'),
      ptoVta: Number(voucher.pointOfSale),
      tipoCmp: this._voucherTypeMap[voucher.type as VoucherType] ?? 99,
      nroCmp: Number(voucher.voucherNumber),
      importe: Number(voucher.totalAmount ?? 0),
      moneda: 'PES',
      ctz: 1,
      tipoDocRec: Number(contact?.documentTypeCode), // 80 = CUIT
      nroDocRec: Number(contact?.documentNumber ?? 0),
      tipoCodAut: 'E',
      codAut: Number(voucher.arcaCae ?? 0), // 👈 asegurate de que sea numérico
    };

    const base64Json = Buffer.from(JSON.stringify(qrData)).toString('base64');
    const url = `https://www.afip.gob.ar/fe/qr/?p=${base64Json}`;

    // Devuelve el QR como DataURL (PNG)
    return await QRCode.toDataURL(url);
  }

  private async _loadToArca(arcaDto) {
    try {
      const arca = await firstValueFrom(
        this.client
          .send({ cmd: 'arca_emit_invoice' }, arcaDto)
          .pipe(timeout(5000)),
      );

      return arca;
    } catch (error) {
      return {
        message: error,
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  async create(createVoucherDto: CreateVoucherDto) {
    try {
      const {
        cuil,
        products,
        paidAmount = 0,
        available = true,
        initialPayment,
        contactId,
        currency,
        loadToArca,
        associatedVoucherNumber,
        associatedVoucherType,
        ...voucherData
      } = createVoucherDto;

      let contact: any;
      let documentNumber: number | undefined;
      const isPresupuesto =
        (createVoucherDto.type as VoucherType) === VoucherType.PRESUPUESTO;
      if (contactId) {
        contact = await firstValueFrom(
          this.client.send({ cmd: 'find_one_contact' }, contactId),
        );
        if (!contact) {
          return {
            status: HttpStatus.BAD_REQUEST,
            message: `[CREATE_VOUCHER] No se encontró el contacto con ID ${contactId}`,
          };
        }
        documentNumber = parseInt(contact?.documentNumber);
      }

      // Validar productos
      if (products.some((p) => p.quantity <= 0)) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: '[CREATE_VOUCHER] Cada producto debe tener cantidad',
        };
      }

      // Enriquecer productos
      const enrichedProducts = products.map((p) => ({
        productId: p.productId,
        code: p.code,
        description: p.description,
        quantity: p.quantity,
        price: p.price,
        subtotal: p.quantity * p.price,
      }));

      // Calcular totales
      const totalAmount = enrichedProducts.reduce(
        (sum, p) => sum + p.subtotal,
        0,
      );
      const { ivaAmount } = this._calculateIva(totalAmount);
      const netAmount = totalAmount - ivaAmount;
      const isCredit = paidAmount >= totalAmount ? 'CASH' : 'CREDIT';

      // Inicializar datos ARCA solo si es necesario
      let arcaCae: string | undefined;
      let arcaDueDate: string | undefined;
      let isLoadedToArca: boolean;
      if (loadToArca) {
        const arcaDto = {
          cuil,
          pointOfSale: createVoucherDto.pointOfSale,
          voucherType: createVoucherDto.type,
          voucherNumber: createVoucherDto.voucherNumber,
          associatedVoucherNumber: createVoucherDto?.associatedVoucherNumber,
          associatedVoucherType: createVoucherDto?.associatedVoucherType,
          emissionDate: createVoucherDto.emissionDate
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, ''),
          contactCuil: documentNumber,
          ivaCondition: contact?.ivaCondition || 'CONSUMIDOR_FINAL',
          totalAmount,
          netAmount,
          ivaAmount,
          currency: 'PES',
        };

        const response = await this._loadToArca(arcaDto); // ACA SE CARGA EN ARCAAAA, SI NO SE CARGA
        arcaCae = response?.cae;
        arcaDueDate = response?.caeFchVto;
        isLoadedToArca =
          response?.isLoadedToArca === 'A' ? true : false || false;
        console.log(response);
        if (response?.status === 'REJECTED' || !arcaCae || !arcaDueDate) {
          // Convertir la lista de observaciones en un string legible
          const obsMessages =
            response.errors?.map((o) => `[${o.Code}] ${o.Msg}`).join('; ') ??
            '';
          const afipErr = response.afipError
            ? `[${response.afipError.Code}] ${response.afipError.Msg}`
            : '';

          return {
            message: `No se pudo obtener el CAE del comprobante. Intenta nuevamente. ${afipErr} ${obsMessages}`,
            status: HttpStatus.BAD_REQUEST,
          };
        }
      }

      const result = await this.$transaction(async (tx) => {
        const voucher = await tx.eVoucher.create({
          data: {
            ...voucherData,
            ...(isPresupuesto ? { pointOfSale: 0, voucherNumber: 0 } : {}),
            contactId: contact?.id,
            conditionPayment: isCredit,
            totalAmount,
            ivaAmount,
            associatedVoucherNumber,
            associatedVoucherType,
            paidAmount,
            available,
            ...(loadToArca ? { arcaCae, arcaDueDate, isLoadedToArca } : {}),
          },
        });

        await tx.eVoucherProduct.createMany({
          data: enrichedProducts.map((p) => ({
            code: p.code,
            description: p.description,
            productId: p.productId,
            price: p.price,
            quantity: p.quantity,
            voucherId: voucher.id,
          })),
        });

        if (Array.isArray(initialPayment)) {
          for (const payment of initialPayment) {
            if (payment.bankId) {
              const bank = await tx.eBank.findUnique({
                where: { id: payment.bankId },
              });
              if (!bank) {
                throw new Error(
                  `[CREATE_PAYMENT] El banco ${payment.bankId} no existe.`,
                );
              }
            }
            await tx.ePayment.create({
              data: { ...payment, voucherId: voucher.id },
            });
          }
        }

        return voucher;
      });

      return result;
    } catch (error: any) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `[CREATE_VOUCHER] No se pudo crear el comprobante: ${error.message}`,
      };
    }
  }

  async findAllConditionPayment(pagination: PaginationDto) {
    try {
      const { limit, offset, conditionPayment, query, type } = pagination;

      // Construcción dinámica del where
      const whereClause: any = {
        available: true,
      };

      if (type) {
        whereClause.type = type;
      }

      if (conditionPayment) {
        whereClause.conditionPayment = conditionPayment;
      }

      // Si hay query, se buscan contactos relacionados
      if (query) {
        const normalizedQuery = this._normalizeText(query);

        const contactResponse = await firstValueFrom(
          this.client.send(
            { cmd: 'search_contacts' },
            { type: 'CLIENT', query: normalizedQuery },
          ),
        );

        const contactIds = contactResponse?.data?.map((c) => c.id) || [];
        if (contactIds.length > 0) {
          whereClause.contactId = { in: contactIds };
        }
      }

      // Ejecutar consultas en paralelo
      const [vouchers, total] = await Promise.all([
        this.eVoucher.findMany({
          where: whereClause,
          take: limit,
          skip: (offset - 1) * limit,
          orderBy: {
            createdAt: 'desc', //Traer Fecha reciente
          },
          include: {
            products: true,
            Payments: true,
          },
        }),
        this.eVoucher.count({ where: whereClause }),
      ]);

      return {
        data: vouchers,
        meta: {
          total,
          page: offset,
          lastPage: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error(`[FIND_ALL_CONDITION_PAYMENT]`, error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `[FIND_ALL_CONDITION_PAYMENT] Error al obtener comprobantes: ${error.message}`,
      };
    }
  }

  async findOne(id: string) {
    try {
      const voucher = await this.eVoucher.findFirst({
        where: { id },
        include: {
          products: true,
          Payments: true,
        },
      });
      if (!voucher) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: `[FIND_ONE_VOUCHER] El comprobante ${id} no existe.`,
        };
      }
      console.log(voucher);
      return voucher;
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `[FIND_ONE_VOUCHER] Error al obtener el comprobante: ${error.message}`,
      };
    }
  }

  async registerPayment(dto: CreatePaymentDto) {
    try {
      // Validar existencia del comprobante
      const voucher = await this.eVoucher.findUnique({
        where: { id: dto.voucherId, available: true },
      });
      if (!voucher) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: `[REGISTER_PAYMENT] El comprobante ${dto.voucherId} no existe.`,
        };
      }

      // Validar existencia del banco (si aplica)
      if (dto.bankId) {
        const bank = await this.eBank.findUnique({ where: { id: dto.bankId } });
        if (!bank) {
          return {
            status: HttpStatus.BAD_REQUEST,
            message: `[REGISTER_PAYMENT] El banco indicado no existe.`,
          };
        }
      }

      if (dto.cardId) {
        const card = await this.eCard.findUnique({ where: { id: dto.cardId } });
        if (!card) {
          return {
            status: HttpStatus.BAD_REQUEST,
            message: `[REGISTER_PAYMENT] El tarjeta indicada no existe.`,
          };
        }
      }

      // Crear el pago
      const payment = await this.ePayment.create({
        data: { ...dto },
      });

      // Actualizar el estado del comprobante (si corresponde)
      const pagosAnteriores = await this.ePayment.findMany({
        where: { voucherId: dto.voucherId },
      });

      const totalPagado = pagosAnteriores.reduce(
        (sum, p) => sum + (p.amount ?? 0),
        0,
      );

      const remaining = (voucher.totalAmount ?? 0) - totalPagado;

      await this.eVoucher.update({
        where: { id: dto.voucherId },
        data: {
          paidAmount: totalPagado,
          status: remaining <= 0 ? 'SENT' : 'PENDING',
          conditionPayment:
            remaining <= 0 ? ConditionPayment.CASH : ConditionPayment.CREDIT,
        },
      });

      return {
        success: true,
        data: payment,
        message: 'Pago registrado correctamente.',
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `[REGISTER_PAYMENT] No se pudo registrar el pago: ${error.message}`,
      };
    }
  }

  async buildHtml({ voucher, contact, padronData }: any): Promise<string> {
    const formatDate = (d: Date | string) =>
      new Date(d).toLocaleDateString('es-AR');

    const money = (n: number) =>
      new Intl.NumberFormat('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(n || 0);

    const numberAr = (n: number) =>
      new Intl.NumberFormat('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(n || 0);

    const subtotal =
      voucher?.products?.reduce(
        (sum: number, p: any) =>
          sum + (Number(p.price) || 0) * (Number(p.quantity) || 0),
        0,
      ) || 0;

    const total = voucher?.totalAmount ?? subtotal;
    const paid = voucher?.paidAmount ?? 0;
    const remaining = voucher?.remainingAmount ?? total - paid;

    // Letra, título y código
    let letra = 'X';
    let titulo = 'COMPROBANTE';
    let cod = '000';
    switch (voucher.type) {
      case VoucherType.FACTURA_A:
        letra = 'A';
        titulo = 'FACTURA';
        cod = '001';
        break;
      case VoucherType.FACTURA_B:
        letra = 'B';
        titulo = 'FACTURA';
        cod = '006';
        break;
      case VoucherType.NOTA_CREDITO_A:
        letra = 'A';
        titulo = 'NOTA DE CRÉDITO';
        cod = '003';
        break;
      case VoucherType.NOTA_CREDITO_B:
        letra = 'B';
        titulo = 'NOTA DE CRÉDITO';
        cod = '008';
        break;
      case VoucherType.NOTA_DEBITO_A:
        letra = 'A';
        titulo = 'NOTA DE DÉBITO';
        cod = '002';
        break;
      case VoucherType.PRESUPUESTO:
        letra = 'P';
        titulo = 'PRESUPUESTO';
        cod = '999';
    }

    const qrBase64 = await this._generateAfipQr(voucher, contact);

    const showIva = [VoucherType.FACTURA_A, VoucherType.FACTURA_B].includes(
      voucher?.type,
    );
    const ivaRateDefault = showIva ? 0.21 : 0;

    const productsHtml = (voucher?.products || [])
      .map((p: any, idx: number) => {
        const q = Number(p.quantity) || 0;
        const up = Number(p.price) || 0;
        const rate = typeof p.ivaRate === 'number' ? p.ivaRate : ivaRateDefault;
        const lineSubtotal = up * q;
        const lineTotal = showIva ? lineSubtotal * (1 + rate) : lineSubtotal;

        return `
        <tr>
          <td class="t-left">${idx + 1}</td>
          <td class="t-left">${p.description || '-'}</td>
          <td class="t-right">${numberAr(q)}</td>
          <td class="t-center">${p.unit || 'unidades'}</td>
          <td class="t-right">${numberAr(up)}</td>
          <td class="t-center">0,00</td>
          <td class="t-right">${numberAr(lineSubtotal)}</td>
          <td class="t-center">${showIva ? `${Math.round(rate * 100)}%` : '-'}</td>
        </tr>`;
      })
      .join('');

    const ivaBlock = showIva
      ? `<tr><td>IVA 21%</td><td class="t-right">${money(
          voucher?.ivaAmount,
        )}</td></tr>`
      : '';

    const netoBlock = showIva
      ? `<tr><td>Subtotal</td><td class="t-right">${money(subtotal)}</td></tr>`
      : '';

    return `
 <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${titulo} ${letra}</title>
    <style>
      * {
        box-sizing: border-box;
        font-family: Arial, Helvetica, sans-serif;
        color: #000;
      }
      html,
      body {
        margin: 0;
        padding: 0;
      }
      @page {
        size: A4;
        margin: 12mm;
      }
      body {
        font-size: 12px;
        line-height: 1.3;
      }

      .container {
        max-width: 100%;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 0.1fr 1fr 0.5fr 2fr 1fr;
        gap: 10px;
        padding: 0px 20px;
        margin: auto;
      }

      /* Utilidades */
      .t-left {
        text-align: left;
      }
      .t-center {
        text-align: center;
      }
      .t-right {
        text-align: right;
      }
      .bold {
        font-weight: 700;
      }
      .w-100 {
        width: 100%;
      }
      .mt-6 {
        margin-top: 6px;
      }
      .mt-12 {
        margin-top: 12px;
      }

      /* Header */
      .hdr {
        display: grid;
        grid-template-columns: 1fr 90px 1fr;
        gap: 8px;
        align-items: stretch;
      }
      .hdr .brand {
        border: 1px solid #000;
        padding: 8px;
      }
      .hdr .brand h2 {
        font-size: 20px;
        margin: 0 0 4px 0;
      }
      .hdr .center {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border: 2px solid #000;
      }
      .hdr .center .letter {
        font-size: 42px;
        font-weight: 700;
        line-height: 1;
      }
      .hdr .center .cod {
        font-size: 11px;
        margin-top: 2px;
      }
      .hdr .right {
        border: 1px solid #000;
        padding: 8px;
      }
      .hdr .right h3 {
        text-align: left;
        font-weight: 700;
        font-size: 18px;
        margin: 0 0 6px 0;
      }

      /* Band */
      .band {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        border: 1px solid #000;
        padding: 6px;
      }

      /* Client */
      .client {
        border: 1px solid #000;
        padding: 8px;
        margin-top: 8px;
      }
      .client-row {
        display: grid;
        grid-template-columns: 50% 50%;
        gap: 8px;
        margin-top: 4px;
      }

      /* Tables */
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 8px;
      }
      th,
      td {
        border: 1px solid #000;
        padding: 6px;
      }
      th {
        font-weight: 700;
        background: #f2f2f2;
      }

      /* Totals */
      .totals {
        width: 100%;
        margin-left: auto;
        border: 1px solid #000;
        margin-top: 50px;
      }
      .totals td {
        padding: 6px;
      }
      .totals tr td:first-child {
        font-weight: 700;
      }
      .totals tr:last-child td {
        font-size: 14px;
        font-weight: 700;
        background: #f2f2f2;
      }

      /* Footer */
      .foot {
        display: grid;
        grid-template-columns: 2fr 1.5fr;
        gap: 8px;
        margin-top: 12px;
      }
      .foot-note {
        font-size: 10px;
        font-style: italic;
        margin-top: 6px;
      }
      .qr {
        text-align: center;
        margin-top: 8px;
      }

      .copy-title {
        text-align: center;
        font-weight: 700;
        border: 1px solid #000;
        border-bottom: 0;
        padding: 6px;
      }
    </style>
  </head>
  <body>
    <main class="container">
      <div class="copy-title">ORIGINAL</div>

      <!-- Header -->
      <section class="hdr">
        <div class="brand">
          <h2>${padronData?.razonSocial || 'LOBO CARLOS ALBERTO'}</h2>
          <p>
            <b>Razón Social:</b> ${padronData?.razonSocial || 'LOBO CARLOS ALBERTO'}
          </p>
          <p>
            <b>Domicilio Comercial:</b> ${
              padronData?.domicilio[0].direccion || '-'
            } - ${padronData?.domicilio[0].localidad}
          </p>
          <p>
            <b>Condición frente al IVA:</b> ${
              padronData?.condicionIVA || 'Responsable Inscripto'
            }
          </p>
        </div>

        <div class="center">
          <div class="letter">${letra}</div>
          <div class="cod">COD. ${cod}</div>
        </div>

        <div class="right">
          <h3>${titulo}</h3>
          <p><b>Punto de Venta:</b> ${voucher?.pointOfSale ?? '-'}</p>
          <p><b>Comp. Nro:</b> ${voucher?.voucherNumber ?? '-'}</p>
          <p>
            <b>Fecha Emisión:</b> ${
              voucher?.emissionDate ? formatDate(voucher.emissionDate) : '-'
            }
          </p>
          <p><b>CUIT:</b> ${padronData?.idPersona || '-'}</p>
          <p>
            <b>Ingresos Brutos:</b> ${padronData?.ingresosBrutos || '270197035'}
          </p>
          <p>
            <b>Inicio Activ.:</b> ${
              padronData?.inicioActividades || '01/04/2000'
            }
          </p>
        </div>
      </section>

      <!-- Client -->
      <section class="client">
        <div class="client-row">
          <div><b>CUIT/DNI:</b> ${contact?.documentNumber || '-'}</div>
          <div><b>Cliente:</b> ${contact?.name || '-'}</div>
        </div>
        <div class="client-row">
          <div><b>IVA:</b> ${contact?.ivaCondition || 'Consumidor Final'}</div>
          <div><b>Domicilio:</b> ${contact?.address || '-'}</div>
        </div>
        ${
          letra !== 'P'
            ? `
        <div class="client-row">
          <div>
            <b>Condición de venta:</b> ${
              voucher.conditionPayment === 'CREDIT'
                ? 'Cuenta Corriente'
                : 'Contado'
            }
          </div>
          <div></div>
        </div>
        `
            : ''
        }
      </section>

      <!-- Items -->
      <section>
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto / Servicio</th>
              <th>Cantidad</th>
              <th>U. Medida</th>
              <th>Precio Unit.</th>
              <th>% Bonif</th>
              <th>Subtotal</th>
              <th>IVA</th>
            </tr>
          </thead>
          <tbody>
            ${
              productsHtml ||
              `
            <tr>
              <td class="t-left">-</td>
              <td class="t-left">-</td>
              <td class="t-right">0,00</td>
              <td class="t-center">unidades</td>
              <td class="t-right">0,00</td>
              <td class="t-center">0,00</td>
              <td class="t-right">0,00</td>
              <td class="t-center">-</td>
            </tr>
            `
            }
          </tbody>
        </table>
      </section>

      <!-- Totals -->
      <table class="totals">
        <tbody>
          ${netoBlock} ${ivaBlock}
          <tr>
            <td>Total</td>
            <td class="t-right">$ ${money(total)}</td>
          </tr>
        </tbody>
      </table>

      <!-- Footer -->
      <section class="foot">
        <div>
          ${letra === 'P' ? '<div class="bold">Comprobante No Autorizado</div>' : '<div class="bold">Comprobante Autorizado</div>'}
          <p class="foot-note">
            Esta Administración Federal no se responsabiliza por los datos
            ingresados en el detalle de la operación
          </p>
          <div class="qr"><img src="${qrBase64}" width="200" /></div>
        </div>
        <div>
          <table>
            <tr>
              <td><b>CAE N°</b></td>
              <td class="t-right">${voucher?.arcaCae || '-'}</td>
            </tr>
            <tr>
              <td><b>Vto. CAE</b></td>
              <td class="t-right">${formatDate(voucher?.arcaDueDate) || '-'}</td>
            </tr>
          </table>
          <div class="t-center mt-6">Pág 1/1</div>
        </div>
      </section>
    </main>
  </body>
</html>
`;
  }

  async generateVoucherHtml(voucherId: string): Promise<string> {
    try {
      let contact = null;

      let padronData = null;
      try {
        padronData = await firstValueFrom(
          this.client.send({ cmd: 'arca_contribuyente_data' }, {}),
        );
      } catch (err) {
        console.warn(`[WARN] No se pudo obtener el padron: ${err.message}`);
      }

      const voucher = await this.eVoucher.findUnique({
        where: { id: voucherId },
        include: { products: true, Payments: true },
      });

      if (!voucher) throw new Error('No se encontró el comprobante');

      if (voucher.contactId) {
        try {
          contact = await firstValueFrom(
            this.client.send({ cmd: 'find_one_contact' }, voucher.contactId),
          );
        } catch (err) {
          console.warn(`[WARN] No se pudo obtener el contacto: ${err.message}`);
        }
      }

      return await this.buildHtml({ voucher, contact, padronData });
    } catch (error) {
      console.log('ERRORRR', error);
      throw new RpcException({
        message: `Error al generar el HTML del comprobante: ${error}`,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async deleteVoucherAll() {
    const voucher = await this.eVoucher.deleteMany();
    return 'Succefully';
  }

  async deleteVoucherFindOne(id: string) {
    const voucher = await this.eVoucher.deleteMany({
      where: { id },
    });
    return 'Succefully';
  }
}
