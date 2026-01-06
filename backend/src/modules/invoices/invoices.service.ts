import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dtos/invoice.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  private normalizePrice(price: any): number {
    if (typeof price === 'string') {
      return parseFloat(price);
    }
    return Number(price);
  }

  private normalizeItem(item: any) {
    return {
      ...item,
      unitPrice: this.normalizePrice(item.unitPrice),
      totalPrice: this.normalizePrice(item.totalPrice),
    };
  }

  private normalizeGroup(group: any) {
    return {
      ...group,
      items: group.items?.map((item: any) => this.normalizeItem(item)) || [],
    };
  }

  private normalizeInvoice(invoice: any) {
    return {
      ...invoice,
      totalAmount: this.normalizePrice(invoice.totalAmount),
      groups: invoice.groups?.map((group: any) => this.normalizeGroup(group)) || [],
    };
  }

  async create(createInvoiceDto: CreateInvoiceDto) {
    const publicUrl = randomUUID();

    // Generate unique invoice code
    const lastInvoice = await this.prisma.invoice.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    const nextNumber = lastInvoice ? parseInt(lastInvoice.code.split('-')[1]) + 1 : 1;
    const code = `ORC-${String(nextNumber).padStart(6, '0')}`;

    const invoice = await this.prisma.invoice.create({
      data: {
        code,
        clientId: createInvoiceDto.clientId,
        publicUrl,
        origin: createInvoiceDto.origin,
        proposalValidDate: createInvoiceDto.proposalValidDate ? new Date(createInvoiceDto.proposalValidDate) : null,
        observations: createInvoiceDto.observations,
        discounts: createInvoiceDto.discounts || 0,
        additions: createInvoiceDto.additions || 0,
        displacement: createInvoiceDto.displacement || 0,
        groups: {
          create: createInvoiceDto.groups.map((group) => ({
            name: group.name,
            type: group.type,
            items: {
              create: group.items.map((item) => ({
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: (item.customPrice || item.unitPrice) * item.quantity,
                customName: item.customName,
                customDescription: item.customDescription,
                customPrice: item.customPrice,
                productId: item.productId,
                serviceId: item.serviceId,
                productVariationId: item.productVariationId,
                serviceVariationId: item.serviceVariationId,
                invoice: {
                  connect: { id: undefined }, // Will be connected after creation
                },
              })),
            },
          })) as any,
        },
        paymentConditions: createInvoiceDto.paymentConditions ? {
          create: createInvoiceDto.paymentConditions.map((pc) => ({
            type: pc.type as any,
            description: pc.description,
            numberOfInstallments: pc.numberOfInstallments,
            interestRate: pc.interestRate || 0,
          })),
        } : undefined,
      },
      include: {
        groups: {
          include: {
            items: true,
          },
        },
        paymentConditions: true,
      },
    });

    // Fix invoiceId in items (workaround for nested create)
    await this.prisma.invoiceItem.updateMany({
      where: {
        invoiceGroupId: {
          in: invoice.groups.map((g: any) => g.id),
        },
      },
      data: {
        invoiceId: invoice.id,
      },
    });

    // Calculate total
    await this.updateTotal(invoice.id);

    const result = await this.findOne(invoice.id);
    return result ? this.normalizeInvoice(result) : null;
  }

  async findAll(filters?: {
    clientId?: string;
    status?: string;
    productId?: string;
    serviceId?: string;
    search?: string;
  }) {
    const where: any = {};

    if (filters?.clientId) {
      where.clientId = filters.clientId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.productId || filters?.serviceId) {
      where.items = {
        some: {
          OR: [
            filters.productId ? { productId: filters.productId } : {},
            filters.serviceId ? { serviceId: filters.serviceId } : {},
          ].filter(obj => Object.keys(obj).length > 0),
        },
      };
    }

    if (filters?.search) {
      where.OR = [
        { code: { contains: filters.search, mode: 'insensitive' } },
        { client: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    const results = await this.prisma.invoice.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        groups: {
          include: {
            items: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return results.map(invoice => this.normalizeInvoice(invoice));
  }

  async findOne(id: string) {
    const result = await this.prisma.invoice.findUnique({
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
        paymentConditions: true,
      },
    });

    return result ? this.normalizeInvoice(result) : null;
  }

  async findByPublicUrl(publicUrl: string) {
    const result = await this.prisma.invoice.findUnique({
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
        paymentConditions: true,
      },
    });

    return result ? this.normalizeInvoice(result) : null;
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

  async clone(id: string, updatePrices: boolean = false) {
    const invoice = await this.findOne(id);

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // If updatePrices is true, fetch current prices from products/services
    const groups = await Promise.all(
      invoice.groups.map(async (group: any) => {
        const items = await Promise.all(
          group.items.map(async (item: any) => {
            let unitPrice = this.normalizePrice(item.unitPrice);

            if (updatePrices) {
              // Fetch current price from product or service
              if (item.productVariationId) {
                const variation = await this.prisma.productVariation.findUnique({
                  where: { id: item.productVariationId },
                });
                if (variation) {
                  unitPrice = this.normalizePrice(variation.price);
                }
              } else if (item.serviceVariationId) {
                const variation = await this.prisma.serviceVariation.findUnique({
                  where: { id: item.serviceVariationId },
                });
                if (variation) {
                  unitPrice = this.normalizePrice(variation.price);
                }
              }
            }

            return {
              quantity: item.quantity,
              unitPrice,
              customName: item.customName,
              customDescription: item.customDescription,
              customPrice: updatePrices ? null : item.customPrice,
              productId: item.productId,
              serviceId: item.serviceId,
              productVariationId: item.productVariationId,
              serviceVariationId: item.serviceVariationId,
            };
          })
        );

        return {
          name: group.name,
          type: group.type as any,
          items,
        };
      })
    );

    return this.create({
      clientId: invoice.clientId,
      origin: invoice.origin,
      observations: invoice.observations,
      discounts: this.normalizePrice(invoice.discounts || 0),
      additions: this.normalizePrice(invoice.additions || 0),
      displacement: this.normalizePrice(invoice.displacement || 0),
      groups: groups as any,
    });
  }

  async changeStatus(id: string, status: string, reason?: string) {
    const invoice = await this.findOne(id);
    
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Check if status transition is valid
    if (invoice.status === 'APPROVED' && !['COMPLETED', 'INVOICED'].includes(status)) {
      throw new Error('Approved invoices can only be marked as COMPLETED or INVOICED');
    }

    const data: any = { status };

    if (['ABANDONED', 'DESISTED', 'REFUSED'].includes(status) && reason) {
      data.clientResponseReason = reason;
      data.clientResponseDate = new Date();
    }

    const result = await this.prisma.invoice.update({
      where: { id },
      data,
    });

    return this.normalizeInvoice(result);
  }

  async approveInvoice(publicUrl: string) {
    const result = await this.prisma.invoice.update({
      where: { publicUrl },
      data: {
        status: 'APPROVED',
        clientResponseStatus: 'APPROVED',
        clientResponseDate: new Date(),
      },
    });
    
    return this.normalizeInvoice(result);
  }

  async refuseInvoice(publicUrl: string, reason?: string) {
    const result = await this.prisma.invoice.update({
      where: { publicUrl },
      data: {
        status: 'REFUSED',
        clientResponseStatus: 'REFUSED',
        clientResponseReason: reason,
        clientResponseDate: new Date(),
      },
    });
    
    return this.normalizeInvoice(result);
  }

  async abandonInvoice(publicUrl: string, reason?: string) {
    const result = await this.prisma.invoice.update({
      where: { publicUrl },
      data: {
        status: 'ABANDONED',
        clientResponseStatus: 'ABANDONED',
        clientResponseReason: reason,
        clientResponseDate: new Date(),
      },
    });
    
    return this.normalizeInvoice(result);
  }

  async delete(id: string) {
    return this.prisma.invoice.delete({
      where: { id },
    });
  }

  private async updateTotal(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        items: true,
      },
    });

    if (!invoice) return;

    const subtotal = invoice.items.reduce(
      (sum, item) => sum + Number(item.totalPrice),
      0,
    );

    const total = subtotal - Number(invoice.discounts) + Number(invoice.additions) + Number(invoice.displacement);

    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { 
        subtotal,
        totalAmount: total,
      },
    });
  }
}
