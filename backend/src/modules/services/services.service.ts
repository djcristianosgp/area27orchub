import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from './dtos/service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(createServiceDto: CreateServiceDto) {
    const { variations, ...serviceData } = createServiceDto;

    return this.prisma.service.create({
      data: {
        ...serviceData,
        variations: {
          create: variations,
        },
      },
      include: {
        variations: true,
      },
    });
  }

  async findAll() {
    return this.prisma.service.findMany({
      include: {
        variations: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.service.findUnique({
      where: { id },
      include: {
        variations: true,
      },
    });
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    return this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
      include: {
        variations: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.service.delete({
      where: { id },
    });
  }

  async addVariation(serviceId: string, variationData: any) {
    return this.prisma.serviceVariation.create({
      data: {
        ...variationData,
        serviceId,
      },
    });
  }

  async deleteVariation(variationId: string) {
    return this.prisma.serviceVariation.delete({
      where: { id: variationId },
    });
  }
}
