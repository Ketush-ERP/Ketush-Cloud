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
exports.BanksController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const banks_service_1 = require("./banks.service");
const create_back_dto_1 = require("./dto/create-back.dto");
const update_bank_dto_1 = require("./dto/update-bank.dto");
let BanksController = class BanksController {
    banksService;
    constructor(banksService) {
        this.banksService = banksService;
    }
    create(createBankDto) {
        return this.banksService.create(createBankDto);
    }
    findAll() {
        return this.banksService.findAll();
    }
    findOne(payload) {
        return this.banksService.findOne(payload?.id);
    }
    update(updateBankDto) {
        return this.banksService.update(updateBankDto.id, updateBankDto);
    }
};
exports.BanksController = BanksController;
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'create_bank' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_back_dto_1.CreateBankDto]),
    __metadata("design:returntype", void 0)
], BanksController.prototype, "create", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'find_all_banks' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BanksController.prototype, "findAll", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'find_one_bank' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BanksController.prototype, "findOne", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'update_bank' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_bank_dto_1.UpdateBankDto]),
    __metadata("design:returntype", void 0)
], BanksController.prototype, "update", null);
exports.BanksController = BanksController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [banks_service_1.BanksService])
], BanksController);
//# sourceMappingURL=banks.controller.js.map