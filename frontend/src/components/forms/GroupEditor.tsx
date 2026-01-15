import React, { useState } from 'react';
import { Button, Card, Input, Badge, Modal } from '@components/ui';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import type { Product, Service, ProductVariation, ServiceVariation } from '@types/index';

interface GroupItem {
  id?: string;
  quantity: number;
  productId?: string;
  productVariationId?: string;
  serviceId?: string;
  serviceVariationId?: string;
  unitPrice: number;
  customName?: string;
  customDescription?: string;
  product?: Product;
  service?: Service;
}

interface InvoiceGroup {
  id?: string;
  name: string;
  type: 'PRODUCT' | 'SERVICE';
  items: GroupItem[];
}

interface GroupEditorProps {
  groups: InvoiceGroup[];
  products: Product[];
  services: Service[];
  onChange: (groups: InvoiceGroup[]) => void;
  error?: string;
}

export const GroupEditor: React.FC<GroupEditorProps> = ({
  groups,
  products,
  services,
  onChange,
  error,
}) => {
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroupIndex, setEditingGroupIndex] = useState<number | null>(null);
  const [groupFormData, setGroupFormData] = useState<InvoiceGroup>({
    name: '',
    type: 'PRODUCT',
    items: [],
  });

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [itemFormData, setItemFormData] = useState<GroupItem>({
    quantity: 1,
    unitPrice: 0,
  });

  // ===== Group CRUD =====
  const handleNewGroup = () => {
    setEditingGroupIndex(null);
    setGroupFormData({ name: '', type: 'PRODUCT', items: [] });
    setGroupModalOpen(true);
  };

  const handleEditGroup = (index: number) => {
    setEditingGroupIndex(index);
    setGroupFormData({ ...groups[index] });
    setGroupModalOpen(true);
  };

  const handleSaveGroup = () => {
    if (!groupFormData.name.trim()) return;

    const newGroups = [...groups];
    if (editingGroupIndex !== null) {
      newGroups[editingGroupIndex] = groupFormData;
    } else {
      newGroups.push(groupFormData);
    }
    onChange(newGroups);
    setGroupModalOpen(false);
  };

  const handleDeleteGroup = (index: number) => {
    if (!window.confirm('Deseja realmente excluir este grupo?')) return;
    const newGroups = groups.filter((_, i) => i !== index);
    onChange(newGroups);
  };

  // ===== Item CRUD =====
  const handleNewItem = () => {
    setEditingItemIndex(null);
    setItemFormData({ quantity: 1, unitPrice: 0 });
    setItemModalOpen(true);
  };

  const handleEditItem = (index: number) => {
    setEditingItemIndex(index);
    setItemFormData({ ...groupFormData.items[index] });
    setItemModalOpen(true);
  };

  const handleSaveItem = () => {
    const newItems = [...groupFormData.items];
    if (editingItemIndex !== null) {
      newItems[editingItemIndex] = itemFormData;
    } else {
      newItems.push(itemFormData);
    }
    setGroupFormData({ ...groupFormData, items: newItems });
    setItemModalOpen(false);
  };

  const handleDeleteItem = (index: number) => {
    const newItems = groupFormData.items.filter((_, i) => i !== index);
    setGroupFormData({ ...groupFormData, items: newItems });
  };

  // Helper functions
  const getProductName = (productId?: string, variationId?: string) => {
    if (!productId) return '-';
    const product = products.find((p) => p.id === productId);
    if (!product) return '-';
    if (variationId) {
      const variation = product.variations?.find((v) => v.id === variationId);
      return variation ? `${product.name} - ${variation.name}` : product.name;
    }
    return product.name;
  };

  const getServiceName = (serviceId?: string, variationId?: string) => {
    if (!serviceId) return '-';
    const service = services.find((s) => s.id === serviceId);
    if (!service) return '-';
    if (variationId) {
      const variation = service.variations?.find((v) => v.id === variationId);
      return variation ? `${service.name} - ${variation.name}` : service.name;
    }
    return service.name;
  };

  const calculateTotal = (item: GroupItem) => item.quantity * item.unitPrice;

  const calculateGroupTotal = (group: InvoiceGroup) =>
    group.items.reduce((sum, item) => sum + calculateTotal(item), 0);

  const calculateGrandTotal = () =>
    groups.reduce((sum, group) => sum + calculateGroupTotal(group), 0);

  return (
    <div className="space-y-4">
      {/* Groups List */}
      <div className="space-y-3">
        {groups.length === 0 ? (
          <Card className="p-6 text-center text-secondary-600">
            <p>Nenhum grupo adicionado. Clique em "Novo Grupo" para começar.</p>
          </Card>
        ) : (
          groups.map((group, groupIndex) => (
            <Card key={groupIndex} className="p-4">
              {/* Group Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-secondary-200">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-secondary-900">{group.name}</h4>
                    <Badge variant="secondary">
                      {group.type === 'PRODUCT' ? 'Produtos' : 'Serviços'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-secondary-600">
                    {group.items.length} item(ns) - Total: R${' '}
                    {calculateGroupTotal(group).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditGroup(groupIndex)}
                    icon={Edit2}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteGroup(groupIndex)}
                    icon={Trash2}
                    className="text-danger-600"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto mb-3">
                <table className="w-full text-sm">
                  <thead className="text-secondary-600 border-b border-secondary-200">
                    <tr>
                      <th className="text-left p-2">Descrição</th>
                      <th className="text-center p-2">Qtd</th>
                      <th className="text-right p-2">Valor Unit.</th>
                      <th className="text-right p-2">Total</th>
                      <th className="text-center p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((item, itemIndex) => (
                      <tr key={itemIndex} className="border-b border-secondary-100 hover:bg-secondary-50">
                        <td className="p-2">
                          {item.customName ||
                            (group.type === 'PRODUCT'
                              ? getProductName(item.productId, item.productVariationId)
                              : getServiceName(item.serviceId, item.serviceVariationId))}
                        </td>
                        <td className="text-center p-2">{item.quantity}</td>
                        <td className="text-right p-2">
                          R$ {item.unitPrice.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="text-right p-2 font-medium">
                          R$ {calculateTotal(item).toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="text-center p-2 flex justify-center gap-1">
                          <button
                            onClick={() => handleEditItem(itemIndex)}
                            className="p-1 hover:bg-primary-100 rounded text-primary-600"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(itemIndex)}
                            className="p-1 hover:bg-danger-100 rounded text-danger-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Item Button */}
              <div
                className="inline-block"
                onClick={() => {
                  setGroupFormData(group);
                  handleNewItem();
                }}
              >
                <Button variant="secondary" size="sm" icon={Plus}>
                  Adicionar Item
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Grand Total */}
      {groups.length > 0 && (
        <Card className="p-4 bg-primary-50 border-primary-200">
          <div className="flex justify-end">
            <div>
              <p className="text-secondary-600 text-sm">Total Geral</p>
              <p className="text-2xl font-bold text-primary-900">
                R$ {calculateGrandTotal().toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Add Group Button */}
      <div>
        <Button onClick={handleNewGroup} icon={Plus}>
          Novo Grupo
        </Button>
      </div>

      {error && <p className="text-xs text-danger-600">{error}</p>}

      {/* Group Modal */}
      <Modal
        isOpen={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        title={editingGroupIndex !== null ? 'Editar Grupo' : 'Novo Grupo'}
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setGroupModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveGroup}>Salvar</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nome do Grupo"
            value={groupFormData.name}
            onChange={(e) =>
              setGroupFormData({ ...groupFormData, name: e.target.value })
            }
            placeholder="Ex: Eletrônicos, Instalação, etc"
            required
          />

          <div>
            <label className="block text-sm font-medium text-secondary-900 mb-2">
              Tipo de Item
            </label>
            <select
              value={groupFormData.type}
              onChange={(e) =>
                setGroupFormData({
                  ...groupFormData,
                  type: e.target.value as 'PRODUCT' | 'SERVICE',
                })
              }
              className="input-base w-full"
            >
              <option value="PRODUCT">Produtos</option>
              <option value="SERVICE">Serviços</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Item Modal */}
      <Modal
        isOpen={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        title={editingItemIndex !== null ? 'Editar Item' : 'Novo Item'}
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setItemModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveItem}>Salvar</Button>
          </div>
        }
      >
        <div className="space-y-4">
          {groupFormData.type === 'PRODUCT' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  Produto
                </label>
                <select
                  value={itemFormData.productId || ''}
                  onChange={(e) => {
                    const product = products.find((p) => p.id === e.target.value);
                    setItemFormData({
                      ...itemFormData,
                      productId: e.target.value,
                      unitPrice: product?.variations?.[0]?.price || 0,
                    });
                  }}
                  className="input-base w-full"
                  required
                >
                  <option value="">Selecione um produto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              {itemFormData.productId && (
                <div>
                  <label className="block text-sm font-medium text-secondary-900 mb-2">
                    Variação
                  </label>
                  <select
                    value={itemFormData.productVariationId || ''}
                    onChange={(e) => {
                      const product = products.find((p) => p.id === itemFormData.productId);
                      const variation = product?.variations?.find(
                        (v) => v.id === e.target.value
                      );
                      setItemFormData({
                        ...itemFormData,
                        productVariationId: e.target.value,
                        unitPrice: variation?.price || itemFormData.unitPrice,
                      });
                    }}
                    className="input-base w-full"
                  >
                    <option value="">Selecione uma variação</option>
                    {products
                      .find((p) => p.id === itemFormData.productId)
                      ?.variations?.map((variation) => (
                        <option key={variation.id} value={variation.id}>
                          {variation.name} - R${' '}
                          {variation.price.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  Serviço
                </label>
                <select
                  value={itemFormData.serviceId || ''}
                  onChange={(e) => {
                    const service = services.find((s) => s.id === e.target.value);
                    setItemFormData({
                      ...itemFormData,
                      serviceId: e.target.value,
                      unitPrice: service?.variations?.[0]?.price || 0,
                    });
                  }}
                  className="input-base w-full"
                  required
                >
                  <option value="">Selecione um serviço</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              {itemFormData.serviceId && (
                <div>
                  <label className="block text-sm font-medium text-secondary-900 mb-2">
                    Variação
                  </label>
                  <select
                    value={itemFormData.serviceVariationId || ''}
                    onChange={(e) => {
                      const service = services.find((s) => s.id === itemFormData.serviceId);
                      const variation = service?.variations?.find(
                        (v) => v.id === e.target.value
                      );
                      setItemFormData({
                        ...itemFormData,
                        serviceVariationId: e.target.value,
                        unitPrice: variation?.price || itemFormData.unitPrice,
                      });
                    }}
                    className="input-base w-full"
                  >
                    <option value="">Selecione uma variação</option>
                    {services
                      .find((s) => s.id === itemFormData.serviceId)
                      ?.variations?.map((variation) => (
                        <option key={variation.id} value={variation.id}>
                          {variation.name} - R${' '}
                          {variation.price.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </>
          )}

          <Input
            label="Quantidade"
            type="number"
            value={itemFormData.quantity}
            onChange={(e) =>
              setItemFormData({
                ...itemFormData,
                quantity: parseFloat(e.target.value) || 1,
              })
            }
            min="1"
            required
          />

          <Input
            label="Valor Unitário"
            type="number"
            step="0.01"
            value={itemFormData.unitPrice}
            onChange={(e) =>
              setItemFormData({
                ...itemFormData,
                unitPrice: parseFloat(e.target.value) || 0,
              })
            }
            required
          />

          <Input
            label="Nome Customizado (opcional)"
            value={itemFormData.customName || ''}
            onChange={(e) =>
              setItemFormData({
                ...itemFormData,
                customName: e.target.value,
              })
            }
            placeholder="Ex: Produto especial"
          />
        </div>
      </Modal>
    </div>
  );
};
