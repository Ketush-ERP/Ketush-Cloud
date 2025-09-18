import { ArcaService } from './arca.service';
import { VoucherType } from 'src/enum/voucher-type.enum';
export declare class ArcaController {
    private readonly arcaService;
    constructor(arcaService: ArcaService);
    login(): Promise<{
        token: string;
        sign: string;
        expirationTime: string;
    }>;
    getNextInvoice(data: {
        cuil: number;
        voucherType: VoucherType;
    }): Promise<{
        pointOfSale: number;
        number: number;
    }>;
    emitInvoice(dto: any): Promise<any>;
}
