import React, { useState, useRef, useEffect } from 'react';
import { 
  MoreVertical, 
  Eye, 
  Edit, 
  FileText, 
  Copy, 
  XCircle, 
  AlertCircle,
  Link2,
  Mail,
  Trash2,
} from 'lucide-react';
import { Invoice } from '@types/index';

interface InvoiceActionsMenuNewProps {
  invoice: Invoice;
  onView?: () => void;
  onEdit?: () => void;
  onExportPDF?: () => void;
  onClone?: () => void;
  onDesist?: () => void;
  onAbandon?: () => void;
  onGeneratePublicUrl?: () => void;
  onSendEmail?: () => void;
  onDelete?: () => void;
}

export const InvoiceActionsMenuNew: React.FC<InvoiceActionsMenuNewProps> = ({
  invoice,
  onView,
  onEdit,
  onExportPDF,
  onClone,
  onDesist,
  onAbandon,
  onGeneratePublicUrl,
  onSendEmail,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const canEdit = invoice.status !== 'APPROVED';
  const canDelete = invoice.status !== 'APPROVED';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Ações"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            {onView && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(onView);
                }}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>Visualizar</span>
              </button>
            )}

            {onEdit && canEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(onEdit);
                }}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Editar</span>
              </button>
            )}

            {onExportPDF && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(onExportPDF);
                }}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span>Exportar para PDF</span>
              </button>
            )}

            {onClone && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(onClone);
                }}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Copy className="h-4 w-4" />
                <span>Clonar</span>
              </button>
            )}

            <div className="border-t border-gray-200 my-1" />

            {onGeneratePublicUrl && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(onGeneratePublicUrl);
                }}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Link2 className="h-4 w-4" />
                <span>Gerar Página Pública</span>
              </button>
            )}

            {onSendEmail && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(onSendEmail);
                }}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>Enviar por Email</span>
              </button>
            )}

            <div className="border-t border-gray-200 my-1" />

            {onDesist && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(onDesist);
                }}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50 transition-colors"
              >
                <AlertCircle className="h-4 w-4" />
                <span>Marcar como Desistido</span>
              </button>
            )}

            {onAbandon && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(onAbandon);
                }}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-orange-700 hover:bg-orange-50 transition-colors"
              >
                <XCircle className="h-4 w-4" />
                <span>Marcar como Abandonado</span>
              </button>
            )}

            {onDelete && canDelete && (
              <>
                <div className="border-t border-gray-200 my-1" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction(onDelete);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Deletar</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
