import React, { useState, useEffect } from 'react';
import { AdminLayout, Table, Modal, FormField, SelectField, Button } from '@components/index';
import api from '@services/api';
import { Invoice, Client, Product, Service } from '@types/index';

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState({
    clientId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.clientId) newErrors.clientId = 'Cliente é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNew = () => {
    setFormData({ clientId: '' });
    setErrors({});
    setModalOpen(true);
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      setSubmitLoading(true);
      // Para simplicidade, criar orçamento vazio
      await api.createInvoice({
        clientId: formData.clientId,
        groups: [],
      });
      setModalOpen(false);
      await loadData();
    } catch (error) {
      console.error('Erro ao criar:', error);
      setErrors({ submit: 'Erro ao criar orçamento' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewModalOpen(true);
  };

  const handleDelete = async (invoice: Invoice) => {
    if (!window.confirm('Tem certeza que deseja deletar este orçamento?')) return;

    try {
      await api.deleteInvoice(invoice.id);
      await loadData();
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  const handleClone = async (invoice: Invoice) => {
    try {
      await api.cloneInvoice(invoice.id);
      await loadData();
    } catch (error) {
      console.error('Erro ao clonar:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SENT: 'bg-blue-100 text-blue-800',
      APPROVED: 'bg-green-100 text-green-800',
      REFUSED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      DRAFT: 'Rascunho',
      SENT: 'Enviado',
      APPROVED: 'Aprovado',
      REFUSED: 'Recusado',
    };
    return labels[status] || status;
  };

  const columns = [
    {
      key: 'clientId',
      label: 'Cliente',
      render: (value: string) => clients.find((c) => c.id === value)?.name || 'N/A',
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {getStatusLabel(value)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Criado em',
      render: (value: string) => new Date(value).toLocaleDateString('pt-BR'),
    },
    {
      key: 'totalAmount',
      label: 'Total',
      render: (value: number) => `R$ ${(value || 0).toFixed(2)}`,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Gerenciar Orçamentos</h3>
            <p className="text-gray-600">Total: {invoices.length} orçamento(s)</p>
          </div>
          <Button icon="+" onClick={handleNew} size="lg">
            Novo Orçamento
          </Button>
        </div>

        <div className="bg-white rounded-lg overflow-hidden shadow">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Nenhum orçamento encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 border-b-2 border-gray-200">
                  <tr>
                    {columns.map((col) => (
                      <th key={col.key} className="px-6 py-3 font-semibold text-gray-800">
                        {col.label}
                      </th>
                    ))}
                    <th className="px-6 py-3 font-semibold text-gray-800">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 transition">
                      {columns.map((col) => (
                        <td key={col.key} className="px-6 py-4">
                          {col.render
                            ? col.render(invoice[col.key as keyof Invoice], invoice)
                            : (invoice[col.key as keyof Invoice] as any)?.toString() || '-'}
                        </td>
                      ))}
                      <td className="px-6 py-4 flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => handleView(invoice)}>
                          Ver
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleClone(invoice)}
                        >
                          Clonar
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(invoice)}
                        >
                          Deletar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Criação */}
      <Modal
        isOpen={modalOpen}
        title="Novo Orçamento"
        onClose={() => setModalOpen(false)}
        actions={[
          { label: 'Cancelar', onClick: () => setModalOpen(false), variant: 'secondary' },
          {
            label: 'Criar',
            onClick: handleCreate,
            variant: 'primary',
            loading: submitLoading,
          },
        ]}
      >
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{errors.submit}</div>
        )}
        <SelectField
          label="Cliente"
          options={clients.map((c) => ({ value: c.id, label: c.name }))}
          value={formData.clientId}
          onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
          error={errors.clientId}
          required
        />
        <div className="p-3 bg-blue-50 rounded text-sm text-blue-700">
          <p>
            <strong>💡 Dica:</strong> Após criar, você poderá adicionar grupos, produtos e
            serviços ao orçamento.
          </p>
        </div>
      </Modal>

      {/* Modal de Visualização */}
      <Modal
        isOpen={viewModalOpen}
        title={`Orçamento - ${selectedInvoice?.id.substring(0, 8)}`}
        onClose={() => setViewModalOpen(false)}
      >
        {selectedInvoice && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Cliente</p>
              <p className="font-medium">
                {clients.find((c) => c.id === selectedInvoice.clientId)?.name || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedInvoice.status)}`}>
                {getStatusLabel(selectedInvoice.status)}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="font-medium text-lg">R$ {(selectedInvoice.totalAmount || 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Grupos</p>
              <p className="font-medium">{selectedInvoice.groups?.length || 0} grupo(s)</p>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Criado em {new Date(selectedInvoice.createdAt).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
};
