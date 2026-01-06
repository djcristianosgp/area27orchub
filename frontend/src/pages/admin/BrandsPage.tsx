import React, { useState, useEffect } from 'react';
import { AdminLayout, Modal, FormField, TextAreaField, Button, PageHeader, Card, EmptyState } from '@components/index';
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          emoji="™️"
          title="Gerenciar Marcas"
          description={`${brands.length} marca(s) cadastrada(s)`}
          actions={
            <Button
              icon="+"
              onClick={() => {
                setFormData({ name: '', description: '' });
                setEditingId(null);
                setIsModalOpen(true);
              }}
              size="lg"
            >
              Nova Marca
            </Button>
          }
        />

        <Card>
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Carregando marcas...</p>
              </div>
            </div>
          ) : brands.length === 0 ? (
            <EmptyState
              emoji="™️"
              title="Nenhuma marca encontrada"
              description="Comece cadastrando sua primeira marca de produtos"
              action={
                <Button
                  icon="+"
                  onClick={() => {
                    setFormData({ name: '', description: '' });
                    setEditingId(null);
                    setIsModalOpen(true);
                  }}
                >
                  Criar Primeira Marca
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-gray-800 text-sm uppercase tracking-wide">Nome</th>
                    <th className="px-6 py-4 font-semibold text-gray-800 text-sm uppercase tracking-wide">Descrição</th>
                    <th className="px-6 py-4 font-semibold text-gray-800 text-sm uppercase tracking-wide">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {brands.map((brand) => (
                    <tr key={brand.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">{brand.name}</td>
                      <td className="px-6 py-4 text-gray-600">{brand.description || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(brand)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-xs font-medium transition"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleDelete(brand.id)}
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

      <Modal
        isOpen={isModalOpen}
        title={editingId ? '✏️ Editar Marca' : '➕ Nova Marca'}
        onClose={() => setIsModalOpen(false)}
        actions={[
          { label: 'Cancelar', onClick: () => setIsModalOpen(false), variant: 'secondary' },
          {
            label: editingId ? 'Atualizar Marca' : 'Criar Marca',
            onClick: handleSave,
            variant: 'primary',
          },
        ]}
      >
        <FormField
          label="Nome"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <TextAreaField
          label="Descrição"
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </Modal>
    </AdminLayout>
  );
};
