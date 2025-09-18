import { CreateBankDto } from './create-back.dto';
declare const UpdateBankDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateBankDto>>;
export declare class UpdateBankDto extends UpdateBankDto_base {
    id: string;
}
export {};
