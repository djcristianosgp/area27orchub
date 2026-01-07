import React from 'react';
import { Invoice, InvoiceStatus } from '@types/index';
import { InvoiceCard } from './InvoiceCard';
import { InvoiceStatusBadgeNew } from './InvoiceStatusBadgeNew';

interface InvoiceKanbanProps {
  invoices: Invoice[];
  onView?: (invoice: Invoice) => void;
  onEdit?: (invoice: Invoice) => void;
  onActions?: (invoice: Invoice) => void;
}

const statusColumns: Array<{
  status: InvoiceStatus;
  title: string;
  color: string;
}> = [
  { status: InvoiceStatus.DRAFT, title: 'Rascunho', color: 'bg-gray-50' },
  { status: InvoiceStatus.READY, title: 'Pronto', color: 'bg-blue-50' },
  { status: InvoiceStatus.EXPIRED, title: 'Vencido', color: 'bg-orange-50' },
  { status: InvoiceStatus.APPROVED, title: 'Aprovado', color: 'bg-green-50' },
  { status: InvoiceStatus.REFUSED, title: 'Recusado', color: 'bg-red-50' },
  { status: InvoiceStatus.COMPLETED, title: 'Concluído', color: 'bg-purple-50' },
  { status: InvoiceStatus.INVOICED, title: 'Faturado', color: 'bg-indigo-50' },
  { status: InvoiceStatus.DESISTED, title: 'Desistido', color: 'bg-yellow-50' },
  { status: InvoiceStatus.ABANDONED, title: 'Abandonado', color: 'bg-gray-50' },
];

export const InvoiceKanban: React.FC<InvoiceKanbanProps> = ({
  invoices,
  onView,
  onEdit,
  onActions,
}) => {
  const getInvoicesByStatus = (status: InvoiceStatus) => {
    return invoices.filter((inv) => inv.status === status);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {statusColumns.map((column) => {
        const columnInvoices = getInvoicesByStatus(column.status);
        
        return (
          <div
            key={column.status}
            className="flex-shrink-0 w-80"
          >
            {/* Column Header */}
            <div className={`${column.color} rounded-t-lg p-3 border-b border-gray-200`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <span className="text-sm text-gray-600 bg-white px-2 py-0.5 rounded-full">
                  {columnInvoices.length}
                </span>
              </div>
            </div>

            {/* Column Content */}
            <div className="bg-gray-50 rounded-b-lg p-3 min-h-[500px] max-h-[calc(100vh-300px)] overflow-y-auto">
              <div className="space-y-3">
                {columnInvoices.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    Nenhum orçamento
                  </div>
                ) : (
                  columnInvoices.map((invoice) => (
                    <InvoiceCard
                      key={invoice.id}
                      invoice={invoice}
                      onView={onView}
                      onEdit={onEdit}
                      onActions={onActions}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
