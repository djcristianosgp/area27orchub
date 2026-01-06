import {
  IsNotEmpty,
  IsString,
  IsUrl,
  IsOptional,
  IsDate,
  IsBoolean,
  IsEnum,
} from 'class-validator';

export enum PlatformEnum {
  AMAZON = 'Amazon',
  MERCADO_LIVRE = 'Mercado Livre',
  ALIEXPRESS = 'AliExpress',
  SHOPEE = 'Shopee',
  OTHER = 'Outro',
}

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(PlatformEnum)
  @IsNotEmpty()
  platform: PlatformEnum;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsUrl()
  @IsNotEmpty()
  affiliateLink: string;

  @IsDate()
  @IsNotEmpty()
  validUntil: Date;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class UpdateCouponDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(PlatformEnum)
  @IsOptional()
  platform?: PlatformEnum;

  @IsString()
  @IsOptional()
  code?: string;

  @IsUrl()
  @IsOptional()
  affiliateLink?: string;

  @IsDate()
  @IsOptional()
  validUntil?: Date;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class CouponResponseDto {
  id: string;
  title: string;
  description?: string;
  platform: PlatformEnum;
  code: string;
  affiliateLink: string;
  validUntil: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
