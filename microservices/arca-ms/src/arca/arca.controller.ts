import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ArcaService } from './arca.service';
import { VoucherType } from 'src/enum/voucher-type.enum';
import { CreateVocuherDto } from './dto/create-voucher.dto';

@Controller()
export class ArcaController {
  constructor(private readonly arcaService: ArcaService) {}

  @MessagePattern({ cmd: 'arca_authorize' })
  async login() {
    console.log('HOLA REALIZANDO AUTORIZAXION');
    return await this.arcaService.loginWithCuit('wsfe');
  }

  @MessagePattern({ cmd: 'arca_next_invoice_number' })
  async getNextInvoice(
    @Payload() data: { cuil: number; voucherType: VoucherType },
  ) {
    return await this.arcaService.getNextInvoiceNumber(
      data.cuil,
      data.voucherType,
    );
  }

  @MessagePattern({ cmd: 'arca_emit_invoice' })
  async emitInvoice(@Payload() dto) {
    return await this.arcaService.emitVoucher(dto);
  }
}
