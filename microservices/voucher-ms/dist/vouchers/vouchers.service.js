"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var VouchersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VouchersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const config_1 = require("../config");
const microservices_1 = require("@nestjs/microservices");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const enum_1 = require("../enum");
let VouchersService = VouchersService_1 = class VouchersService extends client_1.PrismaClient {
    client;
    logger = new common_1.Logger(VouchersService_1.name);
    _normalizeText(text) {
        return text
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }
    _calculateIva(totalAmount) {
        const ivaRate = 0.21;
        const neto = +(totalAmount / (1 + ivaRate)).toFixed(2);
        const ivaAmount = +(totalAmount - neto).toFixed(2);
        return { ivaAmount };
    }
    onModuleInit() {
        this.$connect();
        this.logger.log('Database connected successfully');
    }
    constructor(client) {
        super();
        this.client = client;
    }
    async _loadToArca(arcaDto) {
        try {
            const arca = await (0, rxjs_1.firstValueFrom)(this.client
                .send({ cmd: 'arca_emit_invoice' }, arcaDto)
                .pipe((0, operators_1.timeout)(5000)));
            return arca;
        }
        catch (error) {
            return {
                message: error,
                status: common_1.HttpStatus.BAD_REQUEST,
            };
        }
    }
    async create(createVoucherDto) {
        try {
            const { cuil, products, paidAmount = 0, available = true, initialPayment, contactId, currency, loadToArca, associatedVoucherNumber, associatedVoucherType, ...voucherData } = createVoucherDto;
            let contact;
            let documentNumber;
            const isPresupuesto = createVoucherDto.type === enum_1.VoucherType.PRESUPUESTO;
            if (contactId) {
                contact = await (0, rxjs_1.firstValueFrom)(this.client.send({ cmd: 'find_one_contact' }, contactId));
                if (!contact) {
                    return {
                        status: common_1.HttpStatus.BAD_REQUEST,
                        message: `[CREATE_VOUCHER] No se encontró el contacto con ID ${contactId}`,
                    };
                }
                documentNumber = parseInt(contact?.documentNumber);
            }
            if (products.some((p) => p.quantity <= 0)) {
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    message: '[CREATE_VOUCHER] Cada producto debe tener cantidad',
                };
            }
            const enrichedProducts = products.map((p) => ({
                productId: p.productId,
                code: p.code,
                description: p.description,
                quantity: p.quantity,
                price: p.price,
                subtotal: p.quantity * p.price,
            }));
            const totalAmount = enrichedProducts.reduce((sum, p) => sum + p.subtotal, 0);
            const { ivaAmount } = this._calculateIva(totalAmount);
            const netAmount = totalAmount - ivaAmount;
            const isCredit = paidAmount >= totalAmount ? 'CASH' : 'CREDIT';
            let arcaCae;
            let arcaDueDate;
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
                    ivaCondition: contact?.ivaCondition,
                    totalAmount,
                    netAmount,
                    ivaAmount,
                    currency: 'PES',
                };
                const response = await this._loadToArca(arcaDto);
                arcaCae = response?.cae;
                arcaDueDate = response?.caeFchVto;
                if (response?.status === 'REJECTED' || !arcaCae || !arcaDueDate) {
                    const obsMessages = response.errors?.map((o) => `[${o.Code}] ${o.Msg}`).join('; ') ??
                        '';
                    const afipErr = response.afipError
                        ? `[${response.afipError.Code}] ${response.afipError.Msg}`
                        : '';
                    return {
                        message: `No se pudo obtener el CAE del comprobante. Intenta nuevamente. ${afipErr} ${obsMessages}`,
                        status: common_1.HttpStatus.BAD_REQUEST,
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
                        ...(loadToArca ? { arcaCae, arcaDueDate } : {}),
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
                                throw new Error(`[CREATE_PAYMENT] El banco ${payment.bankId} no existe.`);
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
        }
        catch (error) {
            return {
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: `[CREATE_VOUCHER] No se pudo crear el comprobante: ${error.message}`,
            };
        }
    }
    async findAllConditionPayment(pagination) {
        try {
            const { limit, offset, conditionPayment, query, type } = pagination;
            const whereClause = {
                available: true,
            };
            if (type) {
                whereClause.type = type;
            }
            if (conditionPayment) {
                whereClause.conditionPayment = conditionPayment;
            }
            if (query) {
                const normalizedQuery = this._normalizeText(query);
                const contactResponse = await (0, rxjs_1.firstValueFrom)(this.client.send({ cmd: 'search_contacts' }, { type: 'CLIENT', query: normalizedQuery }));
                const contactIds = contactResponse?.data?.map((c) => c.id) || [];
                if (contactIds.length > 0) {
                    whereClause.contactId = { in: contactIds };
                }
            }
            const [vouchers, total] = await Promise.all([
                this.eVoucher.findMany({
                    where: whereClause,
                    take: limit,
                    skip: (offset - 1) * limit,
                    orderBy: {
                        createdAt: 'desc',
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
        }
        catch (error) {
            console.error(`[FIND_ALL_CONDITION_PAYMENT]`, error);
            return {
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: `[FIND_ALL_CONDITION_PAYMENT] Error al obtener comprobantes: ${error.message}`,
            };
        }
    }
    async findOne(id) {
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
                    status: common_1.HttpStatus.NOT_FOUND,
                    message: `[FIND_ONE_VOUCHER] El comprobante ${id} no existe.`,
                };
            }
            return voucher;
        }
        catch (error) {
            return {
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: `[FIND_ONE_VOUCHER] Error al obtener el comprobante: ${error.message}`,
            };
        }
    }
    async registerPayment(dto) {
        try {
            const voucher = await this.eVoucher.findUnique({
                where: { id: dto.voucherId, available: true },
            });
            if (!voucher) {
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    message: `[REGISTER_PAYMENT] El comprobante ${dto.voucherId} no existe.`,
                };
            }
            if (dto.bankId) {
                const bank = await this.eBank.findUnique({ where: { id: dto.bankId } });
                if (!bank) {
                    return {
                        status: common_1.HttpStatus.BAD_REQUEST,
                        message: `[REGISTER_PAYMENT] El banco indicado no existe.`,
                    };
                }
            }
            if (dto.cardId) {
                const card = await this.eCard.findUnique({ where: { id: dto.cardId } });
                if (!card) {
                    return {
                        status: common_1.HttpStatus.BAD_REQUEST,
                        message: `[REGISTER_PAYMENT] El tarjeta indicada no existe.`,
                    };
                }
            }
            const payment = await this.ePayment.create({
                data: { ...dto },
            });
            const pagosAnteriores = await this.ePayment.findMany({
                where: { voucherId: dto.voucherId },
            });
            const totalPagado = pagosAnteriores.reduce((sum, p) => sum + (p.amount ?? 0), 0);
            const remaining = (voucher.totalAmount ?? 0) - totalPagado;
            await this.eVoucher.update({
                where: { id: dto.voucherId },
                data: {
                    paidAmount: totalPagado,
                    status: remaining <= 0 ? 'SENT' : 'PENDING',
                    conditionPayment: remaining <= 0 ? client_1.ConditionPayment.CASH : client_1.ConditionPayment.CREDIT,
                },
            });
            return {
                success: true,
                data: payment,
                message: 'Pago registrado correctamente.',
            };
        }
        catch (error) {
            return {
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: `[REGISTER_PAYMENT] No se pudo registrar el pago: ${error.message}`,
            };
        }
    }
    async buildHtml({ voucher, contact }) {
        const formatDate = (d) => new Date(d).toLocaleDateString('es-AR');
        const money = (n) => new Intl.NumberFormat('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(n || 0);
        const numberAr = (n) => new Intl.NumberFormat('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(n || 0);
        const subtotal = voucher?.products?.reduce((sum, p) => sum + (Number(p.price) || 0) * (Number(p.quantity) || 0), 0) || 0;
        const total = voucher?.totalAmount ?? subtotal;
        const paid = voucher?.paidAmount ?? 0;
        const remaining = voucher?.remainingAmount ?? total - paid;
        let letra = 'X';
        let titulo = 'COMPROBANTE';
        let cod = '000';
        switch (voucher.type) {
            case enum_1.VoucherType.FACTURA_A:
                letra = 'A';
                titulo = 'FACTURA';
                cod = '001';
                break;
            case enum_1.VoucherType.FACTURA_B:
                letra = 'B';
                titulo = 'FACTURA';
                cod = '006';
                break;
            case enum_1.VoucherType.NOTA_CREDITO_A:
                letra = 'A';
                titulo = 'NOTA DE CRÉDITO';
                cod = '003';
                break;
            case enum_1.VoucherType.NOTA_CREDITO_B:
                letra = 'B';
                titulo = 'NOTA DE CRÉDITO';
                cod = '008';
                break;
            case enum_1.VoucherType.NOTA_DEBITO_A:
                letra = 'A';
                titulo = 'NOTA DE DÉBITO';
                cod = '002';
                break;
            case enum_1.VoucherType.PRESUPUESTO:
                letra = 'P';
                titulo = 'PRESUPUESTO';
                cod = '999';
        }
        const showIva = [enum_1.VoucherType.FACTURA_A, enum_1.VoucherType.FACTURA_B].includes(voucher?.type);
        const ivaRateDefault = showIva ? 0.21 : 0;
        const productsHtml = (voucher?.products || [])
            .map((p, idx) => {
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
          <td class="t-center">${p.unit || '-'}</td>
          <td class="t-right">${numberAr(up)}</td>
          <td class="t-center">0,00</td>
          <td class="t-right">${numberAr(lineSubtotal)}</td>
          <td class="t-center">${showIva ? `${Math.round(rate * 100)}%` : '-'}</td>
        </tr>`;
        })
            .join('');
        const ivaBlock = showIva
            ? `<tr><td>IVA 21%</td><td class="t-right">${money(voucher?.ivaAmount)}</td></tr>`
            : '';
        const netoBlock = showIva
            ? `<tr><td>Importe Neto Gravado</td><td class="t-right">${money(subtotal)}</td></tr>`
            : '';
        return `
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>${titulo} ${letra}</title>
    <style>
      /* --- Reset/print-safe --- */
      * { box-sizing: border-box; font-family: Arial, Helvetica, sans-serif; color: #000; }
      html, body { margin: 0; padding: 0; }
      @page { size: A4; margin: 12mm; }
      body { font-size: 12px; line-height: 1.25; }

      /* --- Utilities --- */
      .t-left{ text-align:left; } .t-center{ text-align:center; } .t-right{ text-align:right; }
      .bold{ font-weight:700; } .mt-4{ margin-top:4px; } .mt-8{ margin-top:8px; } .mt-12{ margin-top:12px; }
      .mb-0{ margin-bottom:0; } .w-100{ width:100%; }

      /* --- Blocks --- */
      .box { border: 1px solid #000; padding: 8px; }
      .box-tight { border: 1px solid #000; padding: 6px; }

      /* --- Header (grid, no absolute) --- */
      .hdr { display: grid; grid-template-columns: 1fr 90px 1fr; gap: 8px; align-items: stretch; }
      .hdr .brand h2 { font-size: 20px; margin: 0 0 4px 0; }
      .hdr .brand p { margin: 0; }
      .hdr .center {
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        border: 1px solid #000;
      }
      .hdr .center .letter { font-size: 36px; font-weight: 700; line-height: 1; }
      .hdr .center .cod { font-size: 11px; margin-top: 2px; }
      .hdr .right h3 { text-align: center; font-size: 18px; margin: 0 0 4px 0; }
      .hdr .right p { margin: 0; line-height: 1.35; }

      /* --- Bands --- */
      .band { display: flex; justify-content: space-between; gap: 8px; }

      /* --- Client --- */
      .client-row { display: grid; grid-template-columns: 30% 70%; gap: 8px; }
      .client-row + .client-row { margin-top: 6px; }

      /* --- Tables --- */
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #000; padding: 6px; }
      th { font-weight: 700; background: transparent; } /* sin grises */

      /* --- Totals --- */
      .totals { width: 50%; margin-left: auto; }
      .totals td { padding: 6px; }
      .totals tr td:first-child { font-weight: 700; }

      /* --- Footer --- */
      .foot { display: grid; grid-template-columns: 2fr 1.5fr; gap: 8px; align-items: start; }
      .foot-note { font-size: 10px; font-style: italic; font-weight: 700; margin: 6px 0 0 0; }

      /* --- Page title "ORIGINAL" --- */
      .copy-title { text-align: center; font-weight: 700; border: 1px solid #000; border-bottom: 0; padding: 6px; }

      /* --- Avoid breaks inside key blocks --- */
      .box, .box-tight, .hdr, .totals, table { page-break-inside: avoid; }
    </style>
  </head>
  <body>
    <div class="copy-title">ORIGINAL</div>

    <!-- Header -->
    <section class="hdr">
      <div class="brand box">
        <h2>${voucher?.issuerName || 'LOBO CARLOS ALBERTO'}</h2>
        <p><b>Razón Social:</b> ${voucher?.issuerName || 'LOBO CARLOS ALBERTO'}</p>
        <p><b>Domicilio Comercial:</b> ${voucher?.issuerAddress || 'Castulo Peña 1374 - Jesús María, Córdoba '}</p>
        <p><b>Condición frente al IVA:</b> ${voucher?.issuerIvaCondition || 'Iva Responsable Inscripto'}</p>
      </div>

      <div class="center">
        <div class="letter">${letra}</div>
        <div class="cod">COD. ${cod}</div>
      </div>

      <div class="right box">
        <h3>${titulo}</h3>
        <p><b>Punto de Venta:</b> ${voucher?.pointOfSale ?? '-'}</p>
        <p><b>Comp. Nro:</b> ${voucher?.voucherNumber ?? '-'}</p>
        <p><b>Fecha de Emisión:</b> ${voucher?.emissionDate ? formatDate(voucher.emissionDate) : '-'}</p>
        <p><b>CUIT:</b> ${voucher?.issuerCuit ?? '20169658146'}</p>
        <p><b>Ingresos Brutos:</b> ${voucher?.issuerIibb ?? '270197035'}</p>
        <p><b>Inicio Activ.:</b> ${voucher?.issuerStartDate ?? '01/04/2000'}</p>
      </div>
    </section>

    <!-- Period -->
    <section class="box band mt-8">
      <div><b>Período Facturado Desde:</b> ${voucher?.periodFrom ? formatDate(voucher.periodFrom) : formatDate(voucher.emissionDate)}</div>
      <div><b>Hasta:</b> ${voucher?.periodTo ? formatDate(voucher.periodTo) : formatDate(voucher.emissionDate)}</div>
      <div><b>Fecha de Vto. para el pago:</b> ${voucher?.dueDate ? formatDate(voucher.dueDate) : formatDate(voucher.emissionDate)}</div>
    </section>

    <!-- Client -->
    <section class="box mt-8">
      <div class="client-row">
        <div><b>CUIT/DNI:</b> ${contact?.documentNumber || '-'}</div>
        <div><b>Apellido y Nombre / Razón Social:</b> ${contact?.name || '-'}</div>
      </div>
      <div class="client-row">
        <div><b>Condición frente al IVA:</b> ${contact?.ivaCondition || 'CONSUMIDOR FINAL'}</div>
        <div><b>Domicilio:</b> ${contact?.address || '-'}</div>
      </div>
      <div class="client-row">
        ${letra !== 'P' ? `<div><b>Condición de venta:</b> ${voucher.conditionPayment === 'CREDIT' ? 'Crédito' : 'Contado'}</div>` : ''}
        <div></div>
      </div>
    </section>

    <!-- Items -->
    <section class="mt-8">
      <table>
        <thead>
          <tr>
            <th class="t-left">Código</th>
            <th class="t-left">Producto / Servicio</th>
            <th>Cantidad</th>
            <th>U. Medida</th>
            <th>Precio Unit.</th>
            <th>% Bonif</th>
            <th>Subtotal</th>
            <th>Alicuota IVA</th>
          </tr>
        </thead>
        <tbody>
          ${productsHtml ||
            `
            <tr>
              <td class="t-left">-</td>
              <td class="t-left">-</td>
              <td class="t-right">0,00</td>
              <td class="t-right">0,00</td>
              <td class="t-center">0,00</td>
              <td class="t-center">-</td>
            </tr>`}
        </tbody>
      </table>
    </section>

    <!-- Totals -->
    <section class="mt-8">
      <table class="totals box-tight">
        <tbody>
          ${netoBlock}
          ${ivaBlock}
          <tr><td>Total</td><td class="t-right"><b>$ ${money(total)}</b></td></tr>
          <tr><td>Pagado</td><td class="t-right">$ ${money(paid)}</td></tr>
          <tr><td>Saldo</td><td class="t-right">$ ${paid > total ? 0 : money(remaining)}</td></tr>
        </tbody>
      </table>
    </section>

    <!-- Footer -->
    <section class="box mt-12 foot">
      <div>
        ${letra === 'P' ? '<div class="bold">Comprobante Autorizado</div>' : '<div class="bold">Comprobante No Autorizado</div>'}
        <p class="foot-note">Esta Administración Federal no se responsabiliza por los datos ingresados en el detalle de la operación</p>
      </div>
      <div>
        <table>
          <tr><td><b>CAE N°</b></td><td class="t-right">${voucher?.arcaCae || '-'}</td></tr>
          <tr><td><b>Fecha de Vto. de CAE</b></td><td class="t-right">${voucher?.arcaDueDate || '-'}</td></tr>
        </table>
        <div class="t-center mt-8">Pág 1/1</div>
      </div>
    </section>
  </body>
  </html>`;
    }
    async generateVoucherHtml(voucherId) {
        try {
            const voucher = await this.eVoucher.findUnique({
                where: { id: voucherId },
                include: { products: true, Payments: true },
            });
            if (!voucher)
                throw new Error('No se encontró el comprobante');
            let contact = null;
            if (voucher.contactId) {
                try {
                    contact = await (0, rxjs_1.firstValueFrom)(this.client.send({ cmd: 'find_one_contact' }, voucher.contactId));
                }
                catch (err) {
                    console.warn(`[WARN] No se pudo obtener el contacto: ${err.message}`);
                }
            }
            return await this.buildHtml({ voucher, contact });
        }
        catch (error) {
            console.error(`[ERROR] Error al generar el HTML del comprobante: ${error.message}`);
            throw new microservices_1.RpcException('Error al generar el HTML del comprobante');
        }
    }
    async deleteVoucherAll() {
        const voucher = await this.eVoucher.deleteMany();
        return 'Succefully';
    }
};
exports.VouchersService = VouchersService;
exports.VouchersService = VouchersService = VouchersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(config_1.NATS_SERVICE)),
    __metadata("design:paramtypes", [microservices_1.ClientProxy])
], VouchersService);
//# sourceMappingURL=vouchers.service.js.map