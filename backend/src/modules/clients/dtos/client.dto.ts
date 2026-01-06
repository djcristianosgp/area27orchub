import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ClientEmailDto {
  @IsEmail()
  email: string;

  @IsBoolean()
  @IsOptional()
  primary?: boolean;
}

export class ClientPhoneDto {
  @IsString()
  phone: string;

  @IsBoolean()
  @IsOptional()
  hasWhatsapp?: boolean;

  @IsBoolean()
  @IsOptional()
  primary?: boolean;
}

export class ClientSocialMediaDto {
  @IsString()
  platform: string;

  @IsString()
  url: string;
}

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  nickname?: string;

  @IsString()
  @IsOptional()
  cpfCnpj?: string;

  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  number?: string;

  @IsString()
  @IsOptional()
  neighborhood?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  zipCode?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClientEmailDto)
  @IsOptional()
  emails?: ClientEmailDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClientPhoneDto)
  @IsOptional()
  phones?: ClientPhoneDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClientSocialMediaDto)
  @IsOptional()
  socialMedia?: ClientSocialMediaDto[];

  @IsString()
  @IsOptional()
  observations?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

export class UpdateClientDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  nickname?: string;

  @IsString()
  @IsOptional()
  cpfCnpj?: string;

  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  number?: string;

  @IsString()
  @IsOptional()
  neighborhood?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  zipCode?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClientEmailDto)
  @IsOptional()
  emails?: ClientEmailDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClientPhoneDto)
  @IsOptional()
  phones?: ClientPhoneDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClientSocialMediaDto)
  @IsOptional()
  socialMedia?: ClientSocialMediaDto[];

  @IsString()
  @IsOptional()
  observations?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

export class ClientResponseDto {
  id: string;
  name: string;
  nickname?: string;
  cpfCnpj?: string;
  status: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  zipCode?: string;
  state?: string;
  emails: ClientEmailDto[];
  phones: ClientPhoneDto[];
  socialMedia: ClientSocialMediaDto[];
  observations?: string;
  createdAt: Date;
  updatedAt: Date;
}
