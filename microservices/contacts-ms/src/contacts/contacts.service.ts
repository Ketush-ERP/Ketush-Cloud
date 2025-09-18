import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { EContact, PrismaClient, ContactType } from '@prisma/client';
import { PaginateWithMeta } from './dto/pagination.helper';
import { PaginationDto } from './dto/pagination.dto';
import { ClientProxy } from '@nestjs/microservices';
import { ChangeProfitMarginDto } from './dto/update-contact.dto';
import { NATS_SERVICE } from 'src/config';

@Injectable()
export class ContactsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ContactsService.name);

  onModuleInit() {
    void this.$connect();
    this.logger.log('Database connected');
  }

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
  }

  async create(createContactDto: CreateContactDto) {
    const existingContact = await this.eContact.findFirst({
      where: { documentNumber: createContactDto.documentNumber },
    });

    if (existingContact) {
      return {
        message:
          '[CONTACT_CREATE] Contact with this CUIT/CUIL/DNI already exists',
        status: HttpStatus.METHOD_NOT_ALLOWED,
      };
    }

    const newContact = await this.eContact.create({
      data: createContactDto,
    });
    return newContact;
  }

  async findAll(paginationDto: PaginationDto) {
    return await PaginateWithMeta<EContact>({
      model: this.eContact,
      where: { available: true },
      pagination: paginationDto,
    });
  }

  async findOneById(id: string) {
    const contact = await this.eContact.findUnique({
      where: { id, available: true },
    });

    if (!contact) {
      return {
        message: '[CONTACT_FIND_ONE_BY_ID] Contact not found',
        status: HttpStatus.NOT_FOUND,
      };
    }
    return contact;
  }

  async searchContact(paginationDto: PaginationDto) {
    const { query, type } = paginationDto;

    const where: any = {
      available: true,
      type,
    };

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { businessName: { contains: query, mode: 'insensitive' } },
        { documentNumber: { contains: query, mode: 'insensitive' } },
      ];
    }

    return await PaginateWithMeta({
      model: this.eContact,
      where,
      pagination: paginationDto,
    });
  }

  async changePercentageGain(changeProfitMarginDto: ChangeProfitMarginDto) {
    try {
      const { id, profitMargin } = changeProfitMarginDto;
      const contact = await this.eContact.findUnique({
        where: { id, available: true, type: { equals: ContactType.SUPPLIER } },
      });

      if (!contact) {
        return {
          message: '[CONTACT_CHANGE_PERCENTAGE_GAIN] Contact not found',
          status: HttpStatus.NOT_FOUND,
        };
      }

      const update = await this.eContact.update({
        where: { id },
        data: {
          profitMargin,
        },
      });

      this.client.emit('provider.profitMargin.updated', {
        supplierId: contact.id,
        profitMargin,
      });

      return update;
    } catch (error) {
      return {
        message: '[CONTACT_CHANGE_PERCENTAGE_GAIN] Error updating contact',
        error: error.message,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async delete(id: string) {
    try {
      const contact = await this.eContact.delete({
        where: { id },
      });

      return contact;
    } catch (error) {
      return {
        message: `[CONTACT_DELETE] Error en borrar el contacto ${error}`,
        error: error.message,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
