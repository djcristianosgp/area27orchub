import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateServiceVariationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsOptional()
  observation?: string;
}

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  variations?: CreateServiceVariationDto[];
}

export class UpdateServiceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class ServiceVariationResponseDto {
  id: string;
  name: string;
  price: number;
  observation?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ServiceResponseDto {
  id: string;
  name: string;
  description?: string;
  variations: ServiceVariationResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}
