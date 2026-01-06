import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateBrandDto, UpdateBrandDto } from './dtos/brand.dto';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async create(createBrandDto: CreateBrandDto) {
    return this.prisma.brand.create({
      data: createBrandDto,
    });
  }

  async findAll() {
    return this.prisma.brand.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.brand.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    return this.prisma.brand.update({
      where: { id },
      data: updateBrandDto,
    });
  }

  async delete(id: string) {
    return this.prisma.brand.delete({
      where: { id },
    });
  }
}
