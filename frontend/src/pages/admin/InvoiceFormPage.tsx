import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout, Button, FormField, SelectField, Card, PageHeader, Modal } from '@components/index';
import api from '@services/api';
import type { Invoice, Client, Product, Service } from '../../types/index';
import type { ProductVariation } from '../../types/index';

interface FormState {
  // Aba Cliente
  clientId: string;
  
  // Aba Cabeçalho
  proposalValidDate?: string;
  origin?: string;
  observations?: string;
  responsible?: string;
  internalReference?: string;
  
  // Aba Produtos/Serviços
  groups: Array<{
    name: string;
    type: 'PRODUCT' | 'SERVICE';
    items: Array<{
      quantity: number;
      productId?: string;
      productVariationId?: string;
      serviceId?: string;
      serviceVariationId?: string;
      unitPrice: number;
    }>;
  }>;
  
  // Aba Faturamento
  discounts: number;
  additions: number;
  displacement: number;
}

export const InvoiceFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  
  // Função para converter data para formato de input (YYYY-MM-DD) sem problemas de timezone
  const formatDateForInput = (dateString: string): string => {
    // Se já está no formato YYYY-MM-DD, retorna direto
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    // Se está no formato ISO com hora (ex: 2026-01-21T00:00:00.000Z), extrai apenas a data
    // Isso evita conversões de timezone que causam perda de um dia
    return dateString.split('T')[0];
  };
  
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [activeTab, setActiveTab] = useState<'client' | 'header' | 'items' | 'billing'>('client');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<FormState>({
    clientId: '',
    groups: [],
    discounts: 0,
    additions: 0,
    displacement: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [clientsRes, productsRes, servicesRes] = await Promise.all([
        api.getClients(),
        api.getProducts(),
        api.getServices(),
      ]);
      
      setClients(clientsRes.data || []);
      setProducts(productsRes.data || []);
      setServices(servicesRes.data || []);
      
      if (id) {
        // Carregando orçamento existente
        const invoiceRes = await api.getInvoice(id);
        const inv = invoiceRes.data;
        setInvoice(inv);
        
        // Preencher formulário com dados do orçamento
        setFormData({
          clientId: inv.clientId,
          proposalValidDate: inv.proposalValidDate ? formatDateForInput(inv.proposalValidDate) : undefined,
          origin: inv.origin || undefined,
          observations: inv.observations || undefined,
          responsible: inv.responsible || undefined,
          internalReference: inv.internalReference || undefined,
          groups: inv.groups || [],
          discounts: inv.discounts || 0,
          additions: inv.additions || 0,
          displacement: inv.displacement || 0,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErrors({ load: 'Erro ao carregar dados' });
    } finally {
      setLoading(false);
    }
  };

  const validateTabCliente = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.clientId) newErrors.clientId = 'Cliente é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTabClick = (tab: typeof activeTab) => {
    if (tab === 'header' && !validateTabCliente()) return;
    setActiveTab(tab);
  };

  const handleSave = async () => {
    if (!validateTabCliente()) {
      setActiveTab('client');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        clientId: formData.clientId,
        proposalValidDate: formData.proposalValidDate,
        origin: formData.origin,
        observations: formData.observations,
        responsible: formData.responsible,
        internalReference: formData.internalReference,
        groups: formData.groups,
        discounts: formData.discounts,
        additions: formData.additions,
        displacement: formData.displacement,
      };

      if (id) {
        await api.updateInvoice(id, payload);
      } else {
        await api.createInvoice(payload);
      }

      navigate('/admin/invoices');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setErrors({ submit: 'Erro ao salvar orçamento' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddGroup = () => {
    setFormData({
      ...formData,
      groups: [
        ...formData.groups,
        {
          name: '',
          type: 'PRODUCT',
          items: [],
        },
      ],
    });
  };

  const handleRemoveGroup = (index: number) => {
    setFormData({
      ...formData,
      groups: formData.groups.filter((_, i) => i !== index),
    });
  };

  const handleGroupChange = (index: number, field: string, value: any) => {
    const newGroups = [...formData.groups];
    (newGroups[index] as any)[field] = value;
    setFormData({ ...formData, groups: newGroups });
  };

  const handleAddItemToGroup = (groupIndex: number) => {
    const newGroups = [...formData.groups];
    newGroups[groupIndex].items.push({
      quantity: 1,
      unitPrice: 0,
    });
    setFormData({ ...formData, groups: newGroups });
  };

  const handleRemoveItemFromGroup = (groupIndex: number, itemIndex: number) => {
    const newGroups = [...formData.groups];
    newGroups[groupIndex].items = newGroups[groupIndex].items.filter((_, i) => i !== itemIndex);
    setFormData({ ...formData, groups: newGroups });
  };

  const handleItemChange = (groupIndex: number, itemIndex: number, field: string, value: any) => {
    const newGroups = [...formData.groups];
    (newGroups[groupIndex].items[itemIndex] as any)[field] = value;
    setFormData({ ...formData, groups: newGroups });
  };

  const calculateTotal = () => {
    let subtotal = 0;
    formData.groups.forEach(group => {
      group.items.forEach(item => {
        subtotal += item.quantity * item.unitPrice;
      });
    });
    return subtotal - (formData.discounts || 0) + (formData.additions || 0) + (formData.displacement || 0);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Carregando...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          emoji={id ? '✏️' : '📋'}
          title={id ? `Editar Orçamento - ${invoice?.code}` : 'Novo Orçamento'}
          description={id ? `Editando orçamento do cliente ${invoice?.client?.name}` : 'Preencha as informações do novo orçamento'}
        />

        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
            <span>⚠️</span>
            <span>{errors.submit}</span>
          </div>
        )}

        {errors.load && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
            <span>⚠️</span>
            <span>{errors.load}</span>
          </div>
        )}

        <Card>
          {/* Tabs Navigation */}
          <div className="border-b border-gray-200 flex">
            <button
              onClick={() => handleTabClick('client')}
              className={`flex-1 py-4 px-6 font-medium transition border-b-2 ${
                activeTab === 'client'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              👤 Cliente
            </button>
            <button
              onClick={() => handleTabClick('header')}
              className={`flex-1 py-4 px-6 font-medium transition border-b-2 ${
                activeTab === 'header'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              📝 Cabeçalho
            </button>
            <button
              onClick={() => handleTabClick('items')}
              className={`flex-1 py-4 px-6 font-medium transition border-b-2 ${
                activeTab === 'items'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              📦 Produtos/Serviços
            </button>
            <button
              onClick={() => handleTabClick('billing')}
              className={`flex-1 py-4 px-6 font-medium transition border-b-2 ${
                activeTab === 'billing'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              💰 Faturamento
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 space-y-6">
            {/* Aba Cliente */}
            {activeTab === 'client' && (
              <div className="space-y-4">
                <SelectField
                  label="Cliente"
                  options={clients.map(c => ({ value: c.id, label: c.name }))}
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  error={errors.clientId}
                  required
                />
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                  <p className="flex items-start gap-2">
                    <span>💡</span>
                    <span>Selecione o cliente para o qual está criando este orçamento.</span>
                  </p>
                </div>
              </div>
            )}

            {/* Aba Cabeçalho */}
            {activeTab === 'header' && (
              <div className="space-y-4">
                <FormField
                  label="Data de Validade do Orçamento"
                  type="date"
                  value={formData.proposalValidDate || ''}
                  onChange={(e) => setFormData({ ...formData, proposalValidDate: e.target.value })}
                />
                <FormField
                  label="Origem"
                  placeholder="Ex: Indicação, Site, WhatsApp, etc."
                  value={formData.origin || ''}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                />
                <FormField
                  label="Observações"
                  placeholder="Adicione observações sobre este orçamento"
                  type="textarea"
                  value={formData.observations || ''}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                />
                <FormField
                  label="Responsável"
                  placeholder="Nome do vendedor/responsável"
                  value={formData.responsible || ''}
                  onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                />
                <FormField
                  label="Referência Interna"
                  placeholder="Código interno ou referência"
                  value={formData.internalReference || ''}
                  onChange={(e) => setFormData({ ...formData, internalReference: e.target.value })}
                />
              </div>
            )}

            {/* Aba Produtos/Serviços */}
            {activeTab === 'items' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">Grupos de Itens</h3>
                  <Button size="sm" onClick={handleAddGroup}>
                    + Novo Grupo
                  </Button>
                </div>

                {formData.groups.length === 0 ? (
                  <div className="py-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 mb-3">Nenhum grupo adicionado</p>
                    <Button size="sm" onClick={handleAddGroup}>
                      Adicionar Primeiro Grupo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.groups.map((group, groupIndex) => (
                      <Card key={groupIndex} hover>
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
                          <div className="flex gap-3 items-center mb-4">
                            <input
                              type="text"
                              placeholder="Nome do Grupo (ex: Opção 1)"
                              value={group.name}
                              onChange={(e) => handleGroupChange(groupIndex, 'name', e.target.value)}
                              className="flex-1 px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                            />
                            <select
                              value={group.type}
                              onChange={(e) => handleGroupChange(groupIndex, 'type', e.target.value)}
                              className="px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="PRODUCT">Produto</option>
                              <option value="SERVICE">Serviço</option>
                            </select>
                            <button
                              onClick={() => handleRemoveGroup(groupIndex)}
                              className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition"
                            >
                              🗑️
                            </button>
                          </div>

                          <div className="space-y-2">
                            {group.items.length === 0 ? (
                              <div className="text-center py-4 bg-white rounded border-2 border-dashed border-gray-300">
                                <p className="text-gray-500 text-sm mb-2">Nenhum item neste grupo</p>
                                <button
                                  onClick={() => handleAddItemToGroup(groupIndex)}
                                  className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs font-medium transition"
                                >
                                  + Adicionar Item
                                </button>
                              </div>
                            ) : (
                              <>
                                {group.items.map((item, itemIndex) => (
                                  <div key={itemIndex} className="flex gap-2 items-end bg-white p-3 rounded border border-gray-200">
                                    <div className="flex-1 space-y-2">
                                      {group.type === 'PRODUCT' ? (
                                        <>
                                          <select
                                            value={item.productId || ''}
                                            onChange={(e) => handleItemChange(groupIndex, itemIndex, 'productId', e.target.value)}
                                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          >
                                            <option value="">Selecione um produto</option>
                                            {products.map(p => (
                                              <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                          </select>
                                          {item.productId && products.find(p => p.id === item.productId)?.variations?.length && (
                                            <select
                                              value={item.productVariationId || ''}
                                              onChange={(e) => {
                                                const variation = products.find(p => p.id === item.productId)?.variations?.find((v: any) => v.id === e.target.value);
                                                handleItemChange(groupIndex, itemIndex, 'productVariationId', e.target.value);
                                                if (variation) {
                                                  handleItemChange(groupIndex, itemIndex, 'unitPrice', variation.price);
                                                }
                                              }}
                                              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                              <option value="">Selecione uma variação</option>
                                              {products.find(p => p.id === item.productId)?.variations?.map((v: any) => (
                                                <option key={v.id} value={v.id}>{v.name} - R$ {v.price.toFixed(2)}</option>
                                              ))}
                                            </select>
                                          )}
                                        </>
                                      ) : (
                                        <>
                                          <select
                                            value={item.serviceId || ''}
                                            onChange={(e) => handleItemChange(groupIndex, itemIndex, 'serviceId', e.target.value)}
                                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          >
                                            <option value="">Selecione um serviço</option>
                                            {services.map(s => (
                                              <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                          </select>
                                          {item.serviceId && services.find(s => s.id === item.serviceId)?.variations?.length && (
                                            <select
                                              value={item.serviceVariationId || ''}
                                              onChange={(e) => {
                                                const variation = services.find(s => s.id === item.serviceId)?.variations?.find((v: any) => v.id === e.target.value);
                                                handleItemChange(groupIndex, itemIndex, 'serviceVariationId', e.target.value);
                                                if (variation) {
                                                  handleItemChange(groupIndex, itemIndex, 'unitPrice', variation.price);
                                                }
                                              }}
                                              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                              <option value="">Selecione uma variação</option>
                                              {services.find(s => s.id === item.serviceId)?.variations?.map((v: any) => (
                                                <option key={v.id} value={v.id}>{v.name} - R$ {v.price.toFixed(2)}</option>
                                              ))}
                                            </select>
                                          )}
                                        </>
                                      )}
                                      <div className="flex gap-2">
                                        <input
                                          type="number"
                                          min="1"
                                          value={item.quantity}
                                          onChange={(e) => handleItemChange(groupIndex, itemIndex, 'quantity', parseInt(e.target.value) || 1)}
                                          placeholder="Qtd"
                                          className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                          type="number"
                                          step="0.01"
                                          value={item.unitPrice}
                                          onChange={(e) => handleItemChange(groupIndex, itemIndex, 'unitPrice', parseFloat(e.target.value) || 0)}
                                          placeholder="Preço"
                                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <div className="px-2 py-1.5 bg-gray-100 rounded text-sm font-semibold text-gray-700">
                                          R$ {(item.quantity * item.unitPrice).toFixed(2)}
                                        </div>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleRemoveItemFromGroup(groupIndex, itemIndex)}
                                      className="px-2 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs transition"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                                <button
                                  onClick={() => handleAddItemToGroup(groupIndex)}
                                  className="w-full px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded text-sm font-medium transition"
                                >
                                  + Adicionar Item
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Aba Faturamento */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Descontos"
                    type="number"
                    step="0.01"
                    value={formData.discounts.toString()}
                    onChange={(e) => setFormData({ ...formData, discounts: parseFloat(e.target.value) || 0 })}
                  />
                  <FormField
                    label="Acréscimos"
                    type="number"
                    step="0.01"
                    value={formData.additions.toString()}
                    onChange={(e) => setFormData({ ...formData, additions: parseFloat(e.target.value) || 0 })}
                  />
                  <FormField
                    label="Deslocamento"
                    type="number"
                    step="0.01"
                    value={formData.displacement.toString()}
                    onChange={(e) => setFormData({ ...formData, displacement: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                {/* Resumo Financeiro */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6 space-y-3">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span>💰</span> Resumo Financeiro
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Subtotal dos Itens:</span>
                      <span className="font-semibold">R$ {formData.groups.reduce((sum, group) => sum + group.items.reduce((itemSum, item) => itemSum + (item.quantity * item.unitPrice), 0), 0).toFixed(2)}</span>
                    </div>
                    {formData.discounts > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Descontos:</span>
                        <span>- R$ {formData.discounts.toFixed(2)}</span>
                      </div>
                    )}
                    {formData.additions > 0 && (
                      <div className="flex justify-between text-orange-600">
                        <span>Acréscimos:</span>
                        <span>+ R$ {formData.additions.toFixed(2)}</span>
                      </div>
                    )}
                    {formData.displacement > 0 && (
                      <div className="flex justify-between text-orange-600">
                        <span>Deslocamento:</span>
                        <span>+ R$ {formData.displacement.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-green-200 flex justify-between text-lg font-bold text-green-700">
                      <span>Valor Final:</span>
                      <span>R$ {calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Botões de Ação */}
        <div className="flex justify-between gap-3">
          <Button variant="secondary" onClick={() => navigate('/admin/invoices')}>
            ← Cancelar
          </Button>
          <Button
            onClick={handleSave}
            loading={saving}
            className="flex-1"
          >
            {id ? '✅ Atualizar Orçamento' : '✅ Criar Orçamento'}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};
