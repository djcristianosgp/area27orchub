import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CompanyEmailDto {
  @IsString() email: string;
  @IsOptional() @IsBoolean() primary?: boolean;
}

export class CompanyPhoneDto {
  @IsString() phone: string;
  @IsOptional() @IsBoolean() hasWhatsapp?: boolean;
  @IsOptional() @IsBoolean() primary?: boolean;
}

export class CompanySocialDto {
  @IsString() platform: string;
  @IsString() url: string;
}

export class CompanyPixKeyDto {
  @IsString() key: string;
  @IsOptional() @IsString() type?: string;
}

export class CreateCompanyDto {
  @IsString() name: string;
  @IsOptional() @IsString() nickname?: string;
  @IsOptional() @IsString() cpfCnpj?: string;
  @IsOptional() @IsString() street?: string;
  @IsOptional() @IsString() number?: string;
  @IsOptional() @IsString() neighborhood?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() zipCode?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() observations?: string;

  @IsOptional() @IsArray() emails?: CompanyEmailDto[];
  @IsOptional() @IsArray() phones?: CompanyPhoneDto[];
  @IsOptional() @IsArray() socials?: CompanySocialDto[];
  @IsOptional() @IsArray() pixKeys?: CompanyPixKeyDto[];
}

export class UpdateCompanyDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() nickname?: string;
  @IsOptional() @IsString() cpfCnpj?: string;
  @IsOptional() @IsString() street?: string;
  @IsOptional() @IsString() number?: string;
  @IsOptional() @IsString() neighborhood?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() zipCode?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() observations?: string;

  @IsOptional() @IsArray() emails?: CompanyEmailDto[];
  @IsOptional() @IsArray() phones?: CompanyPhoneDto[];
  @IsOptional() @IsArray() socials?: CompanySocialDto[];
  @IsOptional() @IsArray() pixKeys?: CompanyPixKeyDto[];
}
