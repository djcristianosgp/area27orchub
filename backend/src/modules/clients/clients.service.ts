import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dtos/client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto) {
    const {
      emails = [],
      phones = [],
      socialMedia = [],
      ...clientData
    } = createClientDto;

    return (this.prisma.client.create as any)({
      data: {
        ...clientData,
        status: (clientData.status || 'ACTIVE') as any,
        clientEmails: {
          create: emails,
        },
        clientPhones: {
          create: phones,
        },
        clientSocialMedia: {
          create: socialMedia,
        },
      },
      include: {
        clientEmails: true,
        clientPhones: true,
        clientSocialMedia: true,
      },
    });
  }

  async findAll() {
    return (this.prisma.client.findMany as any)({
      include: {
        clientEmails: true,
        clientPhones: true,
        clientSocialMedia: true,
      },
    });
  }

  async findOne(id: string) {
    return (this.prisma.client.findUnique as any)({
      where: { id },
      include: {
        invoices: true,
        clientEmails: true,
        clientPhones: true,
        clientSocialMedia: true,
      },
    });
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    const {
      emails = [],
      phones = [],
      socialMedia = [],
      ...clientData
    } = updateClientDto;

    // Converter status para enum se fornecido
    const updateData = {
      ...clientData,
      ...(clientData.status && { status: clientData.status as any }),
    };

    // Atualizar cliente base
    const client = await (this.prisma.client.update as any)({
      where: { id },
      data: updateData,
    });

    // Gerenciar emails
    if (emails.length > 0) {
      // Deletar emails antigos
      await (this.prisma.clientEmail as any).deleteMany({
        where: { clientId: id },
      });
      // Criar novos emails
      await (this.prisma.clientEmail as any).createMany({
        data: emails.map((email) => ({
          ...email,
          clientId: id,
        })),
      });
    }

    // Gerenciar telefones
    if (phones.length > 0) {
      // Deletar telefones antigos
      await (this.prisma.clientPhone as any).deleteMany({
        where: { clientId: id },
      });
      // Criar novos telefones
      await (this.prisma.clientPhone as any).createMany({
        data: phones.map((phone) => ({
          ...phone,
          clientId: id,
        })),
      });
    }

    // Gerenciar redes sociais
    if (socialMedia.length > 0) {
      // Deletar redes sociais antigas
      await (this.prisma.clientSocialMedia as any).deleteMany({
        where: { clientId: id },
      });
      // Criar novas redes sociais
      await (this.prisma.clientSocialMedia as any).createMany({
        data: socialMedia.map((social) => ({
          ...social,
          clientId: id,
        })),
      });
    }

    return this.findOne(id);
  }

  async delete(id: string) {
    return (this.prisma.client as any).delete({
      where: { id },
    });
  }
}
