import { MessagePattern, Payload } from '@nestjs/microservices';
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { PaginationDto } from './dto/pagination.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Controller } from '@nestjs/common';

@Controller()
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @MessagePattern({ cmd: 'generate_voucher_html' })
  generateVoucherPdf(@Payload() voucherId: string) {
    return this.vouchersService.generateVoucherHtml(voucherId);
  }

  @MessagePattern({ cmd: 'create_voucher' })
  create(@Payload() createVoucherDto: CreateVoucherDto) {
    return this.vouchersService.create(createVoucherDto);
  }

  @MessagePattern({ cmd: 'find_all_vouchers_condition_payment' })
  findAllConditionPayment(@Payload() pagination: PaginationDto) {
    return this.vouchersService.findAllConditionPayment(pagination);
  }

  @MessagePattern({ cmd: 'find_one_voucher' })
  findOne(@Payload() payload: { id: string }) {
    return this.vouchersService.findOne(payload.id);
  }

  @MessagePattern({ cmd: 'register_payment' })
  registerPayment(@Payload() createPaymentDto: CreatePaymentDto) {
    return this.vouchersService.registerPayment(createPaymentDto);
  }

  @MessagePattern({ cmd: 'delete' })
  deleteAll() {
    return this.vouchersService.deleteVoucherAll();
  }
}
