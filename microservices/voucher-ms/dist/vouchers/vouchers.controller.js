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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VouchersController = void 0;
const microservices_1 = require("@nestjs/microservices");
const vouchers_service_1 = require("./vouchers.service");
const create_voucher_dto_1 = require("./dto/create-voucher.dto");
const pagination_dto_1 = require("./dto/pagination.dto");
const create_payment_dto_1 = require("./dto/create-payment.dto");
const common_1 = require("@nestjs/common");
let VouchersController = class VouchersController {
    vouchersService;
    constructor(vouchersService) {
        this.vouchersService = vouchersService;
    }
    generateVoucherPdf(voucherId) {
        return this.vouchersService.generateVoucherHtml(voucherId);
    }
    create(createVoucherDto) {
        return this.vouchersService.create(createVoucherDto);
    }
    findAllConditionPayment(pagination) {
        return this.vouchersService.findAllConditionPayment(pagination);
    }
    findOne(payload) {
        return this.vouchersService.findOne(payload.id);
    }
    registerPayment(createPaymentDto) {
        return this.vouchersService.registerPayment(createPaymentDto);
    }
    deleteAll() {
        return this.vouchersService.deleteVoucherAll();
    }
};
exports.VouchersController = VouchersController;
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'generate_voucher_html' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VouchersController.prototype, "generateVoucherPdf", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'create_voucher' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_voucher_dto_1.CreateVoucherDto]),
    __metadata("design:returntype", void 0)
], VouchersController.prototype, "create", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'find_all_vouchers_condition_payment' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], VouchersController.prototype, "findAllConditionPayment", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'find_one_voucher' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VouchersController.prototype, "findOne", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'register_payment' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_dto_1.CreatePaymentDto]),
    __metadata("design:returntype", void 0)
], VouchersController.prototype, "registerPayment", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'delete' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VouchersController.prototype, "deleteAll", null);
exports.VouchersController = VouchersController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [vouchers_service_1.VouchersService])
], VouchersController);
//# sourceMappingURL=vouchers.controller.js.map