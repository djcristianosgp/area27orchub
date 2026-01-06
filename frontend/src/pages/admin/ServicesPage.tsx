import React, { useState, useEffect } from 'react';
import { AdminLayout, Table, Modal, FormField, TextAreaField, Button } from '@components/index';
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
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Gerenciar Serviços</h3>
            <p className="text-gray-600">Total: {services.length} serviço(s)</p>
          </div>
          <Button icon="+" onClick={handleNewService} size="lg">
            Novo Serviço
          </Button>
        </div>

        <Table
          columns={columns}
          data={services}
          loading={loading}
          onEdit={handleEditService}
          onDelete={handleDeleteService}
        />

        {/* Expandir variações */}
        <div className="mt-8">
          <h4 className="text-lg font-bold text-gray-800 mb-4">Variações dos Serviços</h4>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-semibold text-gray-700">{service.name}</h5>
                  <Button
                    icon="+"
                    size="sm"
                    onClick={() => handleNewVariation(service)}
                  >
                    Variação
                  </Button>
                </div>
                <div className="space-y-2">
                  {service.variations?.map((variation) => (
                    <div
                      key={variation.id}
                      className="flex justify-between items-center bg-gray-50 p-3 rounded"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-700">{variation.name}</p>
                        <p className="text-sm text-gray-500">R$ {variation.price.toFixed(2)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleEditVariation(service, variation)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteVariation(service, variation)}
                        >
                          Deletar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Serviço */}
      <Modal
        isOpen={modalOpen}
        title={editingService ? 'Editar Serviço' : 'Novo Serviço'}
        onClose={() => setModalOpen(false)}
        actions={[
          { label: 'Cancelar', onClick: () => setModalOpen(false), variant: 'secondary' },
          {
            label: editingService ? 'Atualizar' : 'Criar',
            onClick: handleSaveService,
            variant: 'primary',
            loading: submitLoading,
          },
        ]}
      >
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{errors.submit}</div>
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
