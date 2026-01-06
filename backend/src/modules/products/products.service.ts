import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateProductDto, UpdateProductDto, CreateProductVariationDto } from './dtos/product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const { variations, ...productData } = createProductDto;

    return this.prisma.product.create({
      data: {
        ...productData,
        variations: {
          create: variations,
        },
      },
      include: {
        variations: true,
        category: true,
        brand: true,
        group: true,
      },
    });
  }

  async findAll(filters?: { categoryId?: string; brandId?: string; groupId?: string }) {
    return this.prisma.product.findMany({
      where: {
        categoryId: filters?.categoryId,
        brandId: filters?.brandId,
        groupId: filters?.groupId,
      },
      include: {
        variations: true,
        category: true,
        brand: true,
        group: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        variations: true,
        category: true,
        brand: true,
        group: true,
      },
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        variations: true,
        category: true,
        brand: true,
        group: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async createVariation(productId: string, createVariationDto: CreateProductVariationDto) {
    return this.prisma.productVariation.create({
      data: {
        ...createVariationDto,
        productId,
      },
    });
  }

  async deleteVariation(variationId: string) {
    return this.prisma.productVariation.delete({
      where: { id: variationId },
    });
  }

  async getMinPrice(productId: string) {
    const minVariation = await this.prisma.productVariation.findFirst({
      where: { productId },
      orderBy: { price: 'asc' },
    });

    return minVariation?.price || 0;
  }
}
