import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateProductDto, UpdateProductDto, CreateProductVariationDto } from './dtos/product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  private normalizePrice(price: any): number {
    if (typeof price === 'string') {
      return parseFloat(price);
    }
    return Number(price);
  }

  private normalizeVariation(variation: any) {
    return {
      ...variation,
      price: this.normalizePrice(variation.price),
    };
  }

  private normalizeProduct(product: any) {
    return {
      ...product,
      variations: product.variations?.map((v: any) => this.normalizeVariation(v)) || [],
    };
  }

  async create(createProductDto: CreateProductDto) {
    const { variations, ...productData } = createProductDto;

    const result = await this.prisma.product.create({
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

    return this.normalizeProduct(result);
  }

  async findAll(filters?: { categoryId?: string; brandId?: string; groupId?: string }) {
    const results = await this.prisma.product.findMany({
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

    return results.map(product => this.normalizeProduct(product));
  }

  async findOne(id: string) {
    const result = await this.prisma.product.findUnique({
      where: { id },
      include: {
        variations: true,
        category: true,
        brand: true,
        group: true,
      },
    });

    return result ? this.normalizeProduct(result) : null;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const result = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        variations: true,
        category: true,
        brand: true,
        group: true,
      },
    });

    return this.normalizeProduct(result);
  }

  async delete(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async createVariation(productId: string, createVariationDto: CreateProductVariationDto) {
    const result = await this.prisma.productVariation.create({
      data: {
        ...createVariationDto,
        productId,
      },
    });

    return this.normalizeVariation(result);
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

    return minVariation ? this.normalizePrice(minVariation.price) : 0;
  }
}
