import { HttpStatus, Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import * as fs from 'fs';
import { spawnSync } from 'child_process';
import * as path from 'path';
import axios from 'axios';
import { parseStringPromise, processors } from 'xml2js';
import { VoucherType } from 'src/enum/voucher-type.enum';
import { RpcException } from '@nestjs/microservices';
import { CreateVocuherDto } from './dto/create-voucher.dto';
import { IvaCondition } from 'src/enum/iva-condition.enum';

@Injectable()
export class ArcaService {
  private token: string | null = null;
  private sign: string | null = null;
  private expirationTime: Date | null = null;

  private pointOfSale = 3;

  private _voucherTypeMap: Record<VoucherType, number> = {
    [VoucherType.FACTURA_A]: 1,
    [VoucherType.FACTURA_B]: 6,
    [VoucherType.FACTURA_C]: 11,
    [VoucherType.NOTA_CREDITO_A]: 3,
    [VoucherType.NOTA_CREDITO_B]: 8,
    [VoucherType.NOTA_DEBITO_A]: 2,
    [VoucherType.NOTA_DEBITO_B]: 7,
  };

  private _ivaConditionMap: Record<IvaCondition, number> = {
    [IvaCondition.RESPONSABLE_INSCRIPTO]: 1, // IVA Responsable Inscripto
    [IvaCondition.EXENTO]: 4, // IVA Sujeto Exento
    [IvaCondition.CONSUMIDOR_FINAL]: 5, // Consumidor Final
    [IvaCondition.SUJETO_NO_CATEGORIZADO]: 7, // Sujeto No Categorizado
    [IvaCondition.PROVEEDOR_DEL_EXTERIOR]: 8, // Proveedor del Exterior
    [IvaCondition.CLIENTE_DEL_EXTERIOR]: 9, // Cliente del Exterior
    [IvaCondition.IVA_LIBERADO_LEY_19640]: 10, // IVA Liberado – Ley N° 19.640
    [IvaCondition.IVA_NO_ALCANZADO]: 15, // IVA No Alcanzado
    [IvaCondition.MONOTRIBUTISTA]: 6, // Responsable Monotributo
    // [IvaCondition.MONOTRIBUTISTA_SOCIAL]: 13, // Monotributista Social
    // [IvaCondition.MONOTRIBUTO_PROMOVIDO]: 16, // Monotributo Trabajador Independiente Promovido
  };

  private _getVoucherCode(voucherType: VoucherType): number {
    const code = this._voucherTypeMap[voucherType];
    if (!code) {
      throw new Error(`Tipo de comprobante no soportado: ${voucherType}`);
    }
    return code;
  }

  // 🔹 Método para obtener los valores sin volver a loguear
  private _getCredentials() {
    const taFilesPath = path.resolve(envs.taFilesPath);
    const cachePath = path.join(taFilesPath, `ta-wsfe.json`); // asumí que usas el servicio 'wsfe' para la cache

    if (!fs.existsSync(cachePath)) {
      throw new Error(
        'No hay credenciales cargadas. Ejecuta loginWithCuit primero.',
      );
    }

    const cached = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
    const now = new Date();
    const expiration = new Date(cached.expirationTime);

    if (now >= expiration) {
      throw new Error(
        'Las credenciales están expiradas. Ejecuta loginWithCuit.',
      );
    }

    return {
      token: cached.token,
      sign: cached.sign,
      expirationTime: expiration.toISOString(),
    };
  }

  async loginWithCuit(service = 'wsfex'): Promise<{
    token: string;
    sign: string;
    expirationTime: string;
  }> {
    const certPath = path.resolve(envs.certPath);
    const keyPath = path.resolve(envs.privateKeyPath);
    const taFilesPath = path.resolve(envs.taFilesPath);
    const cachePath = path.join(taFilesPath, `ta-${service}.json`);

    // ✅ Verificar si ya hay un TA vigente
    if (fs.existsSync(cachePath)) {
      const cached = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
      const now = new Date();
      const expiration = new Date(cached.expirationTime);

      if (now < expiration) {
        // Asignar a propiedades privadas
        this.token = cached.token;
        this.sign = cached.sign;
        this.expirationTime = expiration;
        return cached;
      }
    }

    // Verificar OpenSSL
    const opensslTest = spawnSync('openssl', ['version']);
    if (opensslTest.status !== 0) {
      const errMsg = opensslTest.stderr
        ? opensslTest.stderr.toString()
        : 'No se pudo obtener el error de OpenSSL';
      throw new Error(`OpenSSL no está disponible: ${errMsg}`);
    }

    const timestamp = Date.now().toString();
    const traPath = path.join(
      taFilesPath,
      `${timestamp}-loginTicketRequest.xml`,
    );
    const cmsDerPath = path.join(
      taFilesPath,
      `${timestamp}-loginTicketRequest.cms.der`,
    );
    const cmsBase64Path = cmsDerPath + '.b64';

    const generationTime = new Date(Date.now() - 10 * 60_000).toISOString();
    const expirationTime = new Date(
      Date.now() + 12 * 60 * 60_000,
    ).toISOString();
    const uniqueId = Math.floor(Date.now() / 1000).toString();

    const traXml = `
      <loginTicketRequest>
        <header>
          <uniqueId>${uniqueId}</uniqueId>
          <generationTime>${generationTime}</generationTime>
          <expirationTime>${expirationTime}</expirationTime>
        </header>
        <service>${service}</service>
      </loginTicketRequest>
    `.trim();

    fs.writeFileSync(traPath, traXml);

    const signResult = spawnSync('openssl', [
      'cms',
      '-sign',
      '-in',
      traPath,
      '-signer',
      certPath,
      '-inkey',
      keyPath,
      '-nodetach',
      '-outform',
      'DER',
      '-out',
      cmsDerPath,
    ]);
    if (signResult.status !== 0) {
      throw new Error(`Error firmando CMS: ${signResult.stderr.toString()}`);
    }

    const encodeResult = spawnSync('openssl', [
      'base64',
      '-in',
      cmsDerPath,
      '-out',
      cmsBase64Path,
    ]);
    if (encodeResult.status !== 0) {
      throw new Error(
        `Error codificando CMS: ${encodeResult.stderr.toString()}`,
      );
    }

    const cmsBase64 = fs
      .readFileSync(cmsBase64Path, 'utf8')
      .replace(/\r?\n/g, '');

    const wsaaUrl = envs.wsaaWsdlProd.replace('?WSDL', '');
    const soapEnvelope = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsaa="http://wsaa.view.sua.dvadac.desein.afip.gov/wsaa/">
        <soapenv:Header/>
        <soapenv:Body>
          <wsaa:loginCms>
            <wsaa:in0>${cmsBase64}</wsaa:in0>
          </wsaa:loginCms>
        </soapenv:Body>
      </soapenv:Envelope>
    `.trim();

    const response = await axios.post(wsaaUrl, soapEnvelope, {
      headers: { 'Content-Type': 'text/xml', SOAPAction: '' },
    });

    const parsed = await parseStringPromise(response.data, {
      tagNameProcessors: [processors.stripPrefix],
    });
    const loginCmsReturn =
      parsed.Envelope?.Body?.[0]?.loginCmsResponse?.[0]?.loginCmsReturn?.[0];
    if (!loginCmsReturn) {
      throw new Error('No se encontró loginCmsReturn en la respuesta de AFIP');
    }

    const ta = await parseStringPromise(loginCmsReturn);

    const token = ta.loginTicketResponse.credentials[0].token[0];
    const sign = ta.loginTicketResponse.credentials[0].sign[0];
    const expiration = ta.loginTicketResponse.header[0].expirationTime[0];

    // ✅ Guardar en propiedades privadas
    this.token = token;
    this.sign = sign;
    this.expirationTime = new Date(expiration);
    const result = { token, sign, expirationTime: expiration };

    // ✅ Guardar en cache JSON
    fs.mkdirSync(taFilesPath, { recursive: true });
    fs.writeFileSync(cachePath, JSON.stringify(result, null, 2), 'utf-8');

    return result;
  }

  async getNextInvoiceNumber(
    cuil: number,
    voucherType: VoucherType,
  ): Promise<{ pointOfSale: number; number: number }> {
    try {
      const { token, sign } = this._getCredentials();
      const cbteTipo = this._getVoucherCode(voucherType);
      const endpoint = envs.wsfeWsdlProd;
      const wsfeUrl = endpoint.replace('?WSDL', '');

      const requestXml = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ar="http://ar.gov.afip.dif.FEV1/">
        <soapenv:Header/>
        <soapenv:Body>
          <ar:FECompUltimoAutorizado>
            <ar:Auth>
              <ar:Token>${token}</ar:Token>
              <ar:Sign>${sign}</ar:Sign>
              <ar:Cuit>${envs.cuit}</ar:Cuit>
            </ar:Auth>
            <ar:PtoVta>${this.pointOfSale}</ar:PtoVta>
            <ar:CbteTipo>${cbteTipo}</ar:CbteTipo>
          </ar:FECompUltimoAutorizado>
        </soapenv:Body>
      </soapenv:Envelope>
    `.trim();

      const response = await axios.post(wsfeUrl, requestXml, {
        headers: {
          'Content-Type': 'text/xml',
          SOAPAction: 'http://ar.gov.afip.dif.FEV1/FECompUltimoAutorizado',
        },
        timeout: 10000,
      });
      console.log(response.data);

      const parsed = await parseStringPromise(response.data, {
        tagNameProcessors: [processors.stripPrefix],
        explicitArray: false,
      });

      const body = parsed.Envelope?.Body;
      if (!body) {
        throw new Error('Respuesta inválida: No se encontró el cuerpo SOAP');
      }

      if (body.Fault) {
        const fault = body.Fault;
        const faultString = fault.faultstring || 'Error desconocido de AFIP';
        throw new RpcException({
          message: `Error AFIP: ${faultString}`,
          status: HttpStatus.BAD_REQUEST,
        });
      }

      const result =
        body.FECompUltimoAutorizadoResponse?.FECompUltimoAutorizadoResult;
      if (!result) {
        throw new RpcException({
          message: 'No se pudo obtener el resultado de AFIP',
          status: HttpStatus.BAD_REQUEST,
        });
      }

      // Manejo de errores internos de AFIP
      if (result.Errors?.Err) {
        const err = result.Errors.Err;
        throw new RpcException({
          message: `AFIP Error ${err.Code}: ${err.Msg}`,
          status: HttpStatus.BAD_REQUEST,
        });
      }

      // Logging de eventos informativos
      if (result.Events?.Evt) {
        const evt = result.Events.Evt;
        console.warn(`AFIP Event ${evt.Code}: ${evt.Msg}`);
      }

      const lastNumber = parseInt(result.CbteNro, 10);
      const nextNumber = lastNumber === 0 ? 1 : lastNumber + 1;

      return {
        pointOfSale: this.pointOfSale,
        number: nextNumber,
      };
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }

      if (error.isAxiosError) {
        throw new RpcException({
          message: 'Error de red al comunicarse con AFIP: ' + error.message,
          status: HttpStatus.GATEWAY_TIMEOUT,
        });
      }

      throw new RpcException({
        message: error.message || 'Error desconocido',
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  async emitVoucher(dto: CreateVocuherDto): Promise<any> {
    try {
      const { token, sign } = this._getCredentials();
      const cbteTipo = this._getVoucherCode(dto.voucherType);
      const cuil = envs.cuit;
      const isTypeC = [11, 12, 13].includes(cbteTipo); // Facturas y notas C
      const ivaAmount = isTypeC ? 0 : dto.ivaAmount || 0;
      const impTotal = dto.netAmount + ivaAmount;
      const ivaCondition = this._ivaConditionMap[dto.ivaCondition];

      const wsfeUrl = envs.wsfeWsdlProd.replace('?WSDL', '');
      const docNroXml = dto.contactCuil
        ? `<ar:DocNro>${dto.contactCuil}</ar:DocNro>`
        : '';

      const ivaCondXml = ivaCondition
        ? `<ar:CondicionIVAReceptorId>${ivaCondition}</ar:CondicionIVAReceptorId>`
        : '<ar:CondicionIVAReceptorId>5</ar:CondicionIVAReceptorId>';

      const impIvaXml = isTypeC
        ? '<ar:ImpIVA>0.00</ar:ImpIVA>'
        : `<ar:ImpIVA>${dto.ivaAmount?.toFixed(2) || '0.00'}</ar:ImpIVA>`;

      const ivaBlockXml = isTypeC
        ? '' // comprobantes tipo C no llevan IVA
        : `
    <ar:Iva>
      <ar:AlicIva>
        <ar:Id>${dto.ivaAmount && dto.ivaAmount > 0 ? 5 : 3}</ar:Id>
        <ar:BaseImp>${dto.netAmount.toFixed(2)}</ar:BaseImp>
        <ar:Importe>${dto.ivaAmount?.toFixed(2) || '0.00'}</ar:Importe>
      </ar:AlicIva>
    </ar:Iva>`;

      const cbteAsocXml =
        dto.associatedVoucherNumber && dto.associatedVoucherType
          ? `
    <ar:CbtesAsoc>
      <ar:CbteAsoc>
        <ar:Tipo>${this._getVoucherCode(dto.associatedVoucherType)}</ar:Tipo>
        <ar:PtoVta>${dto.pointOfSale}</ar:PtoVta> <!-- si querés lo podés hardcodear -->
        <ar:Nro>${dto.associatedVoucherNumber}</ar:Nro>
      </ar:CbteAsoc>
    </ar:CbtesAsoc>`
          : '';

      const requestXml = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ar="http://ar.gov.afip.dif.FEV1/">
  <soapenv:Header/>
  <soapenv:Body>
    <ar:FECAESolicitar>
      <ar:Auth>
        <ar:Token>${token}</ar:Token>
        <ar:Sign>${sign}</ar:Sign>
        <ar:Cuit>${cuil}</ar:Cuit>
      </ar:Auth>
      <ar:FeCAEReq>
        <ar:FeCabReq>
          <ar:CantReg>1</ar:CantReg>
          <ar:PtoVta>${dto.pointOfSale}</ar:PtoVta>
          <ar:CbteTipo>${cbteTipo}</ar:CbteTipo>
        </ar:FeCabReq>
        <ar:FeDetReq>
          <ar:FECAEDetRequest>
            <ar:Concepto>1</ar:Concepto>
            <ar:DocTipo>${dto.contactCuil ? 80 : 99}</ar:DocTipo>
            ${docNroXml}
            <ar:CbteDesde>${dto.voucherNumber}</ar:CbteDesde>
            <ar:CbteHasta>${dto.voucherNumber}</ar:CbteHasta>
            <ar:CbteFch>${dto.emissionDate}</ar:CbteFch>
            <ar:ImpTotal>${impTotal.toFixed(2)}</ar:ImpTotal>
            <ar:ImpNeto>${dto.netAmount.toFixed(2)}</ar:ImpNeto>
            ${impIvaXml}
            <ar:MonId>${dto.currency || 'PES'}</ar:MonId>
            <ar:MonCotiz>1</ar:MonCotiz>
            ${ivaCondXml}
            ${ivaBlockXml}
            ${cbteAsocXml}
          </ar:FECAEDetRequest>
        </ar:FeDetReq>
      </ar:FeCAEReq>
    </ar:FECAESolicitar>
  </soapenv:Body>
</soapenv:Envelope>
`.trim();

      const response = await axios.post(wsfeUrl, requestXml, {
        headers: {
          'Content-Type': 'text/xml',
          SOAPAction: 'http://ar.gov.afip.dif.FEV1/FECAESolicitar',
        },
        timeout: 10000,
      });

      const parsed = await parseStringPromise(response.data, {
        tagNameProcessors: [processors.stripPrefix],
        explicitArray: false,
      });

      const result =
        parsed.Envelope?.Body?.FECAESolicitarResponse?.FECAESolicitarResult;
      const detResp = result?.FeDetResp?.FECAEDetResponse;
      const err = result?.Errors?.Err;

      let observations: Array<{ Code: string; Msg: string }> = [];
      if (detResp?.Observaciones?.Obs) {
        if (Array.isArray(detResp.Observaciones.Obs)) {
          observations = detResp.Observaciones.Obs.map((o) => ({
            Code: o.Code,
            Msg: o.Msg,
          }));
        } else {
          observations = [
            {
              Code: detResp.Observaciones.Obs.Code,
              Msg: detResp.Observaciones.Obs.Msg,
            },
          ];
        }
      }

      if (detResp?.Resultado === 'R') {
        return {
          status: 'REJECTED',
          errors: observations,
          afipError: err ? { Code: err.Code, Msg: err.Msg } : undefined,
        };
      }

      return {
        cae: detResp?.CAE,
        caeFchVto: detResp?.CAEFchVto,
        voucherNumber: dto.voucherNumber,
        pointOfSale: dto.pointOfSale,
      };
    } catch (error) {
      console.error('[ARCA ERROR]', error);
      return {
        status: `[ARCA_EMIT] Problema con cargar el comprobante en ARCA: ${error}`,
        message: error.message || 'Error al emitir comprobante',
      };
    }
  }
}
