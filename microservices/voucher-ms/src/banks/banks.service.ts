import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateBankDto } from './dto/create-back.dto';
import { UpdateBankDto } from './dto/update-bank.dto';

@Injectable()
export class BanksService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(BanksService.name);

  onModuleInit() {
    void this.$connect();
    this.logger.log('Connected to the database');
  }

  async create(createBankDto: CreateBankDto) {
    try {
      const bank = await this.eBank.create({
        data: {
          ...createBankDto,
        },
      });
      return bank;
    } catch (error) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: `[CREATE_BANK] Error al crear el banco: ${error.message}`,
      };
    }
  }

  async findAll() {
    try {
      return this.eBank.findMany({ where: { available: true } });
    } catch (error) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: `[CREATE_BANK] Error al obtener los bancos: ${error.message}`,
      };
    }
  }

  async findOne(id: string) {
    try {
      return this.eBank.findFirst({ where: { id, available: true } });
    } catch (error) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: `[GET_BANK] Error al obtener: ${error.message}`,
      };
    }
  }

  async update(id: string, updateBankDto: UpdateBankDto) {
    try {
      const updated = await this.eBank.update({
        where: { id },
        data: updateBankDto,
      });
      return updated;
    } catch (error) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: `[UPDATE_BANK] Error al actualizar: ${error.message}`,
      };
    }
  }
}
