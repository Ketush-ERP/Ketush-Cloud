import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { PaginationDto } from './dto/pagination.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class VouchersController {
    private readonly vouchersService;
    constructor(vouchersService: VouchersService);
    generateVoucherPdf(voucherId: string): Promise<string>;
    create(createVoucherDto: CreateVoucherDto): Promise<{
        contactId: string | null;
        id: string;
        arcaCae: string | null;
        arcaDueDate: string | null;
        type: import(".prisma/client").$Enums.VoucherType;
        pointOfSale: number;
        voucherNumber: number;
        emissionDate: Date;
        dueDate: Date | null;
        status: import(".prisma/client").$Enums.VoucherStatus;
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
    } | {
        status: import("@nestjs/common").HttpStatus;
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
            contactId: string | null;
            id: string;
            arcaCae: string | null;
            arcaDueDate: string | null;
            type: import(".prisma/client").$Enums.VoucherType;
            pointOfSale: number;
            voucherNumber: number;
            emissionDate: Date;
            dueDate: Date | null;
            status: import(".prisma/client").$Enums.VoucherStatus;
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
        })[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
        status?: undefined;
        message?: undefined;
    } | {
        status: import("@nestjs/common").HttpStatus;
        message: string;
        data?: undefined;
        meta?: undefined;
    }>;
    findOne(payload: {
        id: string;
    }): Promise<({
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
        contactId: string | null;
        id: string;
        arcaCae: string | null;
        arcaDueDate: string | null;
        type: import(".prisma/client").$Enums.VoucherType;
        pointOfSale: number;
        voucherNumber: number;
        emissionDate: Date;
        dueDate: Date | null;
        status: import(".prisma/client").$Enums.VoucherStatus;
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
    }) | {
        status: import("@nestjs/common").HttpStatus;
        message: string;
    }>;
    registerPayment(createPaymentDto: CreatePaymentDto): Promise<{
        status: import("@nestjs/common").HttpStatus;
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
    deleteAll(): Promise<string>;
    deleteOne(payload: {
        id: string;
    }): Promise<string>;
}
