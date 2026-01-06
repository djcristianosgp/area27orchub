import React, { useState, useEffect } from 'react';
import { AdminLayout, Modal, FormField, TextAreaField, Button, PageHeader, Card, EmptyState } from '@components/index';
import api from '@services/api';
import { Service, ServiceVariation } from '@types/index';

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [variationModalOpen, setVariationModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [editingVariation, setEditingVariation] = useState<ServiceVariation | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [variationData, setVariationData] = useState({
    name: '',
    price: '',
    observation: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await api.getServices();
      setServices(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateServiceForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateVariationForm = () => {
    const newErrors: Record<string, string> = {};
    if (!variationData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!variationData.price || parseFloat(variationData.price) <= 0)
      newErrors.price = 'Preço válido é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNewService = () => {
    setEditingService(null);
    setFormData({ name: '', description: '' });
    setErrors({});
    setModalOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleSaveService = async () => {
    if (!validateServiceForm()) return;

    try {
      setSubmitLoading(true);
      if (editingService) {
        await api.updateService(editingService.id, formData);
      } else {
        await api.createService(formData);
      }
      setModalOpen(false);
      await loadServices();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setErrors({ submit: 'Erro ao salvar serviço' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteService = async (service: Service) => {
    if (!window.confirm(`Tem certeza que deseja deletar "${service.name}"?`)) return;

    try {
      await api.deleteService(service.id);
      await loadServices();
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  const handleNewVariation = (service: Service) => {
    setSelectedService(service);
    setEditingVariation(null);
    setVariationData({ name: '', price: '', observation: '' });
    setErrors({});
    setVariationModalOpen(true);
  };

  const handleEditVariation = (service: Service, variation: ServiceVariation) => {
    setSelectedService(service);
    setEditingVariation(variation);
    setVariationData({
      name: variation.name,
      price: variation.price.toString(),
      observation: variation.observation || '',
    });
    setErrors({});
    setVariationModalOpen(true);
  };

  const handleSaveVariation = async () => {
    if (!validateVariationForm() || !selectedService) return;

    try {
      setSubmitLoading(true);
      if (editingVariation) {
        await api.updateServiceVariation(selectedService.id, editingVariation.id, {
          ...variationData,
          price: parseFloat(variationData.price),
        });
      } else {
        await api.createServiceVariation(selectedService.id, {
          ...variationData,
          price: parseFloat(variationData.price),
        });
      }
      setVariationModalOpen(false);
      await loadServices();
    } catch (error) {
      console.error('Erro ao salvar variação:', error);
      setErrors({ submit: 'Erro ao salvar variação' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteVariation = async (service: Service, variation: ServiceVariation) => {
    if (!window.confirm(`Tem certeza que deseja deletar a variação "${variation.name}"?`)) return;

    try {
      await api.deleteServiceVariation(service.id, variation.id);
      await loadServices();
    } catch (error) {
      console.error('Erro ao deletar variação:', error);
    }
  };

  const columns = [
    { key: 'name', label: 'Nome' },
    {
      key: 'variations',
      label: 'Variações',
      render: (value: ServiceVariation[]) => value?.length || 0,
    },
    {
      key: 'createdAt',
      label: 'Cadastro',
      render: (value: string) => new Date(value).toLocaleDateString('pt-BR'),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          emoji="🛠️"
          title="Gerenciar Serviços"
          description={`${services.length} serviço(s) cadastrado(s)`}
          actions={
            <Button icon="+" onClick={handleNewService} size="lg">
              Novo Serviço
            </Button>
          }
        />

        <Card>
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Carregando serviços...</p>
              </div>
            </div>
          ) : services.length === 0 ? (
            <EmptyState
              emoji="🛠️"
              title="Nenhum serviço encontrado"
              description="Comece cadastrando seu primeiro serviço"
              action={
                <Button icon="+" onClick={handleNewService}>
                  Cadastrar Primeiro Serviço
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
                  {services.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50 transition">
                      {columns.map((col) => (
                        <td key={col.key} className="px-6 py-4">
                          {col.render
                            ? col.render(service[col.key as keyof Service])
                            : (service[col.key as keyof Service] as any)?.toString() || '-'}
                        </td>
                      ))}
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditService(service)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-xs font-medium transition"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleDeleteService(service)}
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

        {/* Expandir variações */}
        {services.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">📝</span>
              <h4 className="text-xl font-bold text-gray-800">Variações dos Serviços</h4>
            </div>
            <div className="space-y-4">
            {services.map((service) => (
              <Card key={service.id} hover>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🛠️</span>
                      <div>
                        <h5 className="font-bold text-gray-800 text-lg">{service.name}</h5>
                        <p className="text-sm text-gray-500">
                          {service.variations?.length || 0} variação(ões)
                        </p>
                      </div>
                    </div>
                    <Button
                      icon="+"
                      size="sm"
                      onClick={() => handleNewVariation(service)}
                    >
                      Nova Variação
                    </Button>
                  </div>

                  {service.variations && service.variations.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-y border-slate-200">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700 text-xs uppercase tracking-wide">Nome</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700 text-xs uppercase tracking-wide">Preço</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700 text-xs uppercase tracking-wide">Observação</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700 text-xs uppercase tracking-wide">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {service.variations.map((variation) => (
                            <tr key={variation.id} className="hover:bg-slate-50 transition">
                              <td className="px-4 py-3 font-medium text-gray-900">{variation.name}</td>
                              <td className="px-4 py-3 text-gray-700">
                                <span className="font-semibold text-green-700">R$ {variation.price.toFixed(2)}</span>
                              </td>
                              <td className="px-4 py-3 text-gray-600">{variation.observation || '-'}</td>
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditVariation(service, variation)}
                                    className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-medium transition"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleDeleteVariation(service, variation)}
                                    className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded text-xs font-medium transition"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-gray-500 text-sm mb-3">Nenhuma variação cadastrada</p>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleNewVariation(service)}
                      >
                        Adicionar Primeira Variação
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
        )}
      </div>

      {/* Modal de Serviço */}
      <Modal
        isOpen={modalOpen}
        title={editingService ? '✏️ Editar Serviço' : '➕ Novo Serviço'}
        onClose={() => setModalOpen(false)}
        actions={[
          { label: 'Cancelar', onClick: () => setModalOpen(false), variant: 'secondary' },
          {
            label: editingService ? 'Atualizar Serviço' : 'Criar Serviço',
            onClick: handleSaveService,
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
        <FormField
          label="Nome"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          required
        />
        <TextAreaField
          label="Descrição"
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </Modal>

      {/* Modal de Variação */}
      <Modal
        isOpen={variationModalOpen}
        title={editingVariation ? 'Editar Variação' : 'Nova Variação'}
        onClose={() => setVariationModalOpen(false)}
        actions={[
          { label: 'Cancelar', onClick: () => setVariationModalOpen(false), variant: 'secondary' },
          {
            label: editingVariation ? 'Atualizar' : 'Criar',
            onClick: handleSaveVariation,
            variant: 'primary',
            loading: submitLoading,
          },
        ]}
      >
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{errors.submit}</div>
        )}
        <FormField
          label="Nome da Variação"
          value={variationData.name}
          onChange={(e) => setVariationData({ ...variationData, name: e.target.value })}
          error={errors.name}
          required
        />
        <FormField
          label="Preço"
          type="number"
          step="0.01"
          min="0"
          value={variationData.price}
          onChange={(e) => setVariationData({ ...variationData, price: e.target.value })}
          error={errors.price}
          required
        />
        <TextAreaField
          label="Observação"
          rows={3}
          value={variationData.observation}
          onChange={(e) => setVariationData({ ...variationData, observation: e.target.value })}
        />
      </Modal>
    </AdminLayout>
  );
};
