import { ArcaService } from './arca.service';
import { VoucherType } from 'src/enum/voucher-type.enum';
import { CreateVocuherDto } from './dto/create-voucher.dto';
export declare class ArcaController {
    private readonly arcaService;
    constructor(arcaService: ArcaService);
    getContribuyenteData(): Promise<any>;
    getPadronTheClient(dni: string): Promise<{
        dni: string;
        cuit: string;
        persona: any;
    }>;
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
    emitInvoice(dto: CreateVocuherDto): Promise<any>;
}
