import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from './dtos/service.dto';

@Injectable()
export class ServicesService {
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

  private normalizeService(service: any) {
    return {
      ...service,
      variations: service.variations?.map((v: any) => this.normalizeVariation(v)) || [],
    };
  }

  async create(createServiceDto: CreateServiceDto) {
    const { variations, ...serviceData } = createServiceDto;

    const result = await this.prisma.service.create({
      data: {
        ...serviceData,
        ...(variations && variations.length > 0 && {
          variations: {
            create: variations,
          },
        }),
      },
      include: {
        variations: true,
      },
    });

    return this.normalizeService(result);
  }

  async findAll() {
    const results = await this.prisma.service.findMany({
      include: {
        variations: true,
      },
    });

    return results.map(service => this.normalizeService(service));
  }

  async findOne(id: string) {
    const result = await this.prisma.service.findUnique({
      where: { id },
      include: {
        variations: true,
      },
    });

    return result ? this.normalizeService(result) : null;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    const result = await this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
      include: {
        variations: true,
      },
    });

    return this.normalizeService(result);
  }

  async delete(id: string) {
    return this.prisma.service.delete({
      where: { id },
    });
  }

  async addVariation(serviceId: string, variationData: any) {
    const result = await this.prisma.serviceVariation.create({
      data: {
        ...variationData,
        serviceId,
      },
    });

    return this.normalizeVariation(result);
  }

  async deleteVariation(variationId: string) {
    return this.prisma.serviceVariation.delete({
      where: { id: variationId },
    });
  }
}
