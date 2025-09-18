import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { PrismaClient } from '@prisma/client';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class CardService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(CardService.name);

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
  }

  onModuleInit() {
    void this.$connect();
    this.logger.log('Connected to the database');
  }

  async create(createCardDto: CreateCardDto) {
    try {
      const existingCard = await this.eCard.findMany({
        where: { available: true },
      });

      if (existingCard.length > 0) {
        throw new Error(
          'Ya existe una tarjeta, no puedes crear más de una, borra la anterior o actualiza la existente',
        );
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
    } catch (error) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: `[CREATE_CARD] Error al crear el banco: ${error.message}`,
      };
    }
  }

  findAll() {
    try {
      return this.eCard.findMany({ where: { available: true } });
      // return this.eCard.findMany();
    } catch (error) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: `[CREATE_CARD] Error al obtener las tarjetas: ${error.message}`,
      };
    }
  }

  async findOne(id: string) {
    try {
      return this.eCard.findUnique({ where: { id: id, available: true } });
    } catch (error) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: `[GET_CARD] Error al obtener: ${error.message}`,
      };
    }
  }

  async update(id: string, updateCardDto: UpdateCardDto) {
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
    } catch (error) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: `[UPDATE_CARD] Error al actualizar: ${error.message}`,
      };
    }
  }
}
