import { VoucherType } from 'src/enum/voucher-type.enum';
import { CreateVocuherDto } from './dto/create-voucher.dto';
export declare class ArcaService {
    private token;
    private sign;
    private expirationTime;
    private pointOfSale;
    private _dniToPossibleCuits;
    private _voucherTypeMap;
    private _ivaConditionMap;
    private _getVoucherCode;
    private _getCredentials;
    getContribuyenteData(): Promise<any>;
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
    getCuitByDni(dni: string): Promise<{
        dni: string;
        cuit: string;
        persona: any;
    }>;
}
