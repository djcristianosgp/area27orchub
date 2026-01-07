import React from 'react';
import { InvoiceStatus } from '@types/index';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

const statusConfig = {
  [InvoiceStatus.DRAFT]: {
    label: 'Rascunho',
    className: 'bg-gray-100 text-gray-800',
  },
  [InvoiceStatus.READY]: {
    label: 'Pronto',
    className: 'bg-blue-100 text-blue-800',
  },
  [InvoiceStatus.EXPIRED]: {
    label: 'Vencido',
    className: 'bg-orange-100 text-orange-800',
  },
  [InvoiceStatus.APPROVED]: {
    label: 'Aprovado',
    className: 'bg-green-100 text-green-800',
  },
  [InvoiceStatus.REFUSED]: {
    label: 'Recusado',
    className: 'bg-red-100 text-red-800',
  },
  [InvoiceStatus.COMPLETED]: {
    label: 'Concluído',
    className: 'bg-purple-100 text-purple-800',
  },
  [InvoiceStatus.INVOICED]: {
    label: 'Faturado',
    className: 'bg-indigo-100 text-indigo-800',
  },
  [InvoiceStatus.ABANDONED]: {
    label: 'Abandonado',
    className: 'bg-gray-100 text-gray-600',
  },
  [InvoiceStatus.DESISTED]: {
    label: 'Desistido',
    className: 'bg-yellow-100 text-yellow-800',
  },
};

export const InvoiceStatusBadgeNew: React.FC<InvoiceStatusBadgeProps> = ({ 
  status, 
  className = '' 
}) => {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
};
