import React, { useState, useEffect } from 'react';
import { AdminLayout, Modal, FormField, TextAreaField, Button, PageHeader, Card, EmptyState } from '@components/index';
import api from '@services/api';
import { Group } from '@types/index';

export const GroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await api.getGroups();
      setGroups(response.data);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await api.updateGroup(editingId, formData);
      } else {
        await api.createGroup(formData);
      }
      setFormData({ name: '', description: '' });
      setEditingId(null);
      setIsModalOpen(false);
      loadGroups();
    } catch (error) {
      console.error('Erro ao salvar grupo:', error);
    }
  };

  const handleEdit = (group: Group) => {
    setFormData({ name: group.name, description: group.description || '' });
    setEditingId(group.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar este grupo?')) {
      try {
        await api.deleteGroup(id);
        loadGroups();
      } catch (error) {
        console.error('Erro ao deletar grupo:', error);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          emoji="🎯"
          title="Gerenciar Grupos"
          description={`${groups.length} grupo(s) cadastrado(s)`}
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
              Novo Grupo
            </Button>
          }
        />

        <Card>
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Carregando grupos...</p>
              </div>
            </div>
          ) : groups.length === 0 ? (
            <EmptyState
              emoji="🎯"
              title="Nenhum grupo encontrado"
              description="Comece criando seu primeiro grupo de produtos"
              action={
                <Button
                  icon="+"
                  onClick={() => {
                    setFormData({ name: '', description: '' });
                    setEditingId(null);
                    setIsModalOpen(true);
                  }}
                >
                  Criar Primeiro Grupo
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
                  {groups.map((group) => (
                    <tr key={group.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">{group.name}</td>
                      <td className="px-6 py-4 text-gray-600">{group.description || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(group)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-xs font-medium transition"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleDelete(group.id)}
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
        title={editingId ? '✏️ Editar Grupo' : '➕ Novo Grupo'}
        onClose={() => setIsModalOpen(false)}
        actions={[
          { label: 'Cancelar', onClick: () => setIsModalOpen(false), variant: 'secondary' },
          {
            label: editingId ? 'Atualizar Grupo' : 'Criar Grupo',
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
