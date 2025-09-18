import { ConditionPayment } from '@prisma/client';
import { VoucherType } from 'src/enum';
export declare class PaginationDto {
    conditionPayment: ConditionPayment;
    limit: number;
    offset: number;
    query?: string;
    type?: VoucherType;
    constructor(partial?: Partial<PaginationDto>);
}
