import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dtos/client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto) {
    return this.prisma.client.create({
      data: createClientDto,
    });
  }

  async findAll() {
    return this.prisma.client.findMany();
  }

  async findOne(id: string) {
    return this.prisma.client.findUnique({
      where: { id },
      include: {
        invoices: true,
      },
    });
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    return this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    });
  }

  async delete(id: string) {
    return this.prisma.client.delete({
      where: { id },
    });
  }
}
