import { CreateProductDto } from 'src/products/dto/create-product.dto';
import { UpdateProductDto } from 'src/products/dto/update-product.dto';
import { PaginationDto } from '../dto/pagination.dto';
export interface IProductsController {
  createProduct(createProductDto: CreateProductDto);
  findAllProducts(paginationDto: PaginationDto);
  findProductsBySearch(paginationDto: PaginationDto);
  updateProduct(id: string, updateProductDto: UpdateProductDto);
}
