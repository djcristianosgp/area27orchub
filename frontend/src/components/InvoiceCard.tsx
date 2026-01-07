import React from 'react';
import { Invoice } from '@types/index';
import { InvoiceStatusBadgeNew } from './InvoiceStatusBadgeNew';
import { Calendar, User, DollarSign } from 'lucide-react';

interface InvoiceCardProps {
  invoice: Invoice;
  onView?: (invoice: Invoice) => void;
  onEdit?: (invoice: Invoice) => void;
  onActions?: (invoice: Invoice) => void;
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({
  invoice,
  onView,
  onEdit,
  onActions,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onView?.(invoice)}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{invoice.code}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {invoice.client?.name || 'Cliente não informado'}
            </p>
          </div>
          <InvoiceStatusBadgeNew status={invoice.status} />
        </div>

        {/* Info */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Criado em {formatDate(invoice.createdAt)}</span>           
          </div>

          {invoice.proposalValidDate && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Validade: {formatDate(invoice.proposalValidDate)}</span>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Valor Total</span>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(invoice.finalAmount || invoice.totalAmount)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(invoice);
            }}
            className="flex-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
          >
            Editar
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onActions?.(invoice);
            }}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Ações
          </button>
        </div>
      </div>
    </div>
  );
};
