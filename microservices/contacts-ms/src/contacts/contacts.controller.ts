import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import {
  ChangeProfitMarginDto,
  UpdateContactDto,
} from './dto/update-contact.dto';
import { PaginationDto } from './dto/pagination.dto';

@Controller()
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @MessagePattern({ cmd: 'create_contact' })
  create(@Payload() createContactDto: CreateContactDto) {
    return this.contactsService.create(createContactDto);
  }

  @MessagePattern({ cmd: 'find_all_contacts' })
  findAll(@Payload() paginationDto: PaginationDto) {
    return this.contactsService.findAll(paginationDto);
  }

  @MessagePattern({ cmd: 'find_one_contact' })
  findOneById(@Payload() id: string) {
    return this.contactsService.findOneById(id);
  }

  @MessagePattern({ cmd: 'search_contacts' })
  searchContact(@Payload() paginationDto: PaginationDto) {
    return this.contactsService.searchContact(paginationDto);
  }

  @MessagePattern({ cmd: 'change_percentage_gain' })
  changePercentageGain(
    @Payload() changeProfitMarginDto: ChangeProfitMarginDto,
  ) {
    try {
      return this.contactsService.changePercentageGain(changeProfitMarginDto);
    } catch (error) {
      return {
        message: error,
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  @MessagePattern({ cmd: 'delete_contacts_id' })
  deleteContactsId(@Payload() id: string) {
    try {
      return this.contactsService.delete(id);
    } catch (error) {
      return {
        message: error,
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  // @MessagePattern({ cmd: 'update_contact' })
  // update(@Payload() updateContactDto: UpdateContactDto) {
  //   return this.contactsService.update(updateContactDto.id, updateContactDto);
  // }
}
