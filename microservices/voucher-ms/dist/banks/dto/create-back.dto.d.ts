import { Currency } from '@prisma/client';
export declare class CreateBankDto {
    name: string;
    account?: string;
    cbu?: string;
    currency: Currency;
    available: boolean;
}
