import React, { useState, useEffect } from 'react';
import { AdminLayout, Table, Modal, FormField, SelectField, Button, PageHeader, Card, CardBody, Badge, EmptyState } from '@components/index';
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState({
    clientId: '',
  });
  const [editGroups, setEditGroups] = useState<any[]>([]);
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

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setEditGroups(invoice.groups || []);
    setEditModalOpen(true);
  };

  const handleAddGroup = () => {
    setEditGroups([
      ...editGroups,
      {
        name: '',
        productItems: [],
        serviceItems: [],
      },
    ]);
  };

  const handleRemoveGroup = (index: number) => {
    setEditGroups(editGroups.filter((_, i) => i !== index));
  };

  const handleGroupNameChange = (index: number, name: string) => {
    const newGroups = [...editGroups];
    newGroups[index].name = name;
    setEditGroups(newGroups);
  };

  const handleAddProductToGroup = (groupIndex: number) => {
    const newGroups = [...editGroups];
    if (!newGroups[groupIndex].productItems) {
      newGroups[groupIndex].productItems = [];
    }
    newGroups[groupIndex].productItems.push({
      productId: '',
      variationId: '',
      quantity: 1,
    });
    setEditGroups(newGroups);
  };

  const handleRemoveProductFromGroup = (groupIndex: number, itemIndex: number) => {
    const newGroups = [...editGroups];
    newGroups[groupIndex].productItems = newGroups[groupIndex].productItems.filter(
      (_: any, i: number) => i !== itemIndex
    );
    setEditGroups(newGroups);
  };

  const handleProductChange = (groupIndex: number, itemIndex: number, field: string, value: any) => {
    const newGroups = [...editGroups];
    newGroups[groupIndex].productItems[itemIndex][field] = value;
    setEditGroups(newGroups);
  };

  const handleAddServiceToGroup = (groupIndex: number) => {
    const newGroups = [...editGroups];
    if (!newGroups[groupIndex].serviceItems) {
      newGroups[groupIndex].serviceItems = [];
    }
    newGroups[groupIndex].serviceItems.push({
      serviceId: '',
      variationId: '',
      quantity: 1,
    });
    setEditGroups(newGroups);
  };

  const handleRemoveServiceFromGroup = (groupIndex: number, itemIndex: number) => {
    const newGroups = [...editGroups];
    newGroups[groupIndex].serviceItems = newGroups[groupIndex].serviceItems.filter(
      (_: any, i: number) => i !== itemIndex
    );
    setEditGroups(newGroups);
  };

  const handleServiceChange = (groupIndex: number, itemIndex: number, field: string, value: any) => {
    const newGroups = [...editGroups];
    newGroups[groupIndex].serviceItems[itemIndex][field] = value;
    setEditGroups(newGroups);
  };

  const handleSaveEdit = async () => {
    if (!selectedInvoice) return;

    try {
      setSubmitLoading(true);
      await api.updateInvoice(selectedInvoice.id, {
        groups: editGroups,
      });
      setEditModalOpen(false);
      await loadData();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setErrors({ submit: 'Erro ao salvar orçamento' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'success' | 'warning' | 'danger' => {
    const colors: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger'> = {
      DRAFT: 'default',
      SENT: 'primary',
      APPROVED: 'success',
      REFUSED: 'danger',
    };
    return colors[status] || 'default';
  };

  const getStatusEmoji = (status: string) => {
    const emojis: Record<string, string> = {
      DRAFT: '🟡',
      SENT: '🔵',
      APPROVED: '🟢',
      REFUSED: '🔴',
    };
    return emojis[status] || '⚪';
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
        <Badge variant={getStatusColor(value)}>
          <span>{getStatusEmoji(value)}</span>
          <span>{getStatusLabel(value)}</span>
        </Badge>
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
        <PageHeader
          emoji="📋"
          title="Gerenciar Orçamentos"
          description={`${invoices.length} orçamento(s) cadastrado(s)`}
          actions={
            <Button icon="+" onClick={handleNew} size="lg">
              Novo Orçamento
            </Button>
          }
        />

        <Card>
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Carregando orçamentos...</p>
              </div>
            </div>
          ) : invoices.length === 0 ? (
            <EmptyState
              emoji="📋"
              title="Nenhum orçamento encontrado"
              description="Comece criando seu primeiro orçamento para seus clientes"
              action={
                <Button icon="+" onClick={handleNew}>
                  Criar Primeiro Orçamento
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    {columns.map((col) => (
                      <th key={col.key} className="px-6 py-4 font-semibold text-gray-800 text-sm uppercase tracking-wide">
                        {col.label}
                      </th>
                    ))}
                    <th className="px-6 py-4 font-semibold text-gray-800 text-sm uppercase tracking-wide">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 transition">
                      {columns.map((col) => (
                        <td key={col.key} className="px-6 py-4">
                          {col.render
                            ? col.render(invoice[col.key as keyof Invoice], invoice)
                            : (invoice[col.key as keyof Invoice] as any)?.toString() || '-'}
                        </td>
                      ))}
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(invoice)}
                            className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-md text-xs font-medium transition"
                            disabled={invoice.status === 'APPROVED'}
                            title={invoice.status === 'APPROVED' ? 'Orçamento aprovado não pode ser editado' : 'Editar orçamento'}
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleView(invoice)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-xs font-medium transition"
                          >
                            👁️ Ver
                          </button>
                          <button
                            onClick={() => handleClone(invoice)}
                            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md text-xs font-medium transition"
                          >
                            📋 Clonar
                          </button>
                          <button
                            onClick={() => handleDelete(invoice)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-md text-xs font-medium transition"
                          >
                            🗑️ Deletar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Modal de Criação */}
      <Modal
        isOpen={modalOpen}
        title="📋 Novo Orçamento"
        onClose={() => setModalOpen(false)}
        actions={[
          { label: 'Cancelar', onClick: () => setModalOpen(false), variant: 'secondary' },
          {
            label: 'Criar Orçamento',
            onClick: handleCreate,
            variant: 'primary',
            loading: submitLoading,
          },
        ]}
      >
        {errors.submit && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
            <span>⚠️</span>
            <span>{errors.submit}</span>
          </div>
        )}
        <SelectField
          label="Cliente"
          options={clients.map((c) => ({ value: c.id, label: c.name }))}
          value={formData.clientId}
          onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
          error={errors.clientId}
          required
        />
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          <p className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <span>
              <strong>Dica:</strong> Após criar, você poderá adicionar grupos, produtos e
              serviços ao orçamento.
            </span>
          </p>
        </div>
      </Modal>

      {/* Modal de Visualização */}
      <Modal
        isOpen={viewModalOpen}
        title={`📋 Orçamento - ${selectedInvoice?.id.substring(0, 8)}`}
        onClose={() => setViewModalOpen(false)}
      >
        {selectedInvoice && (
          <div className="space-y-4">
            <div className="pb-4 border-b border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Cliente</p>
              <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span>👤</span>
                {clients.find((c) => c.id === selectedInvoice.clientId)?.name || 'N/A'}
              </p>
            </div>
            
            <div className="pb-4 border-b border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Status</p>
              <Badge variant={getStatusColor(selectedInvoice.status)}>
                <span>{getStatusEmoji(selectedInvoice.status)}</span>
                <span>{getStatusLabel(selectedInvoice.status)}</span>
              </Badge>
            </div>
            
            <div className="pb-4 border-b border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Valor Total</p>
              <p className="text-2xl font-bold text-green-600 flex items-center gap-2">
                <span>💰</span>
                R$ {(selectedInvoice.totalAmount || 0).toFixed(2)}
              </p>
            </div>
            
            <div className="pb-4 border-b border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Grupos</p>
              <p className="font-medium text-gray-900 flex items-center gap-2">
                <span>📦</span>
                {selectedInvoice.groups?.length || 0} grupo(s)
              </p>
            </div>
            
            <div className="pt-2">
              <p className="text-xs text-gray-500 flex items-center gap-2">
                <span>📅</span>
                <span>Criado em {new Date(selectedInvoice.createdAt).toLocaleString('pt-BR')}</span>
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={editModalOpen}
        title={`✏️ Editar Orçamento - ${selectedInvoice?.id.substring(0, 8)}`}
        onClose={() => setEditModalOpen(false)}
        actions={[
          { label: 'Cancelar', onClick: () => setEditModalOpen(false), variant: 'secondary' },
          {
            label: 'Salvar Alterações',
            onClick: handleSaveEdit,
            variant: 'primary',
            loading: submitLoading,
          },
        ]}
      >
        {selectedInvoice && (
          <div className="space-y-6">
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
                <span>⚠️</span>
                <span>{errors.submit}</span>
              </div>
            )}

            <div className="pb-4 border-b border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Cliente</p>
              <p className="font-bold text-gray-900">
                {clients.find((c) => c.id === selectedInvoice.clientId)?.name || 'N/A'}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span>📦</span>
                Grupos do Orçamento
              </h4>
              <Button size="sm" onClick={handleAddGroup}>
                + Novo Grupo
              </Button>
            </div>

            {editGroups.length === 0 ? (
              <div className="py-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 mb-3">Nenhum grupo adicionado</p>
                <Button size="sm" onClick={handleAddGroup}>
                  Adicionar Primeiro Grupo
                </Button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300">
                {editGroups.map((group, groupIndex) => (
                  <Card key={groupIndex} hover>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
                      <div className="flex gap-3 items-start">
                        <input
                          type="text"
                          placeholder="Nome do Grupo (ex: Opção 1)"
                          value={group.name}
                          onChange={(e) => handleGroupNameChange(groupIndex, e.target.value)}
                          className="flex-1 px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                        />
                        <button
                          onClick={() => handleRemoveGroup(groupIndex)}
                          className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition"
                          title="Remover grupo"
                        >
                          🗑️
                        </button>
                      </div>

                      {/* Produtos */}
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="font-semibold text-gray-700 flex items-center gap-2">
                            <span>📦</span>
                            Produtos
                          </h5>
                          <button
                            onClick={() => handleAddProductToGroup(groupIndex)}
                            className="px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs font-medium transition"
                          >
                            + Produto
                          </button>
                        </div>

                        {group.productItems?.length > 0 ? (
                          <div className="space-y-2">
                            {group.productItems.map((item: any, itemIndex: number) => {
                              const selectedProduct = products.find(p => p.id === item.productId);
                              return (
                                <div key={itemIndex} className="flex gap-2 items-start bg-white p-3 rounded-lg border border-gray-200">
                                  <div className="flex-1 space-y-2">
                                    <select
                                      value={item.productId}
                                      onChange={(e) => handleProductChange(groupIndex, itemIndex, 'productId', e.target.value)}
                                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                      <option value="">Selecione um produto</option>
                                      {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                          {p.name}
                                        </option>
                                      ))}
                                    </select>

                                    {selectedProduct && selectedProduct.variations && selectedProduct.variations.length > 0 && (
                                      <select
                                        value={item.variationId}
                                        onChange={(e) => handleProductChange(groupIndex, itemIndex, 'variationId', e.target.value)}
                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      >
                                        <option value="">Selecione uma variação</option>
                                        {selectedProduct.variations.map((v: any) => (
                                          <option key={v.id} value={v.id}>
                                            {v.name} - R$ {v.price.toFixed(2)}
                                          </option>
                                        ))}
                                      </select>
                                    )}

                                    <input
                                      type="number"
                                      min="1"
                                      value={item.quantity}
                                      onChange={(e) => handleProductChange(groupIndex, itemIndex, 'quantity', parseInt(e.target.value) || 1)}
                                      placeholder="Qtd"
                                      className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                  <button
                                    onClick={() => handleRemoveProductFromGroup(groupIndex, itemIndex)}
                                    className="px-2 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs transition"
                                  >
                                    ✕
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 italic">Nenhum produto adicionado</p>
                        )}
                      </div>

                      {/* Serviços */}
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="font-semibold text-gray-700 flex items-center gap-2">
                            <span>🛠️</span>
                            Serviços
                          </h5>
                          <button
                            onClick={() => handleAddServiceToGroup(groupIndex)}
                            className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs font-medium transition"
                          >
                            + Serviço
                          </button>
                        </div>

                        {group.serviceItems?.length > 0 ? (
                          <div className="space-y-2">
                            {group.serviceItems.map((item: any, itemIndex: number) => {
                              const selectedService = services.find(s => s.id === item.serviceId);
                              return (
                                <div key={itemIndex} className="flex gap-2 items-start bg-white p-3 rounded-lg border border-gray-200">
                                  <div className="flex-1 space-y-2">
                                    <select
                                      value={item.serviceId}
                                      onChange={(e) => handleServiceChange(groupIndex, itemIndex, 'serviceId', e.target.value)}
                                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                      <option value="">Selecione um serviço</option>
                                      {services.map((s) => (
                                        <option key={s.id} value={s.id}>
                                          {s.name}
                                        </option>
                                      ))}
                                    </select>

                                    {selectedService && selectedService.variations && selectedService.variations.length > 0 && (
                                      <select
                                        value={item.variationId}
                                        onChange={(e) => handleServiceChange(groupIndex, itemIndex, 'variationId', e.target.value)}
                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      >
                                        <option value="">Selecione uma variação</option>
                                        {selectedService.variations.map((v: any) => (
                                          <option key={v.id} value={v.id}>
                                            {v.name} - R$ {v.price.toFixed(2)}
                                          </option>
                                        ))}
                                      </select>
                                    )}

                                    <input
                                      type="number"
                                      min="1"
                                      value={item.quantity}
                                      onChange={(e) => handleServiceChange(groupIndex, itemIndex, 'quantity', parseInt(e.target.value) || 1)}
                                      placeholder="Qtd"
                                      className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                  <button
                                    onClick={() => handleRemoveServiceFromGroup(groupIndex, itemIndex)}
                                    className="px-2 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs transition"
                                  >
                                    ✕
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 italic">Nenhum serviço adicionado</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                <p className="flex items-start gap-2">
                  <span className="text-lg">💡</span>
                  <span>
                    <strong>Dica:</strong> Organize os itens em grupos para criar diferentes opções de orçamento. O cliente poderá escolher entre as opções apresentadas.
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
};
