import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@components/layout';
import { Button, Card, Input, Modal, Table } from '@components/ui';
import { PageHeader, SearchBar, EmptyState, Loading } from '@components/common';
import api from '@services/api';
import { Plus, Edit2, Trash2, Layers } from 'lucide-react';
import type { Group } from '@types/index';

export const GroupsPageNew: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [formData, setFormData] = useState({
    name: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    filterGroups();
  }, [groups, searchQuery]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await api.getGroups();
      setGroups(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterGroups = () => {
    let filtered = groups;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((group) => group.name?.toLowerCase().includes(query));
    }
    setFilteredGroups(filtered);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNew = () => {
    setEditingGroup(null);
    setFormData({ name: '' });
    setErrors({});
    setModalOpen(true);
  };

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setFormData({ name: group.name });
    setErrors({});
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSubmitLoading(true);
      if (editingGroup) {
        await api.updateGroup(editingGroup.id, formData);
      } else {
        await api.createGroup(formData);
      }
      setModalOpen(false);
      await loadGroups();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      setErrors({
        submit: error.response?.data?.message || 'Erro ao salvar grupo',
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (group: Group) => {
    if (!window.confirm(`Deseja realmente excluir o grupo "${group.name}"?`)) return;

    try {
      await api.deleteGroup(group.id);
      await loadGroups();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      alert('Erro ao deletar grupo');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Loading message="Carregando grupos..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Grupos"
          subtitle="Organize produtos em grupos"
          action={
            <Button onClick={handleNew} icon={Plus}>
              Novo Grupo
            </Button>
          }
        />

        {/* Search */}
        <Card>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar grupo..."
          />
        </Card>

        {/* Table */}
        {filteredGroups.length === 0 ? (
          <EmptyState
            title="Nenhum grupo encontrado"
            description={
              searchQuery
                ? 'Tente ajustar sua busca'
                : 'Clique em "Novo Grupo" para começar'
            }
            icon={Layers}
          />
        ) : (
          <Card>
            <Table
              columns={[
                {
                  key: 'name',
                  title: 'Nome',
                  render: (group: Group) => (
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {group.name}
                      </span>
                    </div>
                  ),
                },
                {
                  key: 'createdAt',
                  title: 'Criado em',
                  render: (group: Group) =>
                    new Date(group.createdAt).toLocaleDateString('pt-BR'),
                },
                {
                  key: 'actions',
                  title: 'Ações',
                  align: 'right' as const,
                  render: (group: Group) => (
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(group)}
                        icon={Edit2}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(group)}
                        icon={Trash2}
                        className="text-red-600 hover:text-red-700"
                      />
                    </div>
                  ),
                },
              ]}
              data={filteredGroups}
            />
          </Card>
        )}

        {/* Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingGroup ? 'Editar Grupo' : 'Novo Grupo'}
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
                label="Nome do Grupo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
                required
                placeholder="Ex: Ofertas, Destaque, Novidades..."
                autoFocus
              />
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};
