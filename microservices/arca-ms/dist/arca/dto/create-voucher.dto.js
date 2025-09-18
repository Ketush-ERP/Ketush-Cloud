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
exports.CreateVocuherDto = void 0;
const class_validator_1 = require("class-validator");
const iva_condition_enum_1 = require("../../enum/iva-condition.enum");
const voucher_type_enum_1 = require("../../enum/voucher-type.enum");
class CreateVocuherDto {
    cuil;
    pointOfSale;
    voucherType;
    ivaCondition;
    voucherNumber;
    emissionDate;
    contactCuil;
    totalAmount;
    netAmount;
    ivaAmount;
    currency;
    associatedVoucherNumber;
    associatedVoucherType;
}
exports.CreateVocuherDto = CreateVocuherDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateVocuherDto.prototype, "cuil", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateVocuherDto.prototype, "pointOfSale", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(voucher_type_enum_1.VoucherType),
    __metadata("design:type", String)
], CreateVocuherDto.prototype, "voucherType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(iva_condition_enum_1.IvaCondition),
    __metadata("design:type", String)
], CreateVocuherDto.prototype, "ivaCondition", void 0);
__decorate([
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateVocuherDto.prototype, "voucherNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVocuherDto.prototype, "emissionDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateVocuherDto.prototype, "contactCuil", void 0);
__decorate([
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateVocuherDto.prototype, "totalAmount", void 0);
__decorate([
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateVocuherDto.prototype, "netAmount", void 0);
__decorate([
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateVocuherDto.prototype, "ivaAmount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateVocuherDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateVocuherDto.prototype, "associatedVoucherNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(voucher_type_enum_1.VoucherType),
    __metadata("design:type", String)
], CreateVocuherDto.prototype, "associatedVoucherType", void 0);
//# sourceMappingURL=create-voucher.dto.js.map