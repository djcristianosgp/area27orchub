import React, { useState, useEffect } from 'react';
import { AdminLayout, Modal, FormField, TextAreaField, Button, Table } from '@components/index';
import api from '@services/api';
import { Brand } from '@types/index';

export const BrandsPage: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      setLoading(true);
      const response = await api.getBrands();
      setBrands(response.data);
    } catch (error) {
      console.error('Erro ao carregar marcas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await api.updateBrand(editingId, formData);
      } else {
        await api.createBrand(formData);
      }
      setFormData({ name: '', description: '' });
      setEditingId(null);
      setIsModalOpen(false);
      loadBrands();
    } catch (error) {
      console.error('Erro ao salvar marca:', error);
    }
  };

  const handleEdit = (brand: Brand) => {
    setFormData({ name: brand.name, description: brand.description || '' });
    setEditingId(brand.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta marca?')) {
      try {
        await api.deleteBrand(id);
        loadBrands();
      } catch (error) {
        console.error('Erro ao deletar marca:', error);
      }
    }
  };

  if (loading) return <AdminLayout><div className="text-center py-8">Carregando...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Marcas</h2>
          <Button
            onClick={() => {
              setFormData({ name: '', description: '' });
              setEditingId(null);
              setIsModalOpen(true);
            }}
          >
            + Nova Marca
          </Button>
        </div>

        <Table
          columns={[
            { key: 'name', label: 'Nome' },
            { key: 'description', label: 'Descrição' },
            {
              key: 'actions',
              label: 'Ações',
              render: (row: Brand) => (
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
          data={brands}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        title={editingId ? 'Editar Marca' : 'Nova Marca'}
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
