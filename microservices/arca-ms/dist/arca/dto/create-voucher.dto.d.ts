import { IvaCondition } from 'src/enum/iva-condition.enum';
import { VoucherType } from 'src/enum/voucher-type.enum';
export declare class CreateVocuherDto {
    cuil: number;
    pointOfSale: number;
    voucherType: VoucherType;
    ivaCondition: IvaCondition;
    voucherNumber: number;
    emissionDate: string;
    contactCuil: number;
    totalAmount: number;
    netAmount: number;
    ivaAmount?: number;
    currency?: string;
    associatedVoucherNumber?: number;
    associatedVoucherType?: VoucherType;
}
