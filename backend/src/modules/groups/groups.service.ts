import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateGroupDto, UpdateGroupDto } from './dtos/group.dto';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async create(createGroupDto: CreateGroupDto) {
    return this.prisma.group.create({
      data: createGroupDto,
    });
  }

  async findAll() {
    return this.prisma.group.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.group.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateGroupDto: UpdateGroupDto) {
    return this.prisma.group.update({
      where: { id },
      data: updateGroupDto,
    });
  }

  async delete(id: string) {
    return this.prisma.group.delete({
      where: { id },
    });
  }
}
