import { VoucherType } from 'src/enum/voucher-type.enum';
import { CreateVocuherDto } from './dto/create-voucher.dto';
export declare class ArcaService {
    private token;
    private sign;
    private expirationTime;
    private pointOfSale;
    private _voucherTypeMap;
    private _ivaConditionMap;
    private _getVoucherCode;
    private _getCredentials;
    getContribuyenteData(cuit: number): Promise<{
        cuit: any;
        razonSocial: any;
        tipoPersona: any;
        domicilio: any;
        localidad: any;
        provincia: any;
        codigoPostal: any;
        condicionIVA: string;
        ingresosBrutos: any;
        inicioActividades: any;
    }>;
    loginWithCuit(service?: string): Promise<{
        token: string;
        sign: string;
        expirationTime: string;
    }>;
    getNextInvoiceNumber(cuil: number, voucherType: VoucherType): Promise<{
        pointOfSale: number;
        number: number;
    }>;
    emitVoucher(dto: CreateVocuherDto): Promise<any>;
}
