import React from 'react';
import { InvoiceStatus } from '@/types';
import { Badge } from '@/components';

interface StatusConfig {
  label: string;
  variant: 'success' | 'warning' | 'danger' | 'primary' | 'secondary';
}

const statusConfig: Record<InvoiceStatus, StatusConfig> = {
  [InvoiceStatus.DRAFT]: {
    label: 'Rascunho',
    variant: 'secondary',
  },
  [InvoiceStatus.READY]: {
    label: 'Pronto',
    variant: 'primary',
  },
  [InvoiceStatus.EXPIRED]: {
    label: 'Vencido',
    variant: 'warning',
  },
  [InvoiceStatus.APPROVED]: {
    label: 'Aprovado',
    variant: 'success',
  },
  [InvoiceStatus.REFUSED]: {
    label: 'Recusado',
    variant: 'danger',
  },
  [InvoiceStatus.COMPLETED]: {
    label: 'Concluído',
    variant: 'success',
  },
  [InvoiceStatus.INVOICED]: {
    label: 'Faturado',
    variant: 'primary',
  },
  [InvoiceStatus.ABANDONED]: {
    label: 'Abandonado',
    variant: 'warning',
  },
  [InvoiceStatus.DESISTED]: {
    label: 'Desistido',
    variant: 'secondary',
  },
};

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

export const InvoiceStatusBadge: React.FC<InvoiceStatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};
