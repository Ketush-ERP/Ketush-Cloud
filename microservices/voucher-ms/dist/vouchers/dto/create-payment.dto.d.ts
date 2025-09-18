import { Currency } from '@prisma/client';
import { PaymentMethod } from 'src/enum/payment-method.enum';
export declare class CreatePaymentDto {
    method: PaymentMethod;
    amount: number;
    currency: Currency;
    exchangeRate?: number;
    originalAmount?: number;
    receivedAt?: Date;
    receivedBy?: string;
    bankId?: string;
    cardId?: string;
    chequeNumber?: string;
    chequeDueDate?: Date;
    chequeStatus?: string;
    voucherId: string;
}
