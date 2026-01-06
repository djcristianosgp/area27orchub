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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.create(createInvoiceDto);
  }

  @Get()
  findAll(@Query('clientId') clientId?: string) {
    return this.invoicesService.findAll(clientId);
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
  clone(@Param('id') id: string) {
    return this.invoicesService.clone(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string) {
    return this.invoicesService.delete(id);
  }

  // Public endpoints
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
  refuseInvoice(@Param('publicUrl') publicUrl: string) {
    return this.invoicesService.refuseInvoice(publicUrl);
  }
}
