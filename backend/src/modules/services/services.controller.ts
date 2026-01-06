import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto, CreateServiceVariationDto } from './dtos/service.dto';

@Controller('services')
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string) {
    return this.servicesService.delete(id);
  }

  @Post(':serviceId/variations')
  @HttpCode(HttpStatus.CREATED)
  createVariation(
    @Param('serviceId') serviceId: string,
    @Body() createVariationDto: CreateServiceVariationDto,
  ) {
    return this.servicesService.addVariation(serviceId, createVariationDto);
  }

  @Delete(':serviceId/variations/:variationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteVariation(
    @Param('serviceId') serviceId: string,
    @Param('variationId') variationId: string,
  ) {
    return this.servicesService.deleteVariation(variationId);
  }
}
