import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { 
  CreateInvoiceDto, 
  UpdateInvoiceDto, 
  InvoiceStatusEnum,
  ChangeInvoiceStatusDto,
  CloneInvoiceDto,
  ClientResponseDto,
} from './dtos/invoice.dto';
import { randomUUID } from 'crypto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Normaliza valores monetários para number
   */
  private normalizePrice(price: any): number {
    if (price === null || price === undefined) return 0;
    if (typeof price === 'string') {
      return parseFloat(price);
    }
    if (price instanceof Decimal) {
      return price.toNumber();
    }
    return Number(price);
  }

  /**
   * Normaliza item do orçamento
   */
  private normalizeItem(item: any) {
    return {
      ...item,
      unitPrice: this.normalizePrice(item.unitPrice),
      totalPrice: this.normalizePrice(item.totalPrice),
      customPrice: item.customPrice ? this.normalizePrice(item.customPrice) : null,
    };
  }

  /**
   * Normaliza grupo de itens
   */
  private normalizeGroup(group: any) {
    return {
      ...group,
      items: group.items?.map((item: any) => this.normalizeItem(item)) || [],
    };
  }

  /**
   * Normaliza invoice completo
   */
  private normalizeInvoice(invoice: any) {
    if (!invoice) return null;

    // Map DB-mapped fields to API contract expected by frontend
    const responseStatus = invoice.clientResponseStatus ?? invoice.responseStatus;
    const responseDate = invoice.clientResponseDate ?? invoice.responseDate;

    // Enrich client with primary email/phone for public view
    let client = invoice.client;
    if (client) {
      const emails = client.clientEmails || [];
      const phones = client.clientPhones || [];
      const primaryEmail = emails.find((e: any) => e.primary) || emails[0];
      const primaryPhone = phones.find((p: any) => p.primary) || phones[0];
      client = {
        id: client.id,
        name: client.name,
        nickname: client.nickname,
        email: primaryEmail?.email,
        phone: primaryPhone?.phone,
      };
    }

    return {
      ...invoice,
      client,
      totalAmount: this.normalizePrice(invoice.totalAmount),
      finalAmount: this.normalizePrice(invoice.finalAmount),
      discounts: this.normalizePrice(invoice.discounts),
      additions: this.normalizePrice(invoice.additions),
      displacement: this.normalizePrice(invoice.displacement),
      responseStatus,
      responseDate,
      clientResponseReason: invoice.clientResponseReason,
      groups: invoice.groups?.map((group: any) => this.normalizeGroup(group)) || [],
      paymentConditions: invoice.paymentConditions?.map((pc: any) => ({
        ...pc,
        interestRate: this.normalizePrice(pc.interestRate),
      })) || [],
    };
  }

  /**
   * Calcula o total do orçamento
   */
  private async calculateTotal(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        items: true,
      },
    });

    if (!invoice) return;

    // Soma todos os itens
    const itemsTotal = invoice.items.reduce(
      (sum, item) => sum + this.normalizePrice(item.totalPrice), 
      0
    );

    // Calcula o valor final
    const discounts = this.normalizePrice(invoice.discounts);
    const additions = this.normalizePrice(invoice.additions);
    const displacement = this.normalizePrice(invoice.displacement);
    
    const finalAmount = itemsTotal - discounts + additions + displacement;

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { 
        totalAmount: itemsTotal,
        finalAmount: Math.max(0, finalAmount), // Não permite valor negativo
      },
    });
  }

  /**
   * Gera código único para o orçamento
   */
  private async generateInvoiceCode(): Promise<string> {
    const lastInvoice = await this.prisma.invoice.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    
    const nextNumber = lastInvoice ? parseInt(lastInvoice.code.split('-')[1]) + 1 : 1;
    return `ORC-${String(nextNumber).padStart(6, '0')}`;
  }

  /**
   * Valida se o orçamento pode ser acessado pela URL pública
   */
  private async validatePublicAccess(invoice: any): Promise<boolean> {
    if (!invoice.publicUrlActive) return false;

    // Sempre pode acessar se estiver aprovado, concluído ou faturado
    if (['APPROVED', 'COMPLETED', 'INVOICED'].includes(invoice.status)) {
      return true;
    }

    // Se tiver data de validade, verifica
    if (invoice.proposalValidDate) {
      const now = new Date();
      const validDate = new Date(invoice.proposalValidDate);
      
      if (now > validDate) {
        // Marca como vencido se necessário
        if (invoice.status === 'READY' || invoice.status === 'DRAFT') {
          await this.prisma.invoice.update({
            where: { id: invoice.id },
            data: { status: 'EXPIRED' },
          });
        }
        return false;
      }
    }

    // Permite acesso para rascunho ou pronto dentro da validade
    return ['DRAFT', 'READY'].includes(invoice.status);
  }

  /**
   * Cria um novo orçamento
   */
  async create(createInvoiceDto: CreateInvoiceDto) {
    const publicUrl = randomUUID();
    const code = await this.generateInvoiceCode();

    const invoice = await this.prisma.invoice.create({
      data: {
        code,
        clientId: createInvoiceDto.clientId,
        publicUrl,
        proposalValidDate: createInvoiceDto.proposalValidDate 
          ? new Date(createInvoiceDto.proposalValidDate) 
          : null,
        origin: createInvoiceDto.origin,
        observations: createInvoiceDto.observations,
        responsible: createInvoiceDto.responsible,
        internalReference: createInvoiceDto.internalReference,
        discounts: createInvoiceDto.discounts || 0,
        additions: createInvoiceDto.additions || 0,
        displacement: createInvoiceDto.displacement || 0,
      },
    });

    // Cria grupos e itens
    if (createInvoiceDto.groups && createInvoiceDto.groups.length > 0) {
      for (const group of createInvoiceDto.groups) {
        const createdGroup = await this.prisma.invoiceGroup.create({
          data: {
            name: group.name,
            type: group.type as any,
            invoiceId: invoice.id,
          },
        });

        if (group.items && group.items.length > 0) {
          await this.prisma.invoiceItem.createMany({
            data: group.items.map((item) => ({
              invoiceId: invoice.id,
              invoiceGroupId: createdGroup.id,
              quantity: item.quantity,
              unitPrice: item.unitPrice as any,
              totalPrice: (item.unitPrice as any) * item.quantity,
              customName: item.customName,
              customDescription: item.customDescription,
              customPrice: item.customPrice as any,
              productId: item.productId,
              serviceId: item.serviceId,
              productVariationId: item.productVariationId,
              serviceVariationId: item.serviceVariationId,
            })),
          });
        }
      }
    }

    // Cria condições de pagamento
    if (createInvoiceDto.paymentConditions && createInvoiceDto.paymentConditions.length > 0) {
      await this.prisma.paymentCondition.createMany({
        data: createInvoiceDto.paymentConditions.map((pc) => ({
          invoiceId: invoice.id,
          type: pc.type as any,
          description: pc.description,
          numberOfInstallments: pc.numberOfInstallments,
          interestRate: pc.interestRate || 0,
        })),
      });
    }

    // Calcula o total
    await this.calculateTotal(invoice.id);

    return this.findOne(invoice.id);
  }

  /**
   * Lista todos os orçamentos com filtros
   */
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
            nickname: true,
          },
        },
        groups: {
          include: {
            items: true,
          },
        },
        paymentConditions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return results.map(invoice => this.normalizeInvoice(invoice));
  }

  /**
   * Busca um orçamento por ID
   */
  async findOne(id: string) {
    const result = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        client: {
          include: {
            clientEmails: true,
            clientPhones: true,
          },
        },
        groups: {
          include: {
            items: {
              include: {
                product: {
                  include: {
                    category: true,
                    brand: true,
                    group: true,
                    variations: true,
                  },
                },
                service: {
                  include: {
                    variations: true,
                  },
                },
              },
            },
          },
        },
        paymentConditions: true,
      },
    });

    if (!result) {
      throw new NotFoundException('Orçamento não encontrado');
    }

    return this.normalizeInvoice(result);
  }

  /**
   * Busca um orçamento pela URL pública
   */
  async findByPublicUrl(publicUrl: string) {
    const result = await this.prisma.invoice.findUnique({
      where: { publicUrl },
      include: {
        client: {
          include: {
            clientEmails: true,
            clientPhones: true,
          },
        },
        groups: {
          include: {
            items: {
              include: {
                product: {
                  include: {
                    category: true,
                    brand: true,
                    group: true,
                  },
                },
                service: true,
              },
            },
          },
        },
        paymentConditions: true,
      },
    });

    if (!result) {
      throw new NotFoundException('Orçamento não encontrado');
    }

    // Valida se pode acessar
    const canAccess = await this.validatePublicAccess(result);
    
    if (!canAccess) {
      throw new BadRequestException('Este orçamento não está mais disponível');
    }

    return this.normalizeInvoice(result);
  }

  /**
   * Atualiza um orçamento
   */
  async update(id: string, updateInvoiceDto: UpdateInvoiceDto) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    
    if (!invoice) {
      throw new NotFoundException('Orçamento não encontrado');
    }

    // Orçamentos aprovados não podem ser editados
    if (invoice.status === 'APPROVED') {
      throw new BadRequestException('Orçamentos aprovados não podem ser editados');
    }

    const updateData: any = {
      status: updateInvoiceDto.status,
      proposalValidDate: updateInvoiceDto.proposalValidDate 
        ? new Date(updateInvoiceDto.proposalValidDate) 
        : undefined,
      origin: updateInvoiceDto.origin,
      observations: updateInvoiceDto.observations,
      responsible: updateInvoiceDto.responsible,
      internalReference: updateInvoiceDto.internalReference,
      discounts: updateInvoiceDto.discounts,
      additions: updateInvoiceDto.additions,
      displacement: updateInvoiceDto.displacement,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    await this.prisma.invoice.update({
      where: { id },
      data: updateData,
    });

    // Atualiza grupos se fornecidos
    if (updateInvoiceDto.groups) {
      // Remove grupos antigos
      await this.prisma.invoiceGroup.deleteMany({ where: { invoiceId: id } });

      // Cria novos grupos
      for (const group of updateInvoiceDto.groups) {
        const createdGroup = await this.prisma.invoiceGroup.create({
          data: {
            name: group.name,
            type: group.type as any,
            invoiceId: id,
          },
        });

        if (group.items && group.items.length > 0) {
          await this.prisma.invoiceItem.createMany({
            data: group.items.map((item) => ({
              invoiceId: id,
              invoiceGroupId: createdGroup.id,
              quantity: item.quantity,
              unitPrice: item.unitPrice as any,
              totalPrice: (item.unitPrice as any) * item.quantity,
              customName: item.customName,
              customDescription: item.customDescription,
              customPrice: item.customPrice as any,
              productId: item.productId,
              serviceId: item.serviceId,
              productVariationId: item.productVariationId,
              serviceVariationId: item.serviceVariationId,
            })),
          });
        }
      }
    }

    // Atualiza condições de pagamento se fornecidas
    if (updateInvoiceDto.paymentConditions) {
      await this.prisma.paymentCondition.deleteMany({ where: { invoiceId: id } });
      
      await this.prisma.paymentCondition.createMany({
        data: updateInvoiceDto.paymentConditions.map((pc) => ({
          invoiceId: id,
          type: pc.type as any,
          description: pc.description,
          numberOfInstallments: pc.numberOfInstallments,
          interestRate: pc.interestRate || 0,
        })),
      });
    }

    // Recalcula o total
    await this.calculateTotal(id);

    return this.findOne(id);
  }

  /**
   * Clona um orçamento
   */
  async clone(id: string, updatePrices: boolean = false) {
    const invoice = await this.findOne(id);

    if (!invoice) {
      throw new NotFoundException('Orçamento não encontrado');
    }

    // Se updatePrices é true, busca preços atuais dos produtos/serviços
    const groups = await Promise.all(
      invoice.groups.map(async (group: any) => {
        const items = await Promise.all(
          group.items.map(async (item: any) => {
            let unitPrice = this.normalizePrice(item.unitPrice);
            let customPrice = item.customPrice ? this.normalizePrice(item.customPrice) : undefined;

            if (updatePrices) {
              // Busca preço atual da variação
              if (item.productVariationId) {
                const variation = await this.prisma.productVariation.findUnique({
                  where: { id: item.productVariationId },
                });
                if (variation) {
                  unitPrice = this.normalizePrice(variation.price);
                  customPrice = undefined; // Remove customização ao atualizar preços
                }
              } else if (item.serviceVariationId) {
                const variation = await this.prisma.serviceVariation.findUnique({
                  where: { id: item.serviceVariationId },
                });
                if (variation) {
                  unitPrice = this.normalizePrice(variation.price);
                  customPrice = undefined;
                }
              }
            }

            return {
              quantity: item.quantity,
              unitPrice,
              customName: updatePrices ? undefined : item.customName,
              customDescription: updatePrices ? undefined : item.customDescription,
              customPrice,
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

    // Clona condições de pagamento
    const paymentConditions = invoice.paymentConditions?.map((pc: any) => ({
      type: pc.type,
      description: pc.description,
      numberOfInstallments: pc.numberOfInstallments,
      interestRate: this.normalizePrice(pc.interestRate),
    }));

    return this.create({
      clientId: invoice.clientId,
      proposalValidDate: invoice.proposalValidDate,
      origin: invoice.origin,
      observations: invoice.observations,
      responsible: invoice.responsible,
      internalReference: invoice.internalReference,
      discounts: this.normalizePrice(invoice.discounts || 0),
      additions: this.normalizePrice(invoice.additions || 0),
      displacement: this.normalizePrice(invoice.displacement || 0),
      groups: groups as any,
      paymentConditions: paymentConditions as any,
    });
  }

  /**
   * Altera o status de um orçamento
   */
  async changeStatus(id: string, status: InvoiceStatusEnum, reason?: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    
    if (!invoice) {
      throw new NotFoundException('Orçamento não encontrado');
    }

    // Valida transição de status
    if (invoice.status === 'APPROVED' && !['COMPLETED', 'INVOICED'].includes(status)) {
      throw new BadRequestException('Orçamentos aprovados só podem ser marcados como Concluído ou Faturado');
    }

    const updateData: any = { status };
    
    if (['ABANDONED', 'DESISTED', 'REFUSED'].includes(status) && reason) {
      updateData.clientResponseReason = reason;
      updateData.clientResponseDate = new Date();
      updateData.clientResponseStatus = status;
    }

    const result = await this.prisma.invoice.update({
      where: { id },
      data: updateData,
    });

    return this.normalizeInvoice(result);
  }

  /**
   * Cliente aprova o orçamento via URL pública
   */
  async approveInvoice(publicUrl: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { publicUrl },
    });

    if (!invoice) {
      throw new NotFoundException('Orçamento não encontrado');
    }

    const canAccess = await this.validatePublicAccess(invoice);
    if (!canAccess) {
      throw new BadRequestException('Este orçamento não está mais disponível');
    }

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

  /**
   * Cliente recusa o orçamento via URL pública
   */
  async refuseInvoice(publicUrl: string, reason?: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { publicUrl },
    });

    if (!invoice) {
      throw new NotFoundException('Orçamento não encontrado');
    }

    if (!reason) {
      throw new BadRequestException('Justificativa é obrigatória para recusar o orçamento');
    }

    const result = await this.prisma.invoice.update({
      where: { publicUrl },
      data: {
        status: 'REFUSED',
        clientResponseStatus: 'REFUSED',
        clientResponseDate: new Date(),
        clientResponseReason: reason,
      },
    });
    
    return this.normalizeInvoice(result);
  }

  /**
   * Cliente abandona o orçamento via URL pública
   */
  async abandonInvoice(publicUrl: string, reason?: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { publicUrl },
    });

    if (!invoice) {
      throw new NotFoundException('Orçamento não encontrado');
    }

    if (!reason) {
      throw new BadRequestException('Justificativa é obrigatória para abandonar o orçamento');
    }

    const result = await this.prisma.invoice.update({
      where: { publicUrl },
      data: {
        status: 'ABANDONED',
        clientResponseStatus: 'ABANDONED',
        clientResponseDate: new Date(),
        clientResponseReason: reason,
      },
    });
    
    return this.normalizeInvoice(result);
  }

  /**
   * Deleta um orçamento
   */
  async delete(id: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    
    if (!invoice) {
      throw new NotFoundException('Orçamento não encontrado');
    }

    // Não permite deletar orçamentos aprovados
    if (invoice.status === 'APPROVED') {
      throw new BadRequestException('Orçamentos aprovados não podem ser deletados');
    }

    await this.prisma.invoice.delete({
      where: { id },
    });

    return { message: 'Orçamento deletado com sucesso' };
  }

  /**
   * Gera uma nova URL pública para o orçamento
   */
  async regeneratePublicUrl(id: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    
    if (!invoice) {
      throw new NotFoundException('Orçamento não encontrado');
    }

    const publicUrl = randomUUID();

    await this.prisma.invoice.update({
      where: { id },
      data: { 
        publicUrl,
        publicUrlActive: true,
      },
    });

    return this.findOne(id);
  }

  /**
   * Ativa/desativa a URL pública
   */
  async togglePublicUrl(id: string, active: boolean) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    
    if (!invoice) {
      throw new NotFoundException('Orçamento não encontrado');
    }

    await this.prisma.invoice.update({
      where: { id },
      data: { publicUrlActive: active },
    });

    return this.findOne(id);
  }
}
