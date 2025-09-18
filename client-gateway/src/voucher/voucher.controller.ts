import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  Query,
  Res,
  HttpStatus,
  Header,
} from '@nestjs/common';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { PaginationDto } from './dto/pagination.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Response } from 'express';
import { VoucherType } from 'src/enum';

@Controller('voucher')
export class VoucherController {
  constructor(
    @Inject(NATS_SERVICE) private readonly clientProxy: ClientProxy,
  ) {}

  // TODO: [VOUCHER] CREAR COMPROBANTE
  @Post()
  async create(@Body() createVoucherDto: CreateVoucherDto) {
    try {
      const response = await firstValueFrom(
        this.clientProxy.send({ cmd: 'create_voucher' }, createVoucherDto),
      );

      return {
        success: true,
        data: response?.data || response,
        message: response?.message || 'Comprobante registrado correctamente.',
      };
    } catch (error) {
      throw new RpcException(
        `[GATEWAY] Error al crear el comprobante: ${error.message}`,
      );
    }
  }

  // TODO: [VOUCHER] REGISTRAR PAGO
  @Post('register-payment')
  async registerPayment(@Body() paymentDto: CreatePaymentDto) {
    try {
      const response = await firstValueFrom(
        this.clientProxy.send({ cmd: 'register_payment' }, paymentDto),
      );

      return {
        success: true,
        data: response?.data || response,
        message: response?.message || 'Pago registrado correctamente.',
      };
    } catch (error) {
      throw new RpcException(
        `[GATEWAY] Error al registrar el pago: ${error.message}`,
      );
    }
  }

  // TODO: [VOUCHER] BUSCAR COMPROBANTE
  @Get('search')
  async searchVoucher(@Query() pagination: PaginationDto) {
    try {
      const response = await firstValueFrom(
        this.clientProxy.send(
          { cmd: 'find_all_vouchers_condition_payment' },
          pagination,
        ),
      );
      return response;
    } catch (error) {
      throw new RpcException(
        `[GATEWAY] Error al obtener las condiciones de pago: ${error.message}`,
      );
    }
  }

  @Get('find-one/:id')
  async findOne(@Param('id') id: string) {
    try {
      const response = await firstValueFrom(
        this.clientProxy.send({ cmd: 'find_one_voucher' }, { id }),
      );
      return response;
    } catch (error) {
      throw new RpcException(
        `[GATEWAY] Error al obtener el comprobante: ${error.message}`,
      );
    }
  }

  // TODO: [VOUCHER] CREAR COMPROBANTE
  @Get('next-invoice-number')
  async getNextInvoiceNumber(
    @Query('cuil') cuil: string,
    @Query('voucherType') voucherType: VoucherType,
  ) {
    try {
      const transformCuil = parseInt(cuil);

      if (isNaN(transformCuil)) {
        throw new RpcException({ message: 'CUIL inválido' });
      }

      const nextNumber = await firstValueFrom(
        this.clientProxy.send(
          { cmd: 'arca_next_invoice_number' },
          { cuil: transformCuil, voucherType },
        ),
      );

      return {
        nextNumber,
      };
    } catch (error) {
      throw new RpcException(error);
    }
  }

  // TODO: [VOUCHER] GENERAR PDF
  @Get('html/:id') // opcionalmente cambiá a 'html/:id'
  @Header('Content-Type', 'text/html')
  async generateHtml(
    @Param('id') id: string,
    @Query('download') download: string,
    @Res() res: Response,
  ) {
    try {
      const html = await firstValueFrom(
        this.clientProxy.send({ cmd: 'generate_voucher_html' }, id),
      );

      res.setHeader(
        'Content-Disposition',
        `${download === 'true' ? 'attachment' : 'inline'}; filename=comprobante-${id}.html`,
      );
      return res.status(HttpStatus.OK).send(html);
    } catch (error) {
      throw new RpcException(
        `[GATEWAY] Error al generar el comprobante: ${error.message}`,
      );
    }
  }

  // TODO: [VOUCHER] BORRAR TODOS LOS COMPROBANTES
  @Delete('delete-all')
  async deleteProductAll() {
    try {
      const response = await firstValueFrom(
        this.clientProxy.send({ cmd: 'delete' }, {}),
      );
      return response;
    } catch (error) {
      throw new RpcException(
        `[GATEWAY] Error al eliminar el producto: ${error.message}`,
      );
    }
  }
}
