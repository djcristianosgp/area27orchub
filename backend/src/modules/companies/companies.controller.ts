import { Controller, Get, Post, Put, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '@modules/auth/jwt-auth.guard';
import { CreateCompanyDto, UpdateCompanyDto } from './dtos/company.dto';

@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Get('me')
  getMyCompany(@Req() req: any) {
    return this.companiesService.getMyCompany(req.user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createCompany(@Req() req: any, @Body() dto: CreateCompanyDto) {
    return this.companiesService.createCompanyForUser(req.user.id, dto);
  }

  @Put('me')
  updateMyCompany(@Req() req: any, @Body() dto: UpdateCompanyDto) {
    return this.companiesService.updateMyCompany(req.user.id, dto);
  }
}
