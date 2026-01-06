import React, { useState, useEffect } from 'react';
import { AdminLayout, Modal, FormField, TextAreaField, Button, Table } from '@components/index';
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

  if (loading) return <AdminLayout><div className="text-center py-8">Carregando...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Grupos</h2>
          <Button
            onClick={() => {
              setFormData({ name: '', description: '' });
              setEditingId(null);
              setIsModalOpen(true);
            }}
          >
            + Novo Grupo
          </Button>
        </div>

        <Table
          columns={[
            { key: 'name', label: 'Nome' },
            { key: 'description', label: 'Descrição' },
            {
              key: 'actions',
              label: 'Ações',
              render: (row: Group) => (
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
          data={groups}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        title={editingId ? 'Editar Grupo' : 'Novo Grupo'}
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
