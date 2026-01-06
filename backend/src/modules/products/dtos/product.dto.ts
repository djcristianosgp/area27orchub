import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class CreateProductVariationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsUrl()
  @IsOptional()
  affiliateLink?: string;

  @IsString()
  @IsOptional()
  observation?: string;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  brandId: string;

  @IsString()
  @IsNotEmpty()
  groupId: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsNotEmpty()
  variations: CreateProductVariationDto[];
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  brandId?: string;

  @IsString()
  @IsOptional()
  groupId?: string;

  @IsString()
  @IsOptional()
  image?: string;
}

export class ProductVariationResponseDto {
  id: string;
  name: string;
  price: number;
  affiliateLink?: string;
  observation?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ProductResponseDto {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  brandId: string;
  groupId: string;
  image?: string;
  variations?: ProductVariationResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}
