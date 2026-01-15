import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@components/layout';
import { Button, Card, Input, Modal, Table } from '@components/ui';
import { PageHeader, SearchBar, EmptyState, Loading } from '@components/common';
import api from '@services/api';
import { Plus, Edit2, Trash2, Award } from 'lucide-react';
import type { Brand } from '@types/index';

export const BrandsPageNew: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({
    name: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    loadBrands();
  }, []);

  useEffect(() => {
    filterBrands();
  }, [brands, searchQuery]);

  const loadBrands = async () => {
    try {
      setLoading(true);
      const response = await api.getBrands();
      setBrands(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar marcas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBrands = () => {
    let filtered = brands;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((brand) => brand.name?.toLowerCase().includes(query));
    }
    setFilteredBrands(filtered);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNew = () => {
    setEditingBrand(null);
    setFormData({ name: '' });
    setErrors({});
    setModalOpen(true);
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({ name: brand.name });
    setErrors({});
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSubmitLoading(true);
      if (editingBrand) {
        await api.updateBrand(editingBrand.id, formData);
      } else {
        await api.createBrand(formData);
      }
      setModalOpen(false);
      await loadBrands();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      setErrors({
        submit: error.response?.data?.message || 'Erro ao salvar marca',
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (brand: Brand) => {
    if (!window.confirm(`Deseja realmente excluir a marca "${brand.name}"?`)) return;

    try {
      await api.deleteBrand(brand.id);
      await loadBrands();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      alert('Erro ao deletar marca');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Loading message="Carregando marcas..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Marcas"
          subtitle="Gerencie marcas de produtos"
          action={
            <Button onClick={handleNew} icon={Plus}>
              Nova Marca
            </Button>
          }
        />

        {/* Search */}
        <Card>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar marca..."
          />
        </Card>

        {/* Table */}
        {filteredBrands.length === 0 ? (
          <EmptyState
            title="Nenhuma marca encontrada"
            description={
              searchQuery
                ? 'Tente ajustar sua busca'
                : 'Clique em "Nova Marca" para começar'
            }
            icon={Award}
          />
        ) : (
          <Card>
            <Table
              columns={[
                {
                  key: 'name',
                  title: 'Nome',
                  render: (brand: Brand) => (
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {brand.name}
                      </span>
                    </div>
                  ),
                },
                {
                  key: 'createdAt',
                  title: 'Criada em',
                  render: (brand: Brand) =>
                    new Date(brand.createdAt).toLocaleDateString('pt-BR'),
                },
                {
                  key: 'actions',
                  title: 'Ações',
                  align: 'right' as const,
                  render: (brand: Brand) => (
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(brand)}
                        icon={Edit2}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(brand)}
                        icon={Trash2}
                        className="text-red-600 hover:text-red-700"
                      />
                    </div>
                  ),
                },
              ]}
              data={filteredBrands}
            />
          </Card>
        )}

        {/* Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingBrand ? 'Editar Marca' : 'Nova Marca'}
          footer={
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} loading={submitLoading}>
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
                label="Nome da Marca"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
                required
                placeholder="Ex: Samsung, Apple, Nike..."
                autoFocus
              />
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};
