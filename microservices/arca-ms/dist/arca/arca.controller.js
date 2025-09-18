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
exports.ArcaController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const arca_service_1 = require("./arca.service");
let ArcaController = class ArcaController {
    arcaService;
    constructor(arcaService) {
        this.arcaService = arcaService;
    }
    async login() {
        console.log('HOLA REALIZANDO AUTORIZAXION');
        return await this.arcaService.loginWithCuit('wsfe');
    }
    async getNextInvoice(data) {
        return await this.arcaService.getNextInvoiceNumber(data.cuil, data.voucherType);
    }
    async emitInvoice(dto) {
        return await this.arcaService.emitVoucher(dto);
    }
};
exports.ArcaController = ArcaController;
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'arca_authorize' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ArcaController.prototype, "login", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'arca_next_invoice_number' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ArcaController.prototype, "getNextInvoice", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'arca_emit_invoice' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ArcaController.prototype, "emitInvoice", null);
exports.ArcaController = ArcaController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [arca_service_1.ArcaService])
], ArcaController);
//# sourceMappingURL=arca.controller.js.map