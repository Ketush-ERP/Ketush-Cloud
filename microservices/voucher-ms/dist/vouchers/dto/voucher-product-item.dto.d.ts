export declare class VoucherProductItemDto {
    productId: string;
    description: string;
    code: string;
    voucherId?: string;
    quantity: number;
    price: number;
}
export declare class UpdateVoucherProductItemDto {
    id?: string;
    productId?: string;
    code: string;
    description?: string;
    voucherId?: string;
    price?: number;
}
