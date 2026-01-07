import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export enum InvoiceStatusEnum {
  DRAFT = 'DRAFT',
  READY = 'READY',
  EXPIRED = 'EXPIRED',
  APPROVED = 'APPROVED',
  REFUSED = 'REFUSED',
  COMPLETED = 'COMPLETED',
  INVOICED = 'INVOICED',
  ABANDONED = 'ABANDONED',
  DESISTED = 'DESISTED',
}

export enum GroupTypeEnum {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
}

export enum PaymentTypeEnum {
  CASH = 'CASH',
  INSTALLMENTS = 'INSTALLMENTS',
  DEBIT_CARD = 'DEBIT_CARD',
  CREDIT_CARD = 'CREDIT_CARD',
  PIX = 'PIX',
  BOLETO = 'BOLETO',
}

export class CreateInvoiceItemDto {
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  unitPrice: number;

  @IsString()
  @IsOptional()
  customName?: string;

  @IsString()
  @IsOptional()
  customDescription?: string;

  @IsNumber()
  @IsOptional()
  customPrice?: number;

  @IsString()
  @IsOptional()
  productId?: string;

  @IsString()
  @IsOptional()
  serviceId?: string;

  @IsString()
  @IsOptional()
  productVariationId?: string;

  @IsString()
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

export class CreatePaymentConditionDto {
  @IsEnum(PaymentTypeEnum)
  @IsNotEmpty()
  type: PaymentTypeEnum;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  numberOfInstallments?: number;

  @IsNumber()
  @IsOptional()
  interestRate?: number;
}

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsDateString()
  @IsOptional()
  proposalValidDate?: string;

  @IsString()
  @IsOptional()
  origin?: string;

  @IsString()
  @IsOptional()
  observations?: string;

  @IsString()
  @IsOptional()
  responsible?: string;

  @IsString()
  @IsOptional()
  internalReference?: string;

  @IsNumber()
  @IsOptional()
  discounts?: number;

  @IsNumber()
  @IsOptional()
  additions?: number;

  @IsNumber()
  @IsOptional()
  displacement?: number;

  @IsArray()
  @IsOptional()
  groups?: CreateInvoiceGroupDto[];

  @IsArray()
  @IsOptional()
  paymentConditions?: CreatePaymentConditionDto[];
}

export class UpdateInvoiceDto {
  @IsString()
  @IsOptional()
  clientId?: string;

  @IsEnum(InvoiceStatusEnum)
  @IsOptional()
  status?: InvoiceStatusEnum;

  @IsDateString()
  @IsOptional()
  proposalValidDate?: string;

  @IsString()
  @IsOptional()
  origin?: string;

  @IsString()
  @IsOptional()
  observations?: string;

  @IsString()
  @IsOptional()
  responsible?: string;

  @IsString()
  @IsOptional()
  internalReference?: string;

  @IsNumber()
  @IsOptional()
  discounts?: number;

  @IsNumber()
  @IsOptional()
  additions?: number;

  @IsNumber()
  @IsOptional()
  displacement?: number;

  @IsArray()
  @IsOptional()
  groups?: CreateInvoiceGroupDto[];

  @IsArray()
  @IsOptional()
  paymentConditions?: CreatePaymentConditionDto[];
}

export class InvoiceResponseDto {
  id: string;
  code: string;
  clientId: string;
  status: InvoiceStatusEnum;
  totalAmount: number;
  finalAmount: number;
  publicUrl: string;
  publicUrlActive: boolean;
  proposalValidDate?: Date;
  origin?: string;
  observations?: string;
  responsible?: string;
  internalReference?: string;
  discounts: number;
  additions: number;
  displacement: number;
  responseStatus?: string;
  responseDate?: Date;
  clientResponseReason?: string;
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
      customName?: string;
      customDescription?: string;
      customPrice?: number;
      productId?: string;
      serviceId?: string;
      productVariationId?: string;
      serviceVariationId?: string;
    }>;
  }>;
  paymentConditions: Array<{
    id: string;
    type: PaymentTypeEnum;
    description?: string;
    numberOfInstallments?: number;
    interestRate: number;
  }>;
}

export class CloneInvoiceDto {
  @IsBoolean()
  @IsOptional()
  updatePrices?: boolean;
}

export class ChangeInvoiceStatusDto {
  @IsEnum(InvoiceStatusEnum)
  @IsNotEmpty()
  status: InvoiceStatusEnum;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class ClientResponseDto {
  @IsString()
  @IsOptional()
  reason?: string;
}
