import { Currency, PaymentMethod } from '@prisma/client';
export declare class CreateInitialPaymentDto {
    method: PaymentMethod;
    amount: number;
    currency: Currency;
    receivedAt?: Date;
    bankId?: string;
    cardId?: string;
}
