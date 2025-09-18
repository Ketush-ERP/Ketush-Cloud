import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { PaginationDto } from './dto/pagination.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class VouchersController {
    private readonly vouchersService;
    constructor(vouchersService: VouchersService);
    generateVoucherPdf(voucherId: string): Promise<string>;
    create(createVoucherDto: CreateVoucherDto): Promise<{
        id: string;
        pointOfSale: number;
        voucherNumber: number;
        type: import(".prisma/client").$Enums.VoucherType;
        emissionDate: Date;
        dueDate: Date | null;
        contactId: string | null;
        totalAmount: number | null;
        paidAmount: number;
        observation: string | null;
        available: boolean;
        associatedVoucherNumber: number | null;
        associatedVoucherType: import(".prisma/client").$Enums.VoucherType | null;
        conditionPayment: import(".prisma/client").$Enums.ConditionPayment | null;
        arcaCae: string | null;
        arcaDueDate: string | null;
        status: import(".prisma/client").$Enums.VoucherStatus;
        ivaAmount: number | null;
        afipRequestData: import("@prisma/client/runtime/library").JsonValue | null;
        afipResponseData: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    } | {
        status: import("@nestjs/common").HttpStatus;
        message: string;
    }>;
    findAllConditionPayment(pagination: PaginationDto): Promise<{
        data: ({
            products: {
                productId: string;
                description: string;
                code: string;
                voucherId: string;
                quantity: number;
                price: number;
                id: string;
            }[];
            Payments: {
                voucherId: string;
                id: string;
                method: import(".prisma/client").$Enums.PaymentMethod;
                amount: number;
                currency: import(".prisma/client").$Enums.Currency;
                receivedAt: Date;
                bankId: string | null;
                cardId: string | null;
                available: boolean;
                createdAt: Date;
                updatedAt: Date;
            }[];
        } & {
            id: string;
            pointOfSale: number;
            voucherNumber: number;
            type: import(".prisma/client").$Enums.VoucherType;
            emissionDate: Date;
            dueDate: Date | null;
            contactId: string | null;
            totalAmount: number | null;
            paidAmount: number;
            observation: string | null;
            available: boolean;
            associatedVoucherNumber: number | null;
            associatedVoucherType: import(".prisma/client").$Enums.VoucherType | null;
            conditionPayment: import(".prisma/client").$Enums.ConditionPayment | null;
            arcaCae: string | null;
            arcaDueDate: string | null;
            status: import(".prisma/client").$Enums.VoucherStatus;
            ivaAmount: number | null;
            afipRequestData: import("@prisma/client/runtime/library").JsonValue | null;
            afipResponseData: import("@prisma/client/runtime/library").JsonValue | null;
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
            productId: string;
            description: string;
            code: string;
            voucherId: string;
            quantity: number;
            price: number;
            id: string;
        }[];
        Payments: {
            voucherId: string;
            id: string;
            method: import(".prisma/client").$Enums.PaymentMethod;
            amount: number;
            currency: import(".prisma/client").$Enums.Currency;
            receivedAt: Date;
            bankId: string | null;
            cardId: string | null;
            available: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        id: string;
        pointOfSale: number;
        voucherNumber: number;
        type: import(".prisma/client").$Enums.VoucherType;
        emissionDate: Date;
        dueDate: Date | null;
        contactId: string | null;
        totalAmount: number | null;
        paidAmount: number;
        observation: string | null;
        available: boolean;
        associatedVoucherNumber: number | null;
        associatedVoucherType: import(".prisma/client").$Enums.VoucherType | null;
        conditionPayment: import(".prisma/client").$Enums.ConditionPayment | null;
        arcaCae: string | null;
        arcaDueDate: string | null;
        status: import(".prisma/client").$Enums.VoucherStatus;
        ivaAmount: number | null;
        afipRequestData: import("@prisma/client/runtime/library").JsonValue | null;
        afipResponseData: import("@prisma/client/runtime/library").JsonValue | null;
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
            voucherId: string;
            id: string;
            method: import(".prisma/client").$Enums.PaymentMethod;
            amount: number;
            currency: import(".prisma/client").$Enums.Currency;
            receivedAt: Date;
            bankId: string | null;
            cardId: string | null;
            available: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        message: string;
        status?: undefined;
    }>;
    deleteAll(): Promise<string>;
}
