import { Currency } from '@prisma/client';
import { VoucherProductItemDto } from './voucher-product-item.dto';
import { CreateInitialPaymentDto } from './initial-payment.dto';
import { VoucherType } from 'src/enum';
export declare class CreateVoucherDto {
    cuil: number;
    pointOfSale: number;
    voucherNumber: number;
    type: VoucherType;
    emissionDate: Date;
    dueDate: Date;
    contactId: string;
    currency: Currency;
    products: VoucherProductItemDto[];
    totalAmount: number;
    paidAmount: number;
    observation: string;
    available: boolean;
    loadToArca: boolean;
    initialPayment: CreateInitialPaymentDto[];
    associatedVoucherNumber: number;
    associatedVoucherType: VoucherType;
}
