import React, { useState } from 'react';
import { Invoice, InvoiceStatus } from '@/types';
import { Button, Modal } from '@/components';
import api from '@/services/api';
import { useNavigate } from 'react-router-dom';
import {
  PencilIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  DocumentDuplicateIcon,
  LinkIcon,
  EnvelopeIcon,
  XCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface InvoiceActionsMenuProps {
  invoice: Invoice;
  onUpdate?: () => void;
  compact?: boolean;
}

export const InvoiceActionsMenu: React.FC<InvoiceActionsMenuProps> = ({
  invoice,
  onUpdate,
  compact = false,
}) => {
  const navigate = useNavigate();
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [updatePrices, setUpdatePrices] = useState(false);
  const [newStatus, setNewStatus] = useState<InvoiceStatus>(invoice.status);
  const [statusReason, setStatusReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleView = () => {
    navigate(`/admin/invoices/${invoice.id}`);
  };

  const handleEdit = () => {
    if (invoice.status === InvoiceStatus.APPROVED) {
      alert('Orçamentos aprovados não podem ser editados');
      return;
    }
    navigate(`/admin/invoices/${invoice.id}/edit`);
  };

  const handleClone = async () => {
    try {
      setLoading(true);
      const response = await api.cloneInvoice(invoice.id, updatePrices);
      alert('Orçamento clonado com sucesso!');
      navigate(`/admin/invoices/${response.data.id}/edit`);
      setShowCloneModal(false);
    } catch (error) {
      console.error('Erro ao clonar orçamento:', error);
      alert('Erro ao clonar orçamento');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async () => {
    try {
      setLoading(true);
      await api.changeInvoiceStatus(invoice.id, newStatus, statusReason);
      alert('Status alterado com sucesso!');
      setShowStatusModal(false);
      onUpdate?.();
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      alert(error?.response?.data?.message || 'Erro ao alterar status');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/invoice/${invoice.publicUrl}`;
    navigator.clipboard.writeText(link);
    alert('Link copiado para a área de transferência!');
    setShowLinkModal(false);
  };

  const handleSendEmail = () => {
    // TODO: Implementar envio de email
    alert('Funcionalidade de envio de email será implementada');
  };

  const handleExportPDF = () => {
    // TODO: Implementar exportação para PDF
    alert('Exportação para PDF será implementada');
  };

  const needsReason = (status: InvoiceStatus) => {
    return [
      InvoiceStatus.REFUSED,
      InvoiceStatus.ABANDONED,
      InvoiceStatus.DESISTED,
    ].includes(status);
  };

  if (compact) {
    return (
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={handleView}>
          <EyeIcon className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="secondary" onClick={handleEdit}>
          <PencilIcon className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setShowCloneModal(true)}>
          <DocumentDuplicateIcon className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={handleView}>
          <EyeIcon className="h-4 w-4 mr-1" />
          Visualizar
        </Button>

        <Button size="sm" variant="secondary" onClick={handleEdit}>
          <PencilIcon className="h-4 w-4 mr-1" />
          Editar
        </Button>

        <Button size="sm" variant="secondary" onClick={handleExportPDF}>
          <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
          PDF
        </Button>

        <Button size="sm" variant="secondary" onClick={() => setShowCloneModal(true)}>
          <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
          Clonar
        </Button>

        <Button size="sm" variant="secondary" onClick={() => setShowStatusModal(true)}>
          <CheckCircleIcon className="h-4 w-4 mr-1" />
          Status
        </Button>

        <Button size="sm" variant="secondary" onClick={() => setShowLinkModal(true)}>
          <LinkIcon className="h-4 w-4 mr-1" />
          Link
        </Button>

        <Button size="sm" variant="secondary" onClick={handleSendEmail}>
          <EnvelopeIcon className="h-4 w-4 mr-1" />
          Email
        </Button>
      </div>

      {/* Modal de Clonar */}
      <Modal
        isOpen={showCloneModal}
        onClose={() => setShowCloneModal(false)}
        title="Clonar Orçamento"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Deseja criar uma cópia do orçamento <strong>{invoice.code}</strong>?
          </p>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={updatePrices}
              onChange={(e) => setUpdatePrices(e.target.checked)}
              className="mt-1"
            />
            <div>
              <div className="font-medium">Atualizar preços</div>
              <div className="text-sm text-gray-500">
                Ao marcar esta opção, os preços serão atualizados com os valores
                atuais cadastrados nos produtos e serviços.
              </div>
            </div>
          </label>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowCloneModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleClone} disabled={loading}>
              {loading ? 'Clonando...' : 'Clonar Orçamento'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Mudança de Status */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Alterar Status"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Novo Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as InvoiceStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {Object.values(InvoiceStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {needsReason(newStatus) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo <span className="text-red-500">*</span>
              </label>
              <textarea
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                rows={3}
                placeholder="Descreva o motivo..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleChangeStatus} 
              disabled={loading || (needsReason(newStatus) && !statusReason)}
            >
              {loading ? 'Alterando...' : 'Alterar Status'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Link Público */}
      <Modal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        title="Link Público do Orçamento"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Compartilhe este link com o cliente para que ele possa visualizar o orçamento:
          </p>

          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <code className="text-sm break-all">
              {`${window.location.origin}/invoice/${invoice.publicUrl}`}
            </code>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowLinkModal(false)}>
              Fechar
            </Button>
            <Button onClick={handleCopyLink}>
              <LinkIcon className="h-4 w-4 mr-2" />
              Copiar Link
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
