import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, CreateProductVariationDto } from './dtos/product.dto';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
    @Query('groupId') groupId?: string,
  ) {
    return this.productsService.findAll({ categoryId, brandId, groupId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }

  @Get(':id/min-price')
  async getMinPrice(@Param('id') id: string) {
    const minPrice = await this.productsService.getMinPrice(id);
    return { productId: id, minPrice };
  }

  @Post(':productId/variations')
  @HttpCode(HttpStatus.CREATED)
  createVariation(
    @Param('productId') productId: string,
    @Body() createVariationDto: CreateProductVariationDto,
  ) {
    return this.productsService.createVariation(productId, createVariationDto);
  }

  @Delete(':productId/variations/:variationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteVariation(
    @Param('productId') productId: string,
    @Param('variationId') variationId: string,
  ) {
    return this.productsService.deleteVariation(variationId);
  }
}
