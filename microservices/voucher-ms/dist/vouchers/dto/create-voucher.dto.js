"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateVoucherDto = void 0;
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const voucher_product_item_dto_1 = require("./voucher-product-item.dto");
const initial_payment_dto_1 = require("./initial-payment.dto");
const enum_1 = require("../../enum");
class CreateVoucherDto {
    cuil;
    pointOfSale;
    voucherNumber;
    type;
    emissionDate;
    dueDate;
    contactId;
    currency;
    products;
    totalAmount;
    paidAmount;
    observation;
    available;
    loadToArca;
    initialPayment;
    associatedVoucherNumber;
    associatedVoucherType;
}
exports.CreateVoucherDto = CreateVoucherDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateVoucherDto.prototype, "cuil", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateVoucherDto.prototype, "pointOfSale", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateVoucherDto.prototype, "voucherNumber", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(enum_1.VoucherType),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreateVoucherDto.prototype, "emissionDate", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreateVoucherDto.prototype, "dueDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "contactId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.Currency),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => voucher_product_item_dto_1.VoucherProductItemDto),
    __metadata("design:type", Array)
], CreateVoucherDto.prototype, "products", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateVoucherDto.prototype, "totalAmount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateVoucherDto.prototype, "paidAmount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "observation", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateVoucherDto.prototype, "available", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateVoucherDto.prototype, "loadToArca", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => initial_payment_dto_1.CreateInitialPaymentDto),
    __metadata("design:type", Array)
], CreateVoucherDto.prototype, "initialPayment", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateVoucherDto.prototype, "associatedVoucherNumber", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(enum_1.VoucherType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "associatedVoucherType", void 0);
//# sourceMappingURL=create-voucher.dto.js.map