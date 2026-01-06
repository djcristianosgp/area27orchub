import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dtos/company.dto';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async getMyCompany(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.companyId) {
      throw new NotFoundException('Nenhuma empresa vinculada ao usuário.');
    }
    const companyId = user.companyId as string;
    return this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        emails: true,
        phones: true,
        socials: true,
        pixKeys: true,
      },
    });
  }

  async createCompanyForUser(userId: string, dto: CreateCompanyDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    if (user.companyId) {
      return this.prisma.company.findUnique({ where: { id: user.companyId } });
    }

    const { emails = [], phones = [], socials = [], pixKeys = [], ...companyData } = dto;

    const company = await this.prisma.company.create({
      data: {
        ...companyData,
        emails: { create: emails },
        phones: { create: phones },
        socials: { create: socials },
        pixKeys: { create: pixKeys },
      },
      include: { emails: true, phones: true, socials: true, pixKeys: true },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { companyId: company.id },
    });

    return company;
  }

  async updateMyCompany(userId: string, dto: UpdateCompanyDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.companyId) throw new NotFoundException('Empresa não encontrada para o usuário');

    const companyId = user.companyId as string;

    const { emails = [], phones = [], socials = [], pixKeys = [], ...companyData } = dto;

    // Atualiza dados base
    const updated = await this.prisma.company.update({
      where: { id: companyId },
      data: { ...companyData },
      include: { emails: true, phones: true, socials: true, pixKeys: true },
    });

    // Substitui coleções relacionadas, se fornecidas
    // Emails
    if (emails.length > 0) {
      await this.prisma.companyEmail.deleteMany({ where: { companyId } });
      await this.prisma.companyEmail.createMany({
        data: emails.map((e) => ({ ...e, companyId })),
      });
    }
    // Phones
    if (phones.length > 0) {
      await this.prisma.companyPhone.deleteMany({ where: { companyId } });
      await this.prisma.companyPhone.createMany({
        data: phones.map((p) => ({ ...p, companyId })),
      });
    }
    // Socials
    if (socials.length > 0) {
      await this.prisma.companySocial.deleteMany({ where: { companyId } });
      await this.prisma.companySocial.createMany({
        data: socials.map((s) => ({ ...s, companyId })),
      });
    }
    // Pix Keys
    if (pixKeys.length > 0) {
      await this.prisma.companyPixKey.deleteMany({ where: { companyId } });
      await this.prisma.companyPixKey.createMany({
        data: pixKeys.map((k) => ({ ...k, companyId })),
      });
    }

    return this.getMyCompany(userId);
  }
}
