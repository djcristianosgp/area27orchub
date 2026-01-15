import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@components/layout';
import { Button, Card, Badge, Table, Modal } from '@components/ui';
import { PageHeader, SearchBar, EmptyState, Loading } from '@components/common';
import { InvoiceItemCard } from '@components/features';
import api from '@services/api';
import { Plus, Eye, Edit2, Copy, Trash2, Filter } from 'lucide-react';
import type { Invoice } from '@types/index';

type ViewMode = 'list' | 'cards' | 'kanban';

export const InvoicesPageNew: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchQuery, selectedStatus]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await api.getInvoices();
      setInvoices(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = invoices;

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((inv) => inv.status?.toLowerCase() === selectedStatus.toLowerCase());
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.client?.name?.toLowerCase().includes(query) ||
          inv.id?.toLowerCase().includes(query)
      );
    }

    setFilteredInvoices(filtered);
  };

  const handleNew = () => {
    navigate('/admin/invoices/new');
  };

  const handleView = (invoice: Invoice) => {
    navigate(`/public/invoice/${invoice.publicUrl}`);
  };

  const handleEdit = (invoice: Invoice) => {
    navigate(`/admin/invoices/${invoice.id}/edit`);
  };

  const handleClone = async (invoice: Invoice) => {
    try {
      // Implementar lógica de clone no backend
      const response = await api.post(`/invoices/${invoice.id}/clone`, {});
      await loadInvoices();
    } catch (error) {
      console.error('Erro ao clonar:', error);
    }
  };

  const handleDeleteConfirm = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!invoiceToDelete) return;

    try {
      await api.deleteInvoice(invoiceToDelete.id);
      await loadInvoices();
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Loading message="Carregando orçamentos..." />
      </AdminLayout>
    );
  }

  const stats = {
    total: invoices.length,
    draft: invoices.filter((inv) => inv.status === 'DRAFT').length,
    sent: invoices.filter((inv) => inv.status === 'SENT').length,
    approved: invoices.filter((inv) => inv.status === 'APPROVED').length,
    rejected: invoices.filter((inv) => inv.status === 'REJECTED').length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Orçamentos"
          subtitle="Gerencie todos os seus orçamentos virtuais"
          action={
            <Button onClick={handleNew} variant="primary" size="lg">
              <Plus className="h-5 w-5" />
              Novo Orçamento
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="cursor-pointer hover:shadow-md" onClick={() => setSelectedStatus('all')}>
            <div className="text-center">
              <p className="text-secondary-600 text-sm font-medium">Total</p>
              <p className="text-3xl font-bold text-secondary-900 mt-2">{stats.total}</p>
            </div>
          </Card>
          <Card
            className="cursor-pointer hover:shadow-md"
            onClick={() => setSelectedStatus('draft')}
          >
            <div className="text-center">
              <Badge variant="secondary" className="mx-auto mb-2">
                Rascunho
              </Badge>
              <p className="text-2xl font-bold text-secondary-900">{stats.draft}</p>
            </div>
          </Card>
          <Card className="cursor-pointer hover:shadow-md" onClick={() => setSelectedStatus('sent')}>
            <div className="text-center">
              <Badge variant="primary" className="mx-auto mb-2">
                Enviado
              </Badge>
              <p className="text-2xl font-bold text-secondary-900">{stats.sent}</p>
            </div>
          </Card>
          <Card
            className="cursor-pointer hover:shadow-md"
            onClick={() => setSelectedStatus('approved')}
          >
            <div className="text-center">
              <Badge variant="success" className="mx-auto mb-2">
                Aprovado
              </Badge>
              <p className="text-2xl font-bold text-secondary-900">{stats.approved}</p>
            </div>
          </Card>
          <Card
            className="cursor-pointer hover:shadow-md"
            onClick={() => setSelectedStatus('rejected')}
          >
            <div className="text-center">
              <Badge variant="danger" className="mx-auto mb-2">
                Recusado
              </Badge>
              <p className="text-2xl font-bold text-secondary-900">{stats.rejected}</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                onSearch={setSearchQuery}
                placeholder="Pesquisar por cliente ou ID..."
              />
            </div>
            <div className="flex gap-2">
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as ViewMode)}
                className="input-base px-4 py-2 text-sm"
              >
                <option value="cards">Visualizar: Cards</option>
                <option value="list">Visualizar: Lista</option>
                <option value="kanban">Visualizar: Kanban</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Content */}
        {filteredInvoices.length === 0 ? (
          <EmptyState
            title="Nenhum orçamento encontrado"
            description={
              invoices.length === 0
                ? 'Comece criando seu primeiro orçamento'
                : 'Tente ajustar seus filtros de pesquisa'
            }
            action={
              invoices.length === 0
                ? { label: 'Criar Primeiro Orçamento', onClick: handleNew }
                : undefined
            }
          />
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInvoices.map((invoice) => (
              <InvoiceItemCard
                key={invoice.id}
                id={invoice.id}
                clientName={invoice.client?.name || 'Cliente Sem Nome'}
                total={invoice.totalAmount || 0}
                status={invoice.status as any}
                date={invoice.createdAt}
                itemsCount={invoice.items?.length || 0}
                onView={() => handleView(invoice)}
                onEdit={() => handleEdit(invoice)}
                onClone={() => handleClone(invoice)}
                onDelete={() => handleDeleteConfirm(invoice)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <div className="p-6">
              <Table
                columns={[
                  {
                    key: 'client' as any,
                    label: 'Cliente',
                    render: (_, row: any) => row.client?.name || '-',
                  },
                  {
                    key: 'id' as any,
                    label: 'ID',
                    render: (val) => val.substring(0, 8) + '...',
                  },
                  {
                    key: 'totalAmount' as any,
                    label: 'Total',
                    render: (val) =>
                      `R$ ${(val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  },
                  {
                    key: 'status' as any,
                    label: 'Status',
                    render: (val) => (
                      <Badge
                        variant={
                          val === 'APPROVED'
                            ? 'success'
                            : val === 'SENT'
                              ? 'primary'
                              : val === 'REJECTED'
                                ? 'danger'
                                : 'secondary'
                        }
                      >
                        {val === 'DRAFT'
                          ? 'Rascunho'
                          : val === 'SENT'
                            ? 'Enviado'
                            : val === 'APPROVED'
                              ? 'Aprovado'
                              : 'Recusado'}
                      </Badge>
                    ),
                  },
                  {
                    key: 'createdAt' as any,
                    label: 'Data',
                    render: (val) => new Date(val).toLocaleDateString('pt-BR'),
                  },
                ]}
                data={filteredInvoices}
                onRowClick={handleView}
              />
            </div>
          </Card>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          title="Confirmar Exclusão"
        >
          <div className="space-y-4">
            <p className="text-secondary-700">
              Tem certeza que deseja deletar o orçamento do cliente{' '}
              <strong>{invoiceToDelete?.client?.name}</strong>?
            </p>
            <p className="text-sm text-secondary-500">Esta ação não pode ser desfeita.</p>
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <Button
              variant="ghost"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirmed}>
              Deletar
            </Button>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};
