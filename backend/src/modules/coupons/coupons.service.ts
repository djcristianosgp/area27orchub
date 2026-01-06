import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateCouponDto, UpdateCouponDto } from './dtos/coupon.dto';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async create(createCouponDto: CreateCouponDto) {
    return this.prisma.coupon.create({
      data: createCouponDto,
    });
  }

  async findAll(active?: boolean) {
    return this.prisma.coupon.findMany({
      where: active !== undefined ? { active } : {},
      orderBy: { validUntil: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.coupon.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateCouponDto: UpdateCouponDto) {
    return this.prisma.coupon.update({
      where: { id },
      data: updateCouponDto,
    });
  }

  async delete(id: string) {
    return this.prisma.coupon.delete({
      where: { id },
    });
  }

  async findByPlatform(platform: string) {
    return this.prisma.coupon.findMany({
      where: {
        platform,
        active: true,
        validUntil: {
          gte: new Date(),
        },
      },
    });
  }
}
