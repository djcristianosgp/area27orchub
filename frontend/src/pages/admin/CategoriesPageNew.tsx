import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@components/layout';
import { Button, Card, Input, Modal, Table } from '@components/ui';
import { PageHeader, SearchBar, EmptyState, Loading } from '@components/common';
import api from '@services/api';
import { Plus, Edit2, Trash2, FolderOpen } from 'lucide-react';
import type { Category } from '@types/index';

export const CategoriesPageNew: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, searchQuery]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await api.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = () => {
    let filtered = categories;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((category) =>
        category.name?.toLowerCase().includes(query)
      );
    }
    setFilteredCategories(filtered);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNew = () => {
    setEditingCategory(null);
    setFormData({ name: '' });
    setErrors({});
    setModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name });
    setErrors({});
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSubmitLoading(true);
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, formData);
      } else {
        await api.createCategory(formData);
      }
      setModalOpen(false);
      await loadCategories();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      setErrors({
        submit: error.response?.data?.message || 'Erro ao salvar categoria',
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!window.confirm(`Deseja realmente excluir a categoria "${category.name}"?`))
      return;

    try {
      await api.deleteCategory(category.id);
      await loadCategories();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      alert('Erro ao deletar categoria');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Loading message="Carregando categorias..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Categorias"
          subtitle="Organize produtos por categorias"
          action={
            <Button onClick={handleNew} icon={Plus}>
              Nova Categoria
            </Button>
          }
        />

        {/* Search */}
        <Card>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar categoria..."
          />
        </Card>

        {/* Table */}
        {filteredCategories.length === 0 ? (
          <EmptyState
            title="Nenhuma categoria encontrada"
            description={
              searchQuery
                ? 'Tente ajustar sua busca'
                : 'Clique em "Nova Categoria" para começar'
            }
            icon={FolderOpen}
          />
        ) : (
          <Card>
            <Table
              columns={[
                {
                  key: 'name',
                  title: 'Nome',
                  render: (category: Category) => (
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-black">
                        {category.name}
                      </span>
                    </div>
                  ),
                },
                {
                  key: 'createdAt',
                  title: 'Criada em',
                  render: (category: Category) =>
                    new Date(category.createdAt).toLocaleDateString('pt-BR'),
                },
                {
                  key: 'actions',
                  title: 'Ações',
                  align: 'right' as const,
                  render: (category: Category) => (
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category)}
                        icon={Edit2}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category)}
                        icon={Trash2}
                        className="text-red-600 hover:text-red-700"
                      />
                    </div>
                  ),
                },
              ]}
              data={filteredCategories}
            />
          </Card>
        )}

        {/* Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
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
                label="Nome da Categoria"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
                required
                placeholder="Ex: Eletrônicos, Roupas, Alimentos..."
                autoFocus
              />
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};
