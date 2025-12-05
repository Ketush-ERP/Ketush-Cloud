import { CreateVoucherDto } from './dto/create-voucher.dto';
import { HttpStatus, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from './dto/pagination.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ClientProxy } from '@nestjs/microservices';
export declare class VouchersService extends PrismaClient implements OnModuleInit {
    private readonly client;
    private readonly logger;
    private _normalizeText;
    private _calculateIva;
    onModuleInit(): void;
    constructor(client: ClientProxy);
    private _voucherTypeMap;
    private _generateAfipQr;
    private _loadToArca;
    create(createVoucherDto: CreateVoucherDto): Promise<{
        id: string;
        arcaCae: string | null;
        arcaDueDate: string | null;
        type: import(".prisma/client").$Enums.VoucherType;
        pointOfSale: number;
        voucherNumber: number;
        emissionDate: Date;
        dueDate: Date | null;
        status: import(".prisma/client").$Enums.VoucherStatus;
        contactId: string | null;
        conditionPayment: import(".prisma/client").$Enums.ConditionPayment | null;
        totalAmount: number | null;
        ivaAmount: number | null;
        paidAmount: number;
        observation: string | null;
        available: boolean;
        afipRequestData: import("@prisma/client/runtime/library").JsonValue | null;
        afipResponseData: import("@prisma/client/runtime/library").JsonValue | null;
        associatedVoucherNumber: number | null;
        associatedVoucherType: import(".prisma/client").$Enums.VoucherType | null;
        createdAt: Date;
        updatedAt: Date;
        isLoadedToArca: boolean | null;
    } | {
        status: HttpStatus;
        message: string;
    }>;
    findAllConditionPayment(pagination: PaginationDto): Promise<{
        data: ({
            products: {
                id: string;
                code: string;
                voucherId: string;
                description: string;
                productId: string;
                quantity: number;
                price: number;
            }[];
            Payments: {
                id: string;
                available: boolean;
                createdAt: Date;
                updatedAt: Date;
                currency: import(".prisma/client").$Enums.Currency;
                voucherId: string;
                method: import(".prisma/client").$Enums.PaymentMethod;
                amount: number;
                receivedAt: Date;
                bankId: string | null;
                cardId: string | null;
            }[];
        } & {
            id: string;
            arcaCae: string | null;
            arcaDueDate: string | null;
            type: import(".prisma/client").$Enums.VoucherType;
            pointOfSale: number;
            voucherNumber: number;
            emissionDate: Date;
            dueDate: Date | null;
            status: import(".prisma/client").$Enums.VoucherStatus;
            contactId: string | null;
            conditionPayment: import(".prisma/client").$Enums.ConditionPayment | null;
            totalAmount: number | null;
            ivaAmount: number | null;
            paidAmount: number;
            observation: string | null;
            available: boolean;
            afipRequestData: import("@prisma/client/runtime/library").JsonValue | null;
            afipResponseData: import("@prisma/client/runtime/library").JsonValue | null;
            associatedVoucherNumber: number | null;
            associatedVoucherType: import(".prisma/client").$Enums.VoucherType | null;
            createdAt: Date;
            updatedAt: Date;
            isLoadedToArca: boolean | null;
        })[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
        status?: undefined;
        message?: undefined;
    } | {
        status: HttpStatus;
        message: string;
        data?: undefined;
        meta?: undefined;
    }>;
    findOne(id: string): Promise<({
        products: {
            id: string;
            code: string;
            voucherId: string;
            description: string;
            productId: string;
            quantity: number;
            price: number;
        }[];
        Payments: {
            id: string;
            available: boolean;
            createdAt: Date;
            updatedAt: Date;
            currency: import(".prisma/client").$Enums.Currency;
            voucherId: string;
            method: import(".prisma/client").$Enums.PaymentMethod;
            amount: number;
            receivedAt: Date;
            bankId: string | null;
            cardId: string | null;
        }[];
    } & {
        id: string;
        arcaCae: string | null;
        arcaDueDate: string | null;
        type: import(".prisma/client").$Enums.VoucherType;
        pointOfSale: number;
        voucherNumber: number;
        emissionDate: Date;
        dueDate: Date | null;
        status: import(".prisma/client").$Enums.VoucherStatus;
        contactId: string | null;
        conditionPayment: import(".prisma/client").$Enums.ConditionPayment | null;
        totalAmount: number | null;
        ivaAmount: number | null;
        paidAmount: number;
        observation: string | null;
        available: boolean;
        afipRequestData: import("@prisma/client/runtime/library").JsonValue | null;
        afipResponseData: import("@prisma/client/runtime/library").JsonValue | null;
        associatedVoucherNumber: number | null;
        associatedVoucherType: import(".prisma/client").$Enums.VoucherType | null;
        createdAt: Date;
        updatedAt: Date;
        isLoadedToArca: boolean | null;
    }) | {
        status: HttpStatus;
        message: string;
    }>;
    registerPayment(dto: CreatePaymentDto): Promise<{
        status: HttpStatus;
        message: string;
        success?: undefined;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            id: string;
            available: boolean;
            createdAt: Date;
            updatedAt: Date;
            currency: import(".prisma/client").$Enums.Currency;
            voucherId: string;
            method: import(".prisma/client").$Enums.PaymentMethod;
            amount: number;
            receivedAt: Date;
            bankId: string | null;
            cardId: string | null;
        };
        message: string;
        status?: undefined;
    }>;
    buildHtml({ voucher, contact, padronData }: any): Promise<string>;
    generateVoucherHtml(voucherId: string): Promise<string>;
    deleteVoucherAll(): Promise<string>;
    deleteVoucherFindOne(id: string): Promise<string>;
}
