"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArcaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("../config");
const fs = require("fs");
const child_process_1 = require("child_process");
const path = require("path");
const axios_1 = require("axios");
const xml2js_1 = require("xml2js");
const voucher_type_enum_1 = require("../enum/voucher-type.enum");
const microservices_1 = require("@nestjs/microservices");
const iva_condition_enum_1 = require("../enum/iva-condition.enum");
let ArcaService = class ArcaService {
    token = null;
    sign = null;
    expirationTime = null;
    pointOfSale = 2;
    _voucherTypeMap = {
        [voucher_type_enum_1.VoucherType.FACTURA_A]: 1,
        [voucher_type_enum_1.VoucherType.FACTURA_B]: 6,
        [voucher_type_enum_1.VoucherType.FACTURA_C]: 11,
        [voucher_type_enum_1.VoucherType.NOTA_CREDITO_A]: 3,
        [voucher_type_enum_1.VoucherType.NOTA_CREDITO_B]: 8,
        [voucher_type_enum_1.VoucherType.NOTA_DEBITO_A]: 2,
        [voucher_type_enum_1.VoucherType.NOTA_DEBITO_B]: 7,
    };
    _ivaConditionMap = {
        [iva_condition_enum_1.IvaCondition.RESPONSABLE_INSCRIPTO]: 1,
        [iva_condition_enum_1.IvaCondition.EXENTO]: 4,
        [iva_condition_enum_1.IvaCondition.CONSUMIDOR_FINAL]: 5,
        [iva_condition_enum_1.IvaCondition.SUJETO_NO_CATEGORIZADO]: 7,
        [iva_condition_enum_1.IvaCondition.PROVEEDOR_DEL_EXTERIOR]: 8,
        [iva_condition_enum_1.IvaCondition.CLIENTE_DEL_EXTERIOR]: 9,
        [iva_condition_enum_1.IvaCondition.IVA_LIBERADO_LEY_19640]: 10,
        [iva_condition_enum_1.IvaCondition.IVA_NO_ALCANZADO]: 15,
        [iva_condition_enum_1.IvaCondition.MONOTRIBUTISTA]: 6,
    };
    _getVoucherCode(voucherType) {
        const code = this._voucherTypeMap[voucherType];
        if (!code) {
            throw new Error(`Tipo de comprobante no soportado: ${voucherType}`);
        }
        return code;
    }
    _getCredentials() {
        const taFilesPath = path.resolve(config_1.envs.taFilesPath);
        const cachePath = path.join(taFilesPath, `ta-wsfe.json`);
        if (!fs.existsSync(cachePath)) {
            throw new Error('No hay credenciales cargadas. Ejecuta loginWithCuit primero.');
        }
        const cached = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
        const now = new Date();
        const expiration = new Date(cached.expirationTime);
        if (now >= expiration) {
            throw new Error('Las credenciales están expiradas. Ejecuta loginWithCuit.');
        }
        return {
            token: cached.token,
            sign: cached.sign,
            expirationTime: expiration.toISOString(),
        };
    }
    async loginWithCuit(service = 'wsfex') {
        const certPath = path.resolve(config_1.envs.certPath);
        const keyPath = path.resolve(config_1.envs.privateKeyPath);
        const taFilesPath = path.resolve(config_1.envs.taFilesPath);
        const cachePath = path.join(taFilesPath, `ta-${service}.json`);
        if (fs.existsSync(cachePath)) {
            const cached = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
            const now = new Date();
            const expiration = new Date(cached.expirationTime);
            if (now < expiration) {
                this.token = cached.token;
                this.sign = cached.sign;
                this.expirationTime = expiration;
                return cached;
            }
        }
        const opensslTest = (0, child_process_1.spawnSync)('openssl', ['version']);
        if (opensslTest.status !== 0) {
            const errMsg = opensslTest.stderr
                ? opensslTest.stderr.toString()
                : 'No se pudo obtener el error de OpenSSL';
            throw new Error(`OpenSSL no está disponible: ${errMsg}`);
        }
        const timestamp = Date.now().toString();
        const traPath = path.join(taFilesPath, `${timestamp}-loginTicketRequest.xml`);
        const cmsDerPath = path.join(taFilesPath, `${timestamp}-loginTicketRequest.cms.der`);
        const cmsBase64Path = cmsDerPath + '.b64';
        const generationTime = new Date(Date.now() - 10 * 60_000).toISOString();
        const expirationTime = new Date(Date.now() + 12 * 60 * 60_000).toISOString();
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
        const signResult = (0, child_process_1.spawnSync)('openssl', [
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
        const encodeResult = (0, child_process_1.spawnSync)('openssl', [
            'base64',
            '-in',
            cmsDerPath,
            '-out',
            cmsBase64Path,
        ]);
        if (encodeResult.status !== 0) {
            throw new Error(`Error codificando CMS: ${encodeResult.stderr.toString()}`);
        }
        const cmsBase64 = fs
            .readFileSync(cmsBase64Path, 'utf8')
            .replace(/\r?\n/g, '');
        const wsaaUrl = config_1.envs.wsaaWsdlHomo.replace('?WSDL', '');
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
        const response = await axios_1.default.post(wsaaUrl, soapEnvelope, {
            headers: { 'Content-Type': 'text/xml', SOAPAction: '' },
        });
        const parsed = await (0, xml2js_1.parseStringPromise)(response.data, {
            tagNameProcessors: [xml2js_1.processors.stripPrefix],
        });
        const loginCmsReturn = parsed.Envelope?.Body?.[0]?.loginCmsResponse?.[0]?.loginCmsReturn?.[0];
        if (!loginCmsReturn) {
            throw new Error('No se encontró loginCmsReturn en la respuesta de AFIP');
        }
        const ta = await (0, xml2js_1.parseStringPromise)(loginCmsReturn);
        const token = ta.loginTicketResponse.credentials[0].token[0];
        const sign = ta.loginTicketResponse.credentials[0].sign[0];
        const expiration = ta.loginTicketResponse.header[0].expirationTime[0];
        this.token = token;
        this.sign = sign;
        this.expirationTime = new Date(expiration);
        console.log(token);
        const result = { token, sign, expirationTime: expiration };
        fs.mkdirSync(taFilesPath, { recursive: true });
        fs.writeFileSync(cachePath, JSON.stringify(result, null, 2), 'utf-8');
        return result;
    }
    async getNextInvoiceNumber(cuil, voucherType) {
        try {
            const { token, sign } = this._getCredentials();
            const cbteTipo = this._getVoucherCode(voucherType);
            const endpoint = config_1.envs.wsfeWsdlHomo;
            const wsfeUrl = endpoint.replace('?WSDL', '');
            const requestXml = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ar="http://ar.gov.afip.dif.FEV1/">
        <soapenv:Header/>
        <soapenv:Body>
          <ar:FECompUltimoAutorizado>
            <ar:Auth>
              <ar:Token>${token}</ar:Token>
              <ar:Sign>${sign}</ar:Sign>
              <ar:Cuit>${config_1.envs.cuit}</ar:Cuit>
            </ar:Auth>
            <ar:PtoVta>${this.pointOfSale}</ar:PtoVta>
            <ar:CbteTipo>${cbteTipo}</ar:CbteTipo>
          </ar:FECompUltimoAutorizado>
        </soapenv:Body>
      </soapenv:Envelope>
    `.trim();
            const response = await axios_1.default.post(wsfeUrl, requestXml, {
                headers: {
                    'Content-Type': 'text/xml',
                    SOAPAction: 'http://ar.gov.afip.dif.FEV1/FECompUltimoAutorizado',
                },
                timeout: 10000,
            });
            console.log(response.data);
            const parsed = await (0, xml2js_1.parseStringPromise)(response.data, {
                tagNameProcessors: [xml2js_1.processors.stripPrefix],
                explicitArray: false,
            });
            const body = parsed.Envelope?.Body;
            if (!body) {
                throw new Error('Respuesta inválida: No se encontró el cuerpo SOAP');
            }
            if (body.Fault) {
                const fault = body.Fault;
                const faultString = fault.faultstring || 'Error desconocido de AFIP';
                throw new microservices_1.RpcException({
                    message: `Error AFIP: ${faultString}`,
                    status: common_1.HttpStatus.BAD_REQUEST,
                });
            }
            const result = body.FECompUltimoAutorizadoResponse?.FECompUltimoAutorizadoResult;
            if (!result) {
                throw new microservices_1.RpcException({
                    message: 'No se pudo obtener el resultado de AFIP',
                    status: common_1.HttpStatus.BAD_REQUEST,
                });
            }
            if (result.Errors?.Err) {
                const err = result.Errors.Err;
                throw new microservices_1.RpcException({
                    message: `AFIP Error ${err.Code}: ${err.Msg}`,
                    status: common_1.HttpStatus.BAD_REQUEST,
                });
            }
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
        }
        catch (error) {
            if (error instanceof microservices_1.RpcException) {
                throw error;
            }
            if (error.isAxiosError) {
                throw new microservices_1.RpcException({
                    message: 'Error de red al comunicarse con AFIP: ' + error.message,
                    status: common_1.HttpStatus.GATEWAY_TIMEOUT,
                });
            }
            throw new microservices_1.RpcException({
                message: error.message || 'Error desconocido',
                status: common_1.HttpStatus.BAD_REQUEST,
            });
        }
    }
    async emitVoucher(dto) {
        try {
            const { token, sign } = this._getCredentials();
            const cbteTipo = this._getVoucherCode(dto.voucherType);
            const cuil = config_1.envs.cuit;
            const isTypeC = [11, 12, 13].includes(cbteTipo);
            const ivaAmount = isTypeC ? 0 : dto.ivaAmount || 0;
            const impTotal = dto.netAmount + ivaAmount;
            const ivaCondition = this._ivaConditionMap[dto.ivaCondition];
            const wsfeUrl = config_1.envs.wsfeWsdlHomo.replace('?WSDL', '');
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
                ? ''
                : `
    <ar:Iva>
      <ar:AlicIva>
        <ar:Id>${dto.ivaAmount && dto.ivaAmount > 0 ? 5 : 3}</ar:Id>
        <ar:BaseImp>${dto.netAmount.toFixed(2)}</ar:BaseImp>
        <ar:Importe>${dto.ivaAmount?.toFixed(2) || '0.00'}</ar:Importe>
      </ar:AlicIva>
    </ar:Iva>`;
            const cbteAsocXml = dto.associatedVoucherNumber && dto.associatedVoucherType
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
            const response = await axios_1.default.post(wsfeUrl, requestXml, {
                headers: {
                    'Content-Type': 'text/xml',
                    SOAPAction: 'http://ar.gov.afip.dif.FEV1/FECAESolicitar',
                },
                timeout: 10000,
            });
            const parsed = await (0, xml2js_1.parseStringPromise)(response.data, {
                tagNameProcessors: [xml2js_1.processors.stripPrefix],
                explicitArray: false,
            });
            const result = parsed.Envelope?.Body?.FECAESolicitarResponse?.FECAESolicitarResult;
            const detResp = result?.FeDetResp?.FECAEDetResponse;
            const err = result?.Errors?.Err;
            let observations = [];
            if (detResp?.Observaciones?.Obs) {
                if (Array.isArray(detResp.Observaciones.Obs)) {
                    observations = detResp.Observaciones.Obs.map((o) => ({
                        Code: o.Code,
                        Msg: o.Msg,
                    }));
                }
                else {
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
        }
        catch (error) {
            console.error('[ARCA ERROR]', error);
            return {
                status: `[ARCA_EMIT] Problema con cargar el comprobante en ARCA: ${error}`,
                message: error.message || 'Error al emitir comprobante',
            };
        }
    }
};
exports.ArcaService = ArcaService;
exports.ArcaService = ArcaService = __decorate([
    (0, common_1.Injectable)()
], ArcaService);
//# sourceMappingURL=arca.service.js.map