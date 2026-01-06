// Authentication store
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
}

// Category, Brand and Group types
export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Product types
export interface ProductVariation {
  id: string;
  name: string;
  price: number;
  affiliateLink?: string;
  observation?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  brandId: string;
  groupId: string;
  variations: ServiceVariation[];
  createdAt: Date;
  updatedAt: Date;
}

// Client types
export interface ClientEmail {
  id?: string;
  email: string;
  primary?: boolean;
}

export interface ClientPhone {
  id?: string;
  phone: string;
  hasWhatsapp?: boolean;
  primary?: boolean;
}

export interface ClientSocialMedia {
  id?: string;
  platform: string;
  url: string;
}

export interface Client {
  id: string;
  name: string;
  nickname?: string;
  cpfCnpj?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  zipCode?: string;
  state?: string;
  clientEmails: ClientEmail[];
  clientPhones: ClientPhone[];
  clientSocialMedia: ClientSocialMedia[];
  observations?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Invoice types
export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  APPROVED = 'APPROVED',
  REFUSED = 'REFUSED',
}

export enum GroupType {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
}

export interface InvoiceItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productId?: string;
  serviceId?: string;
  productVariationId?: string;
  serviceVariationId?: string;
}

export interface InvoiceGroup {
  id: string;
  name: string;
  type: GroupType;
  items: InvoiceItem[];
}

export interface Invoice {
  id: string;
  clientId: string;
  status: InvoiceStatus;
  totalAmount: number;
  publicUrl: string;
  responseStatus?: string;
  responseDate?: Date;
  groups?: InvoiceGroup[];
  client?: Client;
  createdAt: Date;
  updatedAt: Date;
}

// Coupon types
export interface Coupon {
  id: string;
  title: string;
  description?: string;
  platform: string;
  code: string;
  affiliateLink: string;
  validUntil: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
