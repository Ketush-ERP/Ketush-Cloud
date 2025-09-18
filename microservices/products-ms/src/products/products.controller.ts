import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { PaginationDto } from 'src/common';
import {
  ChangeCommissionPercentageOfProductDto,
  ChangeProfitMarginOfProductDto,
  UploadWhitFileDto,
} from './dto/upload-whit-file.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern({ cmd: 'create_product' })
  create(@Payload() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @MessagePattern({ cmd: 'upload_products_with_file' })
  uploadWithFile(@Payload() uploadWhitFileDto: UploadWhitFileDto) {
    return this.productsService.bulkCreate(uploadWhitFileDto);
  }

  @MessagePattern({ cmd: 'search_products' })
  search(@Payload() paginationDto: PaginationDto) {
    return this.productsService.searchProducts(paginationDto);
  }

  @MessagePattern({ cmd: 'find_all_product' })
  findAll(@Payload() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @MessagePattern({ cmd: 'find_one_product' })
  findOne(@Payload('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @EventPattern('provider.profitMargin.updated')
  updateProfitMargin(
    @Payload() changeProfitMarginOfProductDto: ChangeProfitMarginOfProductDto,
  ) {
    return this.productsService.updateProfitMargin(
      changeProfitMarginOfProductDto,
    );
  }

  @EventPattern('card.commissionPercentage.updated')
  updateCommissionPercentage(
    @Payload()
    changeCommissionPercentageOfProductDto: ChangeCommissionPercentageOfProductDto,
  ) {
    return this.productsService.updateCommissionPercentage(
      changeCommissionPercentageOfProductDto,
    );
  }

  // @MessagePattern({ cmd: 'update_product' })
  // update(@Payload() updateProductDto: UpdateProductDto) {
  //   return this.productsService.update(updateProductDto.id, updateProductDto);
  // }

  @MessagePattern({ cmd: 'validate_products' })
  validateProducts(@Payload() ids: string[]) {
    return this.productsService.validateProducts(ids);
  }
}
