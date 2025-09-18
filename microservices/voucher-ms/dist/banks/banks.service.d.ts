import { HttpStatus, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateBankDto } from './dto/create-back.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
export declare class BanksService extends PrismaClient implements OnModuleInit {
    private readonly logger;
    onModuleInit(): void;
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
        status: HttpStatus;
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
        status: HttpStatus;
        message: string;
    }>;
    findOne(id: string): Promise<{
        id: string;
        currency: import(".prisma/client").$Enums.Currency;
        available: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        account: string | null;
        cbu: string | null;
    } | {
        status: HttpStatus;
        message: string;
    } | null>;
    update(id: string, updateBankDto: UpdateBankDto): Promise<{
        id: string;
        currency: import(".prisma/client").$Enums.Currency;
        available: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        account: string | null;
        cbu: string | null;
    } | {
        status: HttpStatus;
        message: string;
    }>;
}
