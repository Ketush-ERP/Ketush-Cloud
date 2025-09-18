import { BanksService } from './banks.service';
import { CreateBankDto } from './dto/create-back.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
export declare class BanksController {
    private readonly banksService;
    constructor(banksService: BanksService);
    create(createBankDto: CreateBankDto): Promise<{
        id: string;
        currency: import(".prisma/client").$Enums.Currency;
        available: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        account: string | null;
        cbu: string | null;
    } | {
        status: import("@nestjs/common").HttpStatus;
        message: string;
    }>;
    findAll(): Promise<{
        id: string;
        currency: import(".prisma/client").$Enums.Currency;
        available: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        account: string | null;
        cbu: string | null;
    }[] | {
        status: import("@nestjs/common").HttpStatus;
        message: string;
    }>;
    findOne(payload: any): Promise<{
        id: string;
        currency: import(".prisma/client").$Enums.Currency;
        available: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        account: string | null;
        cbu: string | null;
    } | {
        status: import("@nestjs/common").HttpStatus;
        message: string;
    } | null>;
    update(updateBankDto: UpdateBankDto): Promise<{
        id: string;
        currency: import(".prisma/client").$Enums.Currency;
        available: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        account: string | null;
        cbu: string | null;
    } | {
        status: import("@nestjs/common").HttpStatus;
        message: string;
    }>;
}
