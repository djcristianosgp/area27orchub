import React, { useState, useEffect } from 'react';
import { AdminLayout, Modal, FormField, TextAreaField, Button, Table } from '@components/index';
import api from '@services/api';
import { Category } from '@types/index';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await api.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await api.updateCategory(editingId, formData);
      } else {
        await api.createCategory(formData);
      }
      setFormData({ name: '', description: '' });
      setEditingId(null);
      setIsModalOpen(false);
      loadCategories();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({ name: category.name, description: category.description || '' });
    setEditingId(category.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta categoria?')) {
      try {
        await api.deleteCategory(id);
        loadCategories();
      } catch (error) {
        console.error('Erro ao deletar categoria:', error);
      }
    }
  };

  if (loading) return <AdminLayout><div className="text-center py-8">Carregando...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Categorias</h2>
          <Button
            onClick={() => {
              setFormData({ name: '', description: '' });
              setEditingId(null);
              setIsModalOpen(true);
            }}
          >
            + Nova Categoria
          </Button>
        </div>

        <Table
          columns={[
            { key: 'name', label: 'Nome' },
            { key: 'description', label: 'Descrição' },
            {
              key: 'actions',
              label: 'Ações',
              render: (row: Category) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(row)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(row.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Deletar
                  </button>
                </div>
              ),
            },
          ]}
          data={categories}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        title={editingId ? 'Editar Categoria' : 'Nova Categoria'}
        onClose={() => setIsModalOpen(false)}
      >
        <Form
          fields={[
            {
              name: 'name',
              label: 'Nome',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              label: 'Descrição',
              type: 'textarea',
              required: false,
            },
          ]}
          values={formData}
          onChange={(e) =>
            setFormData({ ...formData, [e.target.name]: e.target.value })
          }
          onSubmit={handleSave}
          submitLabel={editingId ? 'Atualizar' : 'Criar'}
        />
      </Modal>
    </AdminLayout>
  );
};
