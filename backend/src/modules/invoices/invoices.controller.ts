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
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dtos/invoice.dto';

@Controller('invoices')
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  // Public endpoints - MUST come before parameterized routes
  @Get('public/:publicUrl')
  findByPublicUrl(@Param('publicUrl') publicUrl: string) {
    return this.invoicesService.findByPublicUrl(publicUrl);
  }

  @Post('public/:publicUrl/approve')
  @HttpCode(HttpStatus.OK)
  approveInvoice(@Param('publicUrl') publicUrl: string) {
    return this.invoicesService.approveInvoice(publicUrl);
  }

  @Post('public/:publicUrl/refuse')
  @HttpCode(HttpStatus.OK)
  refuseInvoice(
    @Param('publicUrl') publicUrl: string,
    @Body() body?: { reason?: string },
  ) {
    return this.invoicesService.refuseInvoice(publicUrl, body?.reason);
  }

  // Admin CRUD endpoints
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.create(createInvoiceDto);
  }

  @Get()
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return this.invoicesService.update(id, updateInvoiceDto);
  }

  @Post(':id/clone')
  @HttpCode(HttpStatus.CREATED)
  clone(
    @Param('id') id: string,
    @Query('updatePrices') updatePrices?: string,
  ) {
    return this.invoicesService.clone(id, updatePrices === 'true');
  }

  @Post(':id/status')
  @HttpCode(HttpStatus.OK)
  changeStatus(
    @Param('id') id: string,
    @Body() body: { status: string; reason?: string },
  ) {
    return this.invoicesService.changeStatus(id, body.status, body.reason);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string) {
    return this.invoicesService.delete(id);
  }

  @Post('public/:publicUrl/abandon')
  @HttpCode(HttpStatus.OK)
  abandonInvoice(
    @Param('publicUrl') publicUrl: string,
    @Body() body?: { reason?: string },
  ) {
    return this.invoicesService.abandonInvoice(publicUrl, body?.reason);
  }
}
