import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AdminLayout,
  PageHeader,
  Button,
  EmptyState,
  ViewModeSelector,
  InvoiceCard,
  InvoiceKanban,
  InvoiceActionsMenuNew,
  Table,
  InvoiceStatusBadgeNew,
  Modal,
  MultiSelect,
} from '@components/index';
import api from '@services/api';
import { Invoice, InvoiceStatus, Client, Product, Service } from '@types/index';
import { Plus, Filter, FileText, Download, Eye, Edit, Trash2 } from 'lucide-react';
import type { ViewMode } from '@components/index';

export const InvoicesListPageNew: React.FC = () => {
  const navigate = useNavigate();
  
  // Estado
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Filtros
  const [showFilters, setShowFilters] = useState(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneInvoice, setCloneInvoice] = useState<Invoice | null>(null);
  const [updatePricesOnClone, setUpdatePricesOnClone] = useState(false);
  
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusInvoice, setStatusInvoice] = useState<Invoice | null>(null);
  const [statusReason, setStatusReason] = useState('');
  const [newStatus, setNewStatus] = useState<InvoiceStatus | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invoicesRes, clientsRes, productsRes, servicesRes] = await Promise.all([
        api.getInvoices(),
        api.getClients(),
        api.getProducts(),
        api.getServices(),
      ]);
      setInvoices(invoicesRes.data || []);
      setClients(clientsRes.data || []);
      setProducts(productsRes.data || []);
      setServices(servicesRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtragem
  const filteredInvoices = invoices.filter((invoice) => {
    if (selectedClients.length > 0 && !selectedClients.includes(invoice.clientId)) {
      return false;
    }
    
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(invoice.status)) {
      return false;
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchCode = invoice.code?.toLowerCase().includes(term);
      const matchClient = invoice.client?.name?.toLowerCase().includes(term);
      if (!matchCode && !matchClient) return false;
    }

    // TODO: Filtrar por produtos e serviços quando disponíveis nos itens
    
    return true;
  });

  // Ações
  const handleNew = () => {
    navigate('/admin/invoices/new');
  };

  const handleView = (invoice: Invoice) => {
    navigate(`/admin/invoices/${invoice.id}`);
  };

  const handleEdit = (invoice: Invoice) => {
    if (invoice.status === InvoiceStatus.APPROVED) {
      alert('Orçamentos aprovados não podem ser editados');
      return;
    }
    navigate(`/admin/invoices/${invoice.id}/edit`);
  };

  const handleClone = (invoice: Invoice) => {
    setCloneInvoice(invoice);
    setUpdatePricesOnClone(false);
    setShowCloneModal(true);
  };

  const confirmClone = async () => {
    if (!cloneInvoice) return;

    try {
      await api.cloneInvoice(cloneInvoice.id, updatePricesOnClone);
      setShowCloneModal(false);
      setCloneInvoice(null);
      await loadData();
    } catch (error) {
      console.error('Erro ao clonar:', error);
      alert('Erro ao clonar orçamento');
    }
  };

  const handleDesist = (invoice: Invoice) => {
    setStatusInvoice(invoice);
    setNewStatus(InvoiceStatus.DESISTED);
    setStatusReason('');
    setShowStatusModal(true);
  };

  const handleAbandon = (invoice: Invoice) => {
    setStatusInvoice(invoice);
    setNewStatus(InvoiceStatus.ABANDONED);
    setStatusReason('');
    setShowStatusModal(true);
  };

  const confirmStatusChange = async () => {
    if (!statusInvoice || !newStatus) return;

    try {
      await api.changeInvoiceStatus(statusInvoice.id, newStatus, statusReason);
      setShowStatusModal(false);
      setStatusInvoice(null);
      setNewStatus(null);
      setStatusReason('');
      await loadData();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status do orçamento');
    }
  };

  const handleGeneratePublicUrl = async (invoice: Invoice) => {
    try {
      const response = await api.regenerateInvoicePublicUrl(invoice.id);
      const publicUrl = `${window.location.origin}/invoices/public/${response.data.publicUrl}`;
      
      // Copiar para área de transferência
      await navigator.clipboard.writeText(publicUrl);
      alert('URL pública copiada para a área de transferência!');
    } catch (error) {
      console.error('Erro ao gerar URL:', error);
      alert('Erro ao gerar URL pública');
    }
  };

  const handleSendEmail = (invoice: Invoice) => {
    // TODO: Implementar envio de email
    alert('Funcionalidade de envio de email será implementada em breve');
  };

  const handleExportPDF = (invoice: Invoice) => {
    // TODO: Implementar exportação para PDF
    alert('Funcionalidade de exportação para PDF será implementada em breve');
  };

  const handleDelete = async (invoice: Invoice) => {
    if (invoice.status === InvoiceStatus.APPROVED) {
      alert('Orçamentos aprovados não podem ser deletados');
      return;
    }

    if (!window.confirm(`Tem certeza que deseja deletar o orçamento ${invoice.code}?`)) {
      return;
    }

    try {
      await api.deleteInvoice(invoice.id);
      await loadData();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      alert('Erro ao deletar orçamento');
    }
  };

  const handleExportFiltered = () => {
    // TODO: Implementar exportação filtrada
    alert('Funcionalidade de exportação será implementada em breve');
  };

  // Formatação
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  // Opções para filtros
  const clientOptions = clients.map((c) => ({ value: c.id, label: c.name }));
  const productOptions = products.map((p) => ({ value: p.id, label: p.name }));
  const serviceOptions = services.map((s) => ({ value: s.id, label: s.name }));
  const statusOptions = Object.values(InvoiceStatus).map((status) => ({
    value: status,
    label: status,
  }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Orçamentos"
          subtitle="Gerencie todos os orçamentos do sistema"
        >
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              icon={Filter}
            >
              Filtros
            </Button>
            
            <Button
              variant="outline"
              onClick={handleExportFiltered}
              icon={Download}
            >
              Exportar
            </Button>

            <Button
              onClick={handleNew}
              icon={Plus}
            >
              Novo Orçamento
            </Button>
          </div>
        </PageHeader>

        {/* Filtros */}
        {showFilters && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MultiSelect
                label="Clientes"
                options={clientOptions}
                selected={selectedClients}
                onChange={setSelectedClients}
                placeholder="Todos os clientes"
              />

              <MultiSelect
                label="Produtos"
                options={productOptions}
                selected={selectedProducts}
                onChange={setSelectedProducts}
                placeholder="Todos os produtos"
              />

              <MultiSelect
                label="Serviços"
                options={serviceOptions}
                selected={selectedServices}
                onChange={setSelectedServices}
                placeholder="Todos os serviços"
              />

              <MultiSelect
                label="Status"
                options={statusOptions}
                selected={selectedStatuses}
                onChange={setSelectedStatuses}
                placeholder="Todos os status"
              />
            </div>

            <div className="mt-4">
              <input
                type="text"
                placeholder="Buscar por código ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Selector de visualização */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {filteredInvoices.length} orçamento(s) encontrado(s)
          </p>
          
          <ViewModeSelector
            currentMode={viewMode}
            onModeChange={setViewMode}
          />
        </div>

        {/* Conteúdo */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <EmptyState
            title="Nenhum orçamento encontrado"
            description="Comece criando um novo orçamento"
            action={
              <Button onClick={handleNew} icon={Plus}>
                Novo Orçamento
              </Button>
            }
          />
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInvoices.map((invoice) => (
                  <div key={invoice.id} className="relative">
                    <InvoiceCard
                      invoice={invoice}
                      onView={() => handleView(invoice)}
                      onEdit={() => handleEdit(invoice)}
                    />
                    <div className="absolute top-2 right-2">
                      <InvoiceActionsMenuNew
                        invoice={invoice}
                        onView={() => handleView(invoice)}
                        onEdit={() => handleEdit(invoice)}
                        onExportPDF={() => handleExportPDF(invoice)}
                        onClone={() => handleClone(invoice)}
                        onDesist={() => handleDesist(invoice)}
                        onAbandon={() => handleAbandon(invoice)}
                        onGeneratePublicUrl={() => handleGeneratePublicUrl(invoice)}
                        onSendEmail={() => handleSendEmail(invoice)}
                        onDelete={() => handleDelete(invoice)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <Table
                  columns={[
                    { header: 'Código', accessor: 'code' },
                    { header: 'Cliente', accessor: (inv: Invoice) => inv.client?.name || '-' },
                    { header: 'Status', accessor: (inv: Invoice) => <InvoiceStatusBadgeNew status={inv.status} /> },
                    { header: 'Data', accessor: (inv: Invoice) => formatDate(inv.createdAt) },
                    { header: 'Valor', accessor: (inv: Invoice) => formatCurrency(inv.finalAmount || inv.totalAmount) },
                    {
                      header: 'Ações',
                      accessor: (inv: Invoice) => (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(inv)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {inv.status !== InvoiceStatus.APPROVED && (
                            <button
                              onClick={() => handleEdit(inv)}
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          <InvoiceActionsMenuNew
                            invoice={inv}
                            onView={() => handleView(inv)}
                            onEdit={() => handleEdit(inv)}
                            onExportPDF={() => handleExportPDF(inv)}
                            onClone={() => handleClone(inv)}
                            onDesist={() => handleDesist(inv)}
                            onAbandon={() => handleAbandon(inv)}
                            onGeneratePublicUrl={() => handleGeneratePublicUrl(inv)}
                            onSendEmail={() => handleSendEmail(inv)}
                            onDelete={() => handleDelete(inv)}
                          />
                        </div>
                      ),
                    },
                  ]}
                  data={filteredInvoices}
                />
              </div>
            )}

            {/* Kanban View */}
            {viewMode === 'kanban' && (
              <InvoiceKanban
                invoices={filteredInvoices}
                onView={handleView}
                onEdit={handleEdit}
                onActions={(invoice) => {
                  // Menu de ações já está no card
                }}
              />
            )}
          </>
        )}

        {/* Modal de Clonagem */}
        <Modal
          isOpen={showCloneModal}
          onClose={() => setShowCloneModal(false)}
          title="Clonar Orçamento"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Deseja clonar o orçamento <strong>{cloneInvoice?.code}</strong>?
            </p>

            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                id="updatePrices"
                checked={updatePricesOnClone}
                onChange={(e) => setUpdatePricesOnClone(e.target.checked)}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="updatePrices" className="text-sm text-gray-700">
                <strong>Atualizar valores</strong>
                <p className="text-gray-600 mt-1">
                  Marque esta opção para usar os preços atuais dos produtos e serviços no novo orçamento.
                  Se desmarcado, os valores do orçamento original serão mantidos.
                </p>
              </label>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowCloneModal(false)}
              >
                Cancelar
              </Button>
              <Button onClick={confirmClone}>
                Clonar
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal de Mudança de Status */}
        <Modal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          title={`Marcar como ${newStatus === InvoiceStatus.DESISTED ? 'Desistido' : 'Abandonado'}`}
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Confirma a mudança de status do orçamento <strong>{statusInvoice?.code}</strong>?
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Justificativa (opcional)
              </label>
              <textarea
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite a justificativa..."
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowStatusModal(false)}
              >
                Cancelar
              </Button>
              <Button onClick={confirmStatusChange}>
                Confirmar
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};
