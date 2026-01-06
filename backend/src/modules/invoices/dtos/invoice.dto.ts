import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsUUID,
  IsEnum,
} from 'class-validator';

export enum InvoiceStatusEnum {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  APPROVED = 'APPROVED',
  REFUSED = 'REFUSED',
}

export enum GroupTypeEnum {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
}

export class CreateInvoiceItemDto {
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  unitPrice: number;

  @IsUUID()
  @IsOptional()
  productId?: string;

  @IsUUID()
  @IsOptional()
  serviceId?: string;

  @IsUUID()
  @IsOptional()
  productVariationId?: string;

  @IsUUID()
  @IsOptional()
  serviceVariationId?: string;
}

export class CreateInvoiceGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(GroupTypeEnum)
  @IsNotEmpty()
  type: GroupTypeEnum;

  @IsArray()
  @IsNotEmpty()
  items: CreateInvoiceItemDto[];
}

export class CreateInvoiceDto {
  @IsUUID()
  @IsNotEmpty()
  clientId: string;

  @IsArray()
  @IsNotEmpty()
  groups: CreateInvoiceGroupDto[];
}

export class UpdateInvoiceDto {
  @IsEnum(InvoiceStatusEnum)
  @IsOptional()
  status?: InvoiceStatusEnum;

  @IsArray()
  @IsOptional()
  groups?: CreateInvoiceGroupDto[];
}

export class InvoiceResponseDto {
  id: string;
  clientId: string;
  status: InvoiceStatusEnum;
  totalAmount: number;
  publicUrl: string;
  responseStatus?: string;
  responseDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class InvoiceDetailResponseDto extends InvoiceResponseDto {
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  groups: Array<{
    id: string;
    name: string;
    type: GroupTypeEnum;
    items: Array<{
      id: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      productId?: string;
      serviceId?: string;
    }>;
  }>;
}
