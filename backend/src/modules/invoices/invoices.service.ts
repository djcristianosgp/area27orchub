import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dtos/invoice.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async create(createInvoiceDto: CreateInvoiceDto) {
    const publicUrl = randomUUID();

    const invoice = await this.prisma.invoice.create({
      data: {
        clientId: createInvoiceDto.clientId,
        publicUrl,
        groups: {
          create: createInvoiceDto.groups.map((group) => ({
            name: group.name,
            type: group.type,
            items: {
              create: group.items.map((item) => ({
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.quantity * item.unitPrice,
                productId: item.productId,
                serviceId: item.serviceId,
                productVariationId: item.productVariationId,
                serviceVariationId: item.serviceVariationId,
              })),
            },
          })) as any,
        },
      },
      include: {
        groups: {
          include: {
            items: true,
          },
        },
      },
    });

    // Calculate total
    await this.updateTotal(invoice.id);

    return this.findOne(invoice.id);
  }

  async findAll(clientId?: string) {
    return this.prisma.invoice.findMany({
      where: clientId ? { clientId } : {},
      include: {
        groups: {
          include: {
            items: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        groups: {
          include: {
            items: {
              include: {
                product: true,
                service: true,
              },
            },
          },
        },
      },
    });
  }

  async findByPublicUrl(publicUrl: string) {
    return this.prisma.invoice.findUnique({
      where: { publicUrl },
      include: {
        client: true,
        groups: {
          include: {
            items: {
              include: {
                product: true,
                service: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto) {
    // Check if invoice is approved - if so, cannot be edited
    const invoice = await this.findOne(id);
    if (!invoice || invoice.status === 'APPROVED') {
      throw new Error('Approved invoices cannot be edited');
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: {
        status: updateInvoiceDto.status,
      },
      include: {
        groups: {
          include: {
            items: true,
          },
        },
      },
    });

    return this.findOne(id);
  }

  async clone(id: string) {
    const invoice = await this.findOne(id);

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    return this.create({
      clientId: invoice.clientId,
      groups: invoice.groups.map((group) => ({
        name: group.name,
        type: group.type as any,
        items: group.items.map((item) => ({
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          productId: item.productId,
          serviceId: item.serviceId,
          productVariationId: item.productVariationId,
          serviceVariationId: item.serviceVariationId,
        })),
      })) as any,
    });
  }

  async approveInvoice(publicUrl: string) {
    return this.prisma.invoice.update({
      where: { publicUrl },
      data: {
        status: 'APPROVED',
        responseStatus: 'APPROVED',
        responseDate: new Date(),
      },
    });
  }

  async refuseInvoice(publicUrl: string) {
    return this.prisma.invoice.update({
      where: { publicUrl },
      data: {
        status: 'REFUSED',
        responseStatus: 'REFUSED',
        responseDate: new Date(),
      },
    });
  }

  async delete(id: string) {
    return this.prisma.invoice.delete({
      where: { id },
    });
  }

  private async updateTotal(invoiceId: string) {
    const items = await this.prisma.invoiceItem.findMany({
      where: { invoiceId },
    });

    const total = items.reduce(
      (sum, item) => sum + Number(item.totalPrice),
      0,
    );

    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { totalAmount: total },
    });
  }
}
