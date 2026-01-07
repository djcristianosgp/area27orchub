import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import { Invoice, InvoiceStatus } from '@/types';
import {
  PageHeader,
  Button,
  Card,
  InvoiceStatusBadge,
  InvoiceActionsMenu,
  EmptyState,
} from '@/components';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TableCellsIcon,
  Squares2X2Icon,
  ViewColumnsIcon,
} from '@heroicons/react/24/outline';

type ViewMode = 'grid' | 'cards' | 'kanban';

export const InvoicesListPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [showFilters, setShowFilters] = useState(false);

  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    clientId: '',
    status: '',
    productId: '',
    serviceId: '',
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const params: any = {};

      if (filters.search) params.search = filters.search;
      if (filters.clientId) params.clientId = filters.clientId;
      if (filters.status) params.status = filters.status;
      if (filters.productId) params.productId = filters.productId;
      if (filters.serviceId) params.serviceId = filters.serviceId;

      const response = await api.getInvoices(params);
      setInvoices(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadInvoices();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const groupedByStatus = invoices.reduce((acc, invoice) => {
    if (!acc[invoice.status]) {
      acc[invoice.status] = [];
    }
    acc[invoice.status].push(invoice);
    return acc;
  }, {} as Record<InvoiceStatus, Invoice[]>);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        emoji="📋"
        title="Orçamentos"
        description="Gerencie seus orçamentos virtuais"
        actions={
          <Link to="/admin/invoices/new">
            <Button>
              <PlusIcon className="h-5 w-5 mr-2" />
              Novo Orçamento
            </Button>
          </Link>
        }
      />

      {/* Barra de ferramentas */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por código ou cliente..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <Button onClick={handleSearch}>
              Buscar
            </Button>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filtros
            </Button>

            {/* Alternância de visualização */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${
                  viewMode === 'grid'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                title="Grade"
              >
                <TableCellsIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 border-l border-gray-300 ${
                  viewMode === 'cards'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                title="Cards"
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 border-l border-gray-300 ${
                  viewMode === 'kanban'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                title="Kanban"
              >
                <ViewColumnsIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Painel de filtros */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                {Object.values(InvoiceStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={handleSearch}>Aplicar Filtros</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setFilters({
                    search: '',
                    clientId: '',
                    status: '',
                    productId: '',
                    serviceId: '',
                  });
                  loadInvoices();
                }}
              >
                Limpar
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Conteúdo */}
      {invoices.length === 0 ? (
        <EmptyState
          emoji="📋"
          title="Nenhum orçamento encontrado"
          description="Comece criando seu primeiro orçamento"
          action={
            <Link to="/admin/invoices/new">
              <Button>
                <PlusIcon className="h-5 w-5 mr-2" />
                Criar Orçamento
              </Button>
            </Link>
          }
        />
      ) : viewMode === 'kanban' ? (
        <KanbanView
          groupedByStatus={groupedByStatus}
          onUpdate={loadInvoices}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      ) : viewMode === 'cards' ? (
        <CardsView
          groupedByStatus={groupedByStatus}
          onUpdate={loadInvoices}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      ) : (
        <GridView
          invoices={invoices}
          onUpdate={loadInvoices}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      )}
    </div>
  );
};

// Visualização em Kanban
interface ViewProps {
  groupedByStatus?: Record<InvoiceStatus, Invoice[]>;
  invoices?: Invoice[];
  onUpdate: () => void;
  formatCurrency: (value: number) => string;
  formatDate: (date: string) => string;
}

const KanbanView: React.FC<ViewProps> = ({
  groupedByStatus,
  onUpdate,
  formatCurrency,
  formatDate,
}) => {
  const statusOrder: InvoiceStatus[] = [
    InvoiceStatus.DRAFT,
    InvoiceStatus.READY,
    InvoiceStatus.APPROVED,
    InvoiceStatus.COMPLETED,
    InvoiceStatus.INVOICED,
    InvoiceStatus.EXPIRED,
    InvoiceStatus.REFUSED,
    InvoiceStatus.ABANDONED,
    InvoiceStatus.DESISTED,
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {statusOrder.map((status) => {
        const invoices = groupedByStatus?.[status] || [];

        return (
          <div key={status} className="flex-shrink-0 w-80">
            <div className="bg-gray-100 px-4 py-2 rounded-t-lg font-semibold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <InvoiceStatusBadge status={status} />
              </span>
              <span className="bg-white px-2 py-0.5 rounded-full text-xs">
                {invoices.length}
              </span>
            </div>
            <div className="bg-gray-50 p-2 rounded-b-lg space-y-2 min-h-[200px]">
              {invoices.map((invoice) => (
                <InvoiceKanbanCard
                  key={invoice.id}
                  invoice={invoice}
                  onUpdate={onUpdate}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Visualização em Cards
const CardsView: React.FC<ViewProps> = ({
  groupedByStatus,
  onUpdate,
  formatCurrency,
  formatDate,
}) => {
  return (
    <div className="space-y-8">
      {Object.entries(groupedByStatus || {}).map(([status, invoices]) => {
        if (invoices.length === 0) return null;

        return (
          <div key={status}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <InvoiceStatusBadge status={status as InvoiceStatus} />
              <span className="text-gray-500 text-sm">({invoices.length})</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {invoices.map((invoice) => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  onUpdate={onUpdate}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Visualização em Grade (Tabela)
const GridView: React.FC<ViewProps> = ({
  invoices,
  onUpdate,
  formatCurrency,
  formatDate,
}) => {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Criado em
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vence em
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices?.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {invoice.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invoice.client?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <InvoiceStatusBadge status={invoice.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                  {formatCurrency(invoice.totalAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(invoice.createdAt.toString())}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(invoice.proposalValidDate?.toString() || '')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <InvoiceActionsMenu invoice={invoice} onUpdate={onUpdate} compact />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// Card de Orçamento
interface InvoiceCardProps {
  invoice: Invoice;
  onUpdate: () => void;
  formatCurrency: (value: number) => string;
  formatDate: (date: string) => string;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({
  invoice,
  onUpdate,
  formatCurrency,
  formatDate,
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{invoice.code}</h4>
          <p className="text-sm text-gray-600">{invoice.client?.name || 'N/A'}</p>
        </div>
        <InvoiceStatusBadge status={invoice.status} />
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total</span>
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(invoice.totalAmount)}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">Criado em</span>
          <span className="text-xs text-gray-500">
            {formatDate(invoice.createdAt.toString())}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <InvoiceActionsMenu invoice={invoice} onUpdate={onUpdate} compact />
      </div>
    </Card>
  );
};

// Card Kanban de Orçamento
const InvoiceKanbanCard: React.FC<InvoiceCardProps> = ({
  invoice,
  onUpdate,
  formatCurrency,
  formatDate,
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <div className="space-y-2">
        <h4 className="font-semibold text-gray-900 text-sm">{invoice.code}</h4>
        <p className="text-xs text-gray-600 truncate">{invoice.client?.name || 'N/A'}</p>
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <span className="text-xs text-gray-500">
            {formatDate(invoice.createdAt.toString())}
          </span>
          <span className="text-sm font-bold text-gray-900">
            {formatCurrency(invoice.totalAmount)}
          </span>
        </div>
      </div>
    </Card>
  );
};
