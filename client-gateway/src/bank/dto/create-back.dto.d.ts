import { Currency } from 'src/enum';
export declare class CreateBankDto {
    name: string;
    account?: string;
    cbu?: string;
    currency: Currency;
    available: boolean;
}
