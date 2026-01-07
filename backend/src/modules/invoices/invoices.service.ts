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
// PDF
// Usamos require para evitar problemas de typings e manter compatibilidade
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');

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
   * Formata valores monetários para BRL
   */
  private formatCurrencyBRL(value: number): string {
    try {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    } catch {
      return `R$ ${(value || 0).toFixed(2)}`;
    }
  }

  /**
   * Gera um Buffer de PDF para um orçamento já normalizado
   */
  private async buildInvoicePdfBuffer(invoice: any): Promise<Buffer> {
    return new Promise(async (resolve) => {
      const margins = { top: 50, left: 50, right: 50, bottom: 50 };
      const doc = new PDFDocument({ size: 'A4', margins });
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Tentar obter dados de empresa (primeira empresa cadastrada)
      let company: any = null;
      try {
        company = await this.prisma.company.findFirst();
      } catch {}

      // Cabeçalho
      doc.fillColor('#111827').fontSize(20).text('Orçamento', { align: 'left' });
      doc.moveDown(0.2);

      const code = invoice.code || (invoice.id ? invoice.id.substring(0, 8) : '');
      const createdAt = invoice.createdAt ? new Date(invoice.createdAt) : new Date();
      const validDate = invoice.proposalValidDate ? new Date(invoice.proposalValidDate) : null;

      doc.fontSize(10).fillColor('#6B7280');
      doc.text(`Código: ${code}`);
      doc.text(`Criado em: ${createdAt.toLocaleDateString('pt-BR')}`);
      if (validDate) doc.text(`Válido até: ${validDate.toLocaleDateString('pt-BR')}`);
      doc.moveDown(0.6);

      // Caixa Empresa + Valor total (com coordenadas absolutas e altura fixa)
      const startBoxY = doc.y;
      const boxWidth = doc.page.width - margins.left - margins.right;
      const boxHeight = 80;
      doc.roundedRect(margins.left, startBoxY, boxWidth, boxHeight, 8).stroke('#E5E7EB');

      // Conteúdo da empresa (lado esquerdo)
      const leftPadding = 14;
      const textStartX = margins.left + leftPadding;
      const textStartY = startBoxY + leftPadding - 2;
      doc.fontSize(12).fillColor('#111827').text(company?.name || 'Sua Empresa', textStartX, textStartY, { width: boxWidth / 2 - 30 });
      let nextY = doc.y;
      if (company?.nickname) {
        doc.fontSize(10).fillColor('#6B7280').text(company.nickname, textStartX, nextY);
        nextY = doc.y;
      }
      if (company?.city || company?.state) {
        doc.fontSize(10).fillColor('#6B7280').text(`${company?.city || ''}${company?.state ? ', ' + company.state : ''}`, textStartX, nextY);
      }

      // Valor total (lado direito do box)
      const totalLabel = 'Valor Total';
      const totalValue = this.formatCurrencyBRL(this.normalizePrice(invoice.finalAmount ?? invoice.totalAmount ?? 0));
      const totalBoxWidth = 170;
      const totalX = margins.left + boxWidth - totalBoxWidth - 14;
      const totalY = startBoxY + 16;
      doc.fontSize(10).fillColor('#6B7280').text(totalLabel, totalX, totalY, { width: totalBoxWidth, align: 'right' });
      doc.fontSize(20).fillColor('#059669').text(totalValue, totalX, totalY + 14, { width: totalBoxWidth, align: 'right' });

      // Posiciona o cursor abaixo da caixa
      doc.y = startBoxY + boxHeight + 14;

      // Cliente
      if (invoice.client) {
        doc.fontSize(12).fillColor('#111827').text('Cliente', margins.left, doc.y, { underline: true });
        doc.moveDown(0.3);
        doc.fontSize(10).fillColor('#111827').text(`Nome: ${invoice.client.name}`, margins.left);
        if (invoice.client.email) doc.fillColor('#6B7280').text(`Email: ${invoice.client.email}`, margins.left);
        if (invoice.client.phone) doc.fillColor('#6B7280').text(`Telefone: ${invoice.client.phone}`, margins.left);
        doc.moveDown(0.6);
      }

      // Itens por grupo
      const col = {
        itemX: margins.left,
        qtyX: 360,
        unitX: 430,
        totalX: 510,
        lineRight: doc.page.width - margins.right,
      };

      const drawTableHeader = () => {
        const headerY = doc.y;
        doc.fillColor('#111827').fontSize(11).text('Item', col.itemX, headerY);
        doc.fontSize(11).text('Qtd', col.qtyX, headerY, { width: 40, align: 'right' });
        doc.text('Unitário', col.unitX, headerY, { width: 70, align: 'right' });
        doc.text('Total', col.totalX, headerY, { width: 60, align: 'right' });
        doc.moveDown(0.2);
        doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(col.itemX, doc.y).lineTo(col.lineRight, doc.y).stroke();
        doc.moveDown(0.2);
      };

      if (invoice.groups?.length) {
        invoice.groups.forEach((group: any, gIdx: number) => {
          doc.fontSize(12).fillColor('#111827').text(`${gIdx + 1}. ${group.name}`);
          doc.moveDown(0.2);
          drawTableHeader();

          group.items?.forEach((item: any) => {
            const name = item.customName || item.product?.name || item.service?.name || 'Item';
            const descParts: string[] = [];
            if (item.customDescription) descParts.push(item.customDescription);
            if (item.product?.description) descParts.push(item.product.description);
            if (item.service?.description) descParts.push(item.service.description);
            if (item.productVariation?.name) descParts.push(`Variação: ${item.productVariation.name}`);
            if (item.productVariation?.observation) descParts.push(`Obs: ${item.productVariation.observation}`);
            if (item.serviceVariation?.name) descParts.push(`Variação: ${item.serviceVariation.name}`);
            if (item.serviceVariation?.observation) descParts.push(`Obs: ${item.serviceVariation.observation}`);

            const unit = this.normalizePrice(item.customPrice ?? item.unitPrice);
            const total = this.normalizePrice(item.totalPrice);

            const startY = doc.y;
            // Coluna do item (nome e descrições)
            doc.fontSize(10).fillColor('#111827').text(name, col.itemX, startY, { width: 290 });
            if (descParts.length) {
              doc.moveDown(0.1);
              doc.fontSize(9).fillColor('#6B7280').text(descParts.join(' • '), col.itemX, doc.y, { width: 290 });
            }
            const leftBottomY = doc.y;

            // Colunas numéricas alinhadas pela linha superior do item
            doc.fontSize(10).fillColor('#111827').text(String(item.quantity || 1), col.qtyX, startY, { width: 40, align: 'right' });
            doc.text(this.formatCurrencyBRL(unit), col.unitX, startY, { width: 70, align: 'right' });
            doc.text(this.formatCurrencyBRL(total), col.totalX, startY, { width: 60, align: 'right' });

            // Avança o cursor para a próxima linha considerando a altura do bloco esquerdo
            doc.y = Math.max(leftBottomY, startY + 14) + 6;
          });

          doc.moveDown(0.5);
        });
      }

      // Totais
      const subtotal = this.normalizePrice(invoice.totalAmount || 0);
      const discounts = this.normalizePrice(invoice.discounts || 0);
      const additions = this.normalizePrice(invoice.additions || 0);
      const displacement = this.normalizePrice(invoice.displacement || 0);
      const final = subtotal - discounts + additions + displacement;

      doc.moveDown(0.5);
      doc.strokeColor('#10B981').lineWidth(2).moveTo(margins.left, doc.y).lineTo(doc.page.width - margins.right, doc.y).stroke();
      doc.moveDown(0.6);
      const totalsX = 320;
      const label = (t: string) => doc.fontSize(10).fillColor('#374151').text(t, totalsX, doc.y, { width: 120, align: 'right' });
      const val = (n: number, color = '#111827') => doc.fontSize(10).fillColor(color).text(this.formatCurrencyBRL(n), totalsX + 130, doc.y, { width: 130, align: 'right' });
      label('Subtotal'); val(subtotal);
      if (discounts > 0) { label('Descontos'); val(-discounts, '#059669'); }
      if (additions > 0) { label('Acréscimos'); val(additions); }
      if (displacement > 0) { label('Deslocamento'); val(displacement); }
      doc.moveDown(0.2);
      doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(totalsX, doc.y).lineTo(doc.page.width - margins.right, doc.y).stroke();
      doc.moveDown(0.2);
      doc.fontSize(12).fillColor('#111827').text('Valor Total', totalsX, doc.y, { width: 120, align: 'right' });
      doc.fontSize(14).fillColor('#059669').text(this.formatCurrencyBRL(final), totalsX + 130, doc.y, { width: 130, align: 'right' });

      // Observações
      if (invoice.observations) {
        doc.moveDown(1);
        doc.fontSize(11).fillColor('#111827').text('Observações', { underline: true }).moveDown(0.3);
        doc.fontSize(10).fillColor('#374151').text(invoice.observations);
      }

      // Rodapé
      doc.moveDown(1);
      doc.fontSize(8).fillColor('#9CA3AF').text('Documento gerado automaticamente pelo sistema de orçamentos.', 50, doc.page.height - 60, { align: 'center' });

      doc.end();
    });
  }

  /**
   * Gera PDF (Buffer) por ID
   */
  async getPdfBufferById(id: string): Promise<{ filename: string; buffer: Buffer }> {
    const invoice = await this.findOne(id);
    const buffer = await this.buildInvoicePdfBuffer(invoice);
    const filename = `Orcamento_${invoice.code || invoice.id.substring(0, 8)}.pdf`;
    return { filename, buffer };
  }

  /**
   * Gera PDF (Buffer) por URL pública
   */
  async getPdfBufferByPublicUrl(publicUrl: string): Promise<{ filename: string; buffer: Buffer }> {
    const invoice = await this.findByPublicUrl(publicUrl);
    const buffer = await this.buildInvoicePdfBuffer(invoice);
    const filename = `Orcamento_${invoice.code || invoice.id.substring(0, 8)}.pdf`;
    return { filename, buffer };
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

    // Enriquecer items com dados das variações de produto e serviço
    const enrichedResult = await Promise.all(
      result.groups.map(async (group: any) => ({
        ...group,
        items: await Promise.all(
          group.items.map(async (item: any) => {
            let productVariation = null;
            let serviceVariation = null;
            
            if (item.productVariationId) {
              productVariation = await this.prisma.productVariation.findUnique({
                where: { id: item.productVariationId },
              });
            }
            
            if (item.serviceVariationId) {
              serviceVariation = await this.prisma.serviceVariation.findUnique({
                where: { id: item.serviceVariationId },
              });
            }
            
            return { ...item, productVariation, serviceVariation };
          })
        ),
      }))
    );

    return this.normalizeInvoice({ ...result, groups: enrichedResult });
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
