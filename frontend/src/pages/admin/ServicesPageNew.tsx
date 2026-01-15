import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@components/layout';
import { Button, Card, Input, Modal, Badge } from '@components/ui';
import { PageHeader, SearchBar, EmptyState, Loading } from '@components/common';
import api from '@services/api';
import { Plus, Edit2, Trash2, DollarSign, Briefcase } from 'lucide-react';
import type { Service, ServiceVariation } from '@types/index';

export const ServicesPageNew: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Service Modal
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceFormData, setServiceFormData] = useState({
    name: '',
    description: '',
  });

  // Variation Modal
  const [variationModalOpen, setVariationModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [editingVariation, setEditingVariation] = useState<ServiceVariation | null>(null);
  const [variationFormData, setVariationFormData] = useState({
    name: '',
    price: '',
    observation: '',
  });

  // View Variations Modal
  const [viewVariationsModalOpen, setViewVariationsModalOpen] = useState(false);
  const [viewingService, setViewingService] = useState<Service | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchQuery]);

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

  const filterServices = () => {
    let filtered = services;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (service) =>
          service.name?.toLowerCase().includes(query) ||
          service.description?.toLowerCase().includes(query)
      );
    }
    setFilteredServices(filtered);
  };

  // ===== Service CRUD =====
  const validateServiceForm = () => {
    const newErrors: Record<string, string> = {};
    if (!serviceFormData.name.trim()) newErrors.name = 'Nome é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNewService = () => {
    setEditingService(null);
    setServiceFormData({
      name: '',
      description: '',
    });
    setErrors({});
    setServiceModalOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceFormData({
      name: service.name,
      description: service.description || '',
    });
    setErrors({});
    setServiceModalOpen(true);
  };

  const handleSaveService = async () => {
    if (!validateServiceForm()) return;

    try {
      setSubmitLoading(true);
      if (editingService) {
        await api.updateService(editingService.id, serviceFormData);
      } else {
        await api.createService(serviceFormData);
      }
      setServiceModalOpen(false);
      await loadServices();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      setErrors({
        submit: error.response?.data?.message || 'Erro ao salvar serviço',
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteService = async (service: Service) => {
    if (!window.confirm(`Deseja realmente excluir o serviço "${service.name}"?`)) return;

    try {
      await api.deleteService(service.id);
      await loadServices();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      alert('Erro ao deletar serviço');
    }
  };

  // ===== Variation CRUD =====
  const validateVariationForm = () => {
    const newErrors: Record<string, string> = {};
    if (!variationFormData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!variationFormData.price || parseFloat(variationFormData.price) <= 0)
      newErrors.price = 'Preço válido é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleViewVariations = (service: Service) => {
    setViewingService(service);
    setViewVariationsModalOpen(true);
  };

  const handleNewVariation = (service: Service) => {
    setSelectedService(service);
    setEditingVariation(null);
    setVariationFormData({
      name: '',
      price: '',
      observation: '',
    });
    setErrors({});
    setVariationModalOpen(true);
  };

  const handleEditVariation = (service: Service, variation: ServiceVariation) => {
    setSelectedService(service);
    setEditingVariation(variation);
    setVariationFormData({
      name: variation.name,
      price: variation.price.toString(),
      observation: variation.observation || '',
    });
    setErrors({});
    setViewVariationsModalOpen(false);
    setVariationModalOpen(true);
  };

  const handleSaveVariation = async () => {
    if (!validateVariationForm() || !selectedService) return;

    try {
      setSubmitLoading(true);
      const data = {
        ...variationFormData,
        price: parseFloat(variationFormData.price),
      };

      if (editingVariation) {
        await api.updateServiceVariation(selectedService.id, editingVariation.id, data);
      } else {
        await api.createServiceVariation(selectedService.id, data);
      }
      setVariationModalOpen(false);
      await loadServices();

      // Reopen view variations modal if it was open
      if (viewingService) {
        const updatedService = services.find((s) => s.id === selectedService.id);
        if (updatedService) {
          setViewingService(updatedService);
          setViewVariationsModalOpen(true);
        }
      }
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      setErrors({
        submit: error.response?.data?.message || 'Erro ao salvar variação',
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteVariation = async (serviceId: string, variationId: string) => {
    if (!window.confirm('Deseja realmente excluir esta variação?')) return;

    try {
      await api.deleteServiceVariation(serviceId, variationId);
      await loadServices();

      // Update viewing service
      const updatedService = services.find((s) => s.id === serviceId);
      if (updatedService && viewingService) {
        setViewingService(updatedService);
      }
    } catch (error) {
      console.error('Erro ao deletar:', error);
      alert('Erro ao deletar variação');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Loading message="Carregando serviços..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Serviços"
          subtitle="Gerencie serviços e suas variações de preço"
          action={
            <Button onClick={handleNewService} icon={Plus}>
              Novo Serviço
            </Button>
          }
        />

        {/* Search */}
        <Card>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar por nome ou descrição..."
          />
        </Card>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <EmptyState
            title="Nenhum serviço encontrado"
            description={
              searchQuery
                ? 'Tente ajustar sua busca'
                : 'Clique em "Novo Serviço" para começar'
            }
            icon={Briefcase}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <Card key={service.id} hover className="relative">
                <div className="space-y-4">
                  {/* Header */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 ">
                      {service.name}
                    </h3>
                    {service.description && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                  </div>

                  {/* Variations count */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Briefcase className="w-4 h-4" />
                    <span>{service.variations?.length || 0} variação(ões)</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewVariations(service)}
                      className="flex-1"
                    >
                      Ver Variações
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditService(service)}
                      icon={Edit2}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteService(service)}
                      icon={Trash2}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Service Modal */}
        <Modal
          isOpen={serviceModalOpen}
          onClose={() => setServiceModalOpen(false)}
          title={editingService ? 'Editar Serviço' : 'Novo Serviço'}
          footer={
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setServiceModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveService} loading={submitLoading}>
                Salvar
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {errors.submit && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/10 rounded-lg">
                {errors.submit}
              </div>
            )}

            <div>
              <Input
                label="Nome do Serviço"
                value={serviceFormData.name}
                onChange={(e) =>
                  setServiceFormData({ ...serviceFormData, name: e.target.value })
                }
                error={errors.name}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descrição
              </label>
              <textarea
                value={serviceFormData.description}
                onChange={(e) =>
                  setServiceFormData({ ...serviceFormData, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </Modal>

        {/* View Variations Modal */}
        <Modal
          isOpen={viewVariationsModalOpen}
          onClose={() => setViewVariationsModalOpen(false)}
          title={`Variações de ${viewingService?.name}`}
          size="lg"
          footer={
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setViewVariationsModalOpen(false)}>
                Fechar
              </Button>
              {viewingService && (
                <Button onClick={() => handleNewVariation(viewingService)} icon={Plus}>
                  Nova Variação
                </Button>
              )}
            </div>
          }
        >
          {viewingService?.variations && viewingService.variations.length > 0 ? (
            <div className="space-y-3">
              {viewingService.variations.map((variation) => (
                <Card key={variation.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {variation.name}
                      </h4>
                      <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span>
                            R${' '}
                            {variation.price.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        {variation.observation && (
                          <p className="mt-1 text-sm">{variation.observation}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditVariation(viewingService, variation)}
                        icon={Edit2}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDeleteVariation(viewingService.id, variation.id)
                        }
                        icon={Trash2}
                        className="text-red-600 hover:text-red-700"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nenhuma variação cadastrada"
              description="Adicione variações de preço para este serviço"
              icon={Briefcase}
            />
          )}
        </Modal>

        {/* Variation Modal */}
        <Modal
          isOpen={variationModalOpen}
          onClose={() => setVariationModalOpen(false)}
          title={editingVariation ? 'Editar Variação' : 'Nova Variação'}
          footer={
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setVariationModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveVariation} loading={submitLoading}>
                Salvar
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {errors.submit && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/10 rounded-lg">
                {errors.submit}
              </div>
            )}

            <div>
              <Input
                label="Nome da Variação"
                value={variationFormData.name}
                onChange={(e) =>
                  setVariationFormData({ ...variationFormData, name: e.target.value })
                }
                error={errors.name}
                required
                placeholder="Ex: Básico, Premium, Completo"
              />
            </div>

            <div>
              <Input
                label="Preço"
                type="number"
                step="0.01"
                value={variationFormData.price}
                onChange={(e) =>
                  setVariationFormData({ ...variationFormData, price: e.target.value })
                }
                error={errors.price}
                required
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Observação
              </label>
              <textarea
                value={variationFormData.observation}
                onChange={(e) =>
                  setVariationFormData({
                    ...variationFormData,
                    observation: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Informações adicionais sobre esta variação"
              />
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};
