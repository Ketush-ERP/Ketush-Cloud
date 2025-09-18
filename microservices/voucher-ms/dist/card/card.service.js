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
var CardService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const config_1 = require("../config");
const microservices_1 = require("@nestjs/microservices");
let CardService = CardService_1 = class CardService extends client_1.PrismaClient {
    client;
    logger = new common_1.Logger(CardService_1.name);
    constructor(client) {
        super();
        this.client = client;
    }
    onModuleInit() {
        void this.$connect();
        this.logger.log('Connected to the database');
    }
    async create(createCardDto) {
        try {
            const existingCard = await this.eCard.findMany({
                where: { available: true },
            });
            if (existingCard.length > 0) {
                throw new Error('Ya existe una tarjeta, no puedes crear más de una, borra la anterior o actualiza la existente');
            }
            const card = await this.eCard.create({
                data: {
                    ...createCardDto,
                },
            });
            this.client.emit('card.commissionPercentage.updated', {
                cardId: card?.id,
                commissionPercentage: card?.commissionPercentage,
            });
            return card;
        }
        catch (error) {
            return {
                status: common_1.HttpStatus.BAD_REQUEST,
                message: `[CREATE_CARD] Error al crear el banco: ${error.message}`,
            };
        }
    }
    findAll() {
        try {
            return this.eCard.findMany({ where: { available: true } });
        }
        catch (error) {
            return {
                status: common_1.HttpStatus.BAD_REQUEST,
                message: `[CREATE_CARD] Error al obtener las tarjetas: ${error.message}`,
            };
        }
    }
    async findOne(id) {
        try {
            return this.eCard.findUnique({ where: { id: id, available: true } });
        }
        catch (error) {
            return {
                status: common_1.HttpStatus.BAD_REQUEST,
                message: `[GET_CARD] Error al obtener: ${error.message}`,
            };
        }
    }
    async update(id, updateCardDto) {
        try {
            const { commissionPercentage, available } = updateCardDto;
            const updated = await this.eCard.update({
                where: { id },
                data: {
                    commissionPercentage,
                    available,
                },
            });
            if (!available) {
                const deleted = await this.eCard.deleteMany({
                    where: {
                        available: false,
                    },
                });
                this.client.emit('card.commissionPercentage.updated', {
                    cardId: '',
                    commissionPercentage: 0,
                });
                return deleted;
            }
            this.client.emit('card.commissionPercentage.updated', {
                cardId: id,
                commissionPercentage: commissionPercentage || 1,
            });
            return updated;
        }
        catch (error) {
            return {
                status: common_1.HttpStatus.BAD_REQUEST,
                message: `[UPDATE_CARD] Error al actualizar: ${error.message}`,
            };
        }
    }
};
exports.CardService = CardService;
exports.CardService = CardService = CardService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(config_1.NATS_SERVICE)),
    __metadata("design:paramtypes", [microservices_1.ClientProxy])
], CardService);
//# sourceMappingURL=card.service.js.map