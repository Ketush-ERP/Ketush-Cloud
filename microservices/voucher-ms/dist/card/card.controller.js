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
exports.CardController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const card_service_1 = require("./card.service");
const create_card_dto_1 = require("./dto/create-card.dto");
const update_card_dto_1 = require("./dto/update-card.dto");
let CardController = class CardController {
    cardService;
    constructor(cardService) {
        this.cardService = cardService;
    }
    create(createCardDto) {
        return this.cardService.create(createCardDto);
    }
    findAll() {
        return this.cardService.findAll();
    }
    findOne(id) {
        return this.cardService.findOne(id);
    }
    update(updateCardDto) {
        return this.cardService.update(updateCardDto.id, updateCardDto);
    }
};
exports.CardController = CardController;
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'create_card' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_card_dto_1.CreateCardDto]),
    __metadata("design:returntype", void 0)
], CardController.prototype, "create", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'find_all_card' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CardController.prototype, "findAll", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'find_one_card' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CardController.prototype, "findOne", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'update_card' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_card_dto_1.UpdateCardDto]),
    __metadata("design:returntype", void 0)
], CardController.prototype, "update", null);
exports.CardController = CardController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [card_service_1.CardService])
], CardController);
//# sourceMappingURL=card.controller.js.map