import React from 'react';
import { Badge } from '@components/ui';
import { Eye, Edit2, Copy, Trash2, MoreVertical } from 'lucide-react';

interface InvoiceStatus {
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  label: string;
}

interface InvoiceItemCardProps {
  id: string;
  clientName: string;
  total: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  date: string;
  itemsCount: number;
  onView?: () => void;
  onEdit?: () => void;
  onClone?: () => void;
  onDelete?: () => void;
}

const statusConfig: Record<string, { variant: any; label: string }> = {
  draft: { variant: 'secondary', label: 'Rascunho' },
  sent: { variant: 'primary', label: 'Enviado' },
  approved: { variant: 'success', label: 'Aprovado' },
  rejected: { variant: 'danger', label: 'Recusado' },
};

export const InvoiceItemCard: React.FC<InvoiceItemCardProps> = ({
  id,
  clientName,
  total,
  status,
  date,
  itemsCount,
  onView,
  onEdit,
  onClone,
  onDelete,
}) => {
  const config = statusConfig[status];

  return (
    <div className="bg-white rounded-xl border border-secondary-200 p-4 hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-semibold text-secondary-900">{clientName}</h4>
          <p className="text-sm text-secondary-500">ID: {id}</p>
        </div>
        <Badge variant={config.variant as any}>{config.label}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-secondary-500">Total</p>
          <p className="text-lg font-semibold text-secondary-900">
            R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-secondary-500">Itens</p>
          <p className="text-lg font-semibold text-secondary-900">{itemsCount}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-secondary-500">{new Date(date).toLocaleDateString('pt-BR')}</p>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onView && (
            <button
              onClick={onView}
              className="p-1.5 hover:bg-primary-100 rounded-lg text-primary-600 transition-colors"
              title="Visualizar"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 hover:bg-primary-100 rounded-lg text-primary-600 transition-colors"
              title="Editar"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
          {onClone && (
            <button
              onClick={onClone}
              className="p-1.5 hover:bg-accent-100 rounded-lg text-accent-600 transition-colors"
              title="Clonar"
            >
              <Copy className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 hover:bg-danger-100 rounded-lg text-danger-600 transition-colors"
              title="Excluir"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
