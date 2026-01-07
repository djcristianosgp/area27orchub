import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  Put,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { 
  CreateInvoiceDto, 
  UpdateInvoiceDto,
  ChangeInvoiceStatusDto,
  CloneInvoiceDto,
  ClientResponseDto,
  InvoiceStatusEnum,
} from './dtos/invoice.dto';

@Controller('invoices')
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  // ========== ENDPOINTS PÚBLICOS ==========
  // DEVEM vir ANTES dos endpoints parametrizados para evitar conflitos

  /**
   * Busca orçamento pela URL pública
   * GET /invoices/public/:publicUrl
   */
  @Get('public/:publicUrl')
  @HttpCode(HttpStatus.OK)
  findByPublicUrl(@Param('publicUrl') publicUrl: string) {
    return this.invoicesService.findByPublicUrl(publicUrl);
  }

  /**
   * Gera PDF do orçamento pela URL pública
   * GET /invoices/public/:publicUrl/pdf
   */
  @Get('public/:publicUrl/pdf')
  @HttpCode(HttpStatus.OK)
  async getPublicPdf(@Param('publicUrl') publicUrl: string, @Res() res: Response) {
    const { filename, buffer } = await this.invoicesService.getPdfBufferByPublicUrl(publicUrl);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
  }

  /**
   * Cliente aprova o orçamento via URL pública
   * POST /invoices/public/:publicUrl/approve
   */
  @Post('public/:publicUrl/approve')
  @HttpCode(HttpStatus.OK)
  approveInvoice(@Param('publicUrl') publicUrl: string) {
    return this.invoicesService.approveInvoice(publicUrl);
  }

  /**
   * Cliente recusa o orçamento via URL pública
   * POST /invoices/public/:publicUrl/refuse
   * Body: { reason: string }
   */
  @Post('public/:publicUrl/refuse')
  @HttpCode(HttpStatus.OK)
  refuseInvoice(
    @Param('publicUrl') publicUrl: string,
    @Body() body: ClientResponseDto,
  ) {
    return this.invoicesService.refuseInvoice(publicUrl, body.reason);
  }

  /**
   * Cliente abandona o orçamento via URL pública
   * POST /invoices/public/:publicUrl/abandon
   * Body: { reason: string }
   */
  @Post('public/:publicUrl/abandon')
  @HttpCode(HttpStatus.OK)
  abandonInvoice(
    @Param('publicUrl') publicUrl: string,
    @Body() body: ClientResponseDto,
  ) {
    return this.invoicesService.abandonInvoice(publicUrl, body.reason);
  }

  // ========== ENDPOINTS ADMINISTRATIVOS (CRUD) ==========

  /**
   * Cria um novo orçamento
   * POST /invoices
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.create(createInvoiceDto);
  }

  /**
   * Lista todos os orçamentos com filtros
   * GET /invoices?clientId=xxx&status=DRAFT&productId=xxx&serviceId=xxx&search=termo
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(
    @Query('clientId') clientId?: string,
    @Query('status') status?: string,
    @Query('productId') productId?: string,
    @Query('serviceId') serviceId?: string,
    @Query('search') search?: string,
  ) {
    return this.invoicesService.findAll({
      clientId,
      status,
      productId,
      serviceId,
      search,
    });
  }

  /**
   * Busca um orçamento por ID
   * GET /invoices/:id
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  /**
   * Gera PDF do orçamento (admin)
   * GET /invoices/:id/pdf
   */
  @Get(':id/pdf')
  @HttpCode(HttpStatus.OK)
  async getPdf(@Param('id') id: string, @Res() res: Response) {
    const { filename, buffer } = await this.invoicesService.getPdfBufferById(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
  }

  /**
   * Atualiza um orçamento
   * PATCH /invoices/:id
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return this.invoicesService.update(id, updateInvoiceDto);
  }

  /**
   * Atualização completa do orçamento
   * PUT /invoices/:id
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  updateFull(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return this.invoicesService.update(id, updateInvoiceDto);
  }

  /**
   * Clona um orçamento
   * POST /invoices/:id/clone?updatePrices=true|false
   */
  @Post(':id/clone')
  @HttpCode(HttpStatus.CREATED)
  clone(
    @Param('id') id: string,
    @Query('updatePrices') updatePrices?: string,
  ) {
    return this.invoicesService.clone(id, updatePrices === 'true');
  }

  /**
   * Altera o status de um orçamento
   * POST /invoices/:id/status
   * Body: { status: 'DRAFT' | 'READY' | ..., reason?: string }
   */
  @Post(':id/status')
  @HttpCode(HttpStatus.OK)
  changeStatus(
    @Param('id') id: string,
    @Body() body: { status: InvoiceStatusEnum; reason?: string },
  ) {
    return this.invoicesService.changeStatus(id, body.status, body.reason);
  }

  /**
   * Marca orçamento como Desistido
   * POST /invoices/:id/desist
   * Body: { reason?: string }
   */
  @Post(':id/desist')
  @HttpCode(HttpStatus.OK)
  desistInvoice(
    @Param('id') id: string,
    @Body() body?: { reason?: string },
  ) {
    return this.invoicesService.changeStatus(
      id, 
      InvoiceStatusEnum.DESISTED, 
      body?.reason
    );
  }

  /**
   * Marca orçamento como Abandonado
   * POST /invoices/:id/abandon-admin
   * Body: { reason?: string }
   */
  @Post(':id/abandon-admin')
  @HttpCode(HttpStatus.OK)
  abandonInvoiceAdmin(
    @Param('id') id: string,
    @Body() body?: { reason?: string },
  ) {
    return this.invoicesService.changeStatus(
      id, 
      InvoiceStatusEnum.ABANDONED, 
      body?.reason
    );
  }

  /**
   * Regenera a URL pública do orçamento
   * POST /invoices/:id/regenerate-url
   */
  @Post(':id/regenerate-url')
  @HttpCode(HttpStatus.OK)
  regeneratePublicUrl(@Param('id') id: string) {
    return this.invoicesService.regeneratePublicUrl(id);
  }

  /**
   * Ativa/desativa a URL pública
   * POST /invoices/:id/toggle-url
   * Body: { active: boolean }
   */
  @Post(':id/toggle-url')
  @HttpCode(HttpStatus.OK)
  togglePublicUrl(
    @Param('id') id: string,
    @Body() body: { active: boolean },
  ) {
    return this.invoicesService.togglePublicUrl(id, body.active);
  }

  /**
   * Deleta um orçamento
   * DELETE /invoices/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string) {
    return this.invoicesService.delete(id);
  }
}
