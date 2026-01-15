import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@components/layout';
import { Button, Card, Input, Select, Modal, Table, Badge } from '@components/ui';
import { PageHeader, SearchBar, EmptyState, Loading } from '@components/common';
import api from '@services/api';
import { Plus, Edit2, Trash2, Mail, Phone } from 'lucide-react';
import type { Client } from '@types/index';

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    observations: '',
    status: 'ACTIVE',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchQuery]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await api.getClients();
      setClients(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    let filtered = clients;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (client) =>
          client.name?.toLowerCase().includes(query) ||
          client.email?.toLowerCase().includes(query)
      );
    }
    setFilteredClients(filtered);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
    if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNew = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      observations: '',
      status: 'ACTIVE',
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      observations: client.observations || '',
      status: client.status || 'ACTIVE',
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSubmitLoading(true);
      if (editingClient) {
        await api.updateClient(editingClient.id, formData);
      } else {
        await api.createClient(formData);
      }
      setModalOpen(false);
      await loadClients();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      setErrors({
        submit: error.response?.data?.message || 'Erro ao salvar cliente',
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteConfirm = (client: Client) => {
    setClientToDelete(client);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!clientToDelete) return;

    try {
      await api.deleteClient(clientToDelete.id);
      await loadClients();
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Loading message="Carregando clientes..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Clientes"
          subtitle="Gerencie todos os seus clientes e suas informações"
          action={
            <Button onClick={handleNew} variant="primary" size="lg">
              <Plus className="h-5 w-5" />
              Novo Cliente
            </Button>
          }
        />

        {/* Filters */}
        <Card>
          <div className="p-4 md:p-6">
            <SearchBar onSearch={setSearchQuery} placeholder="Pesquisar por nome ou email..." />
          </div>
        </Card>

        {/* Content */}
        {filteredClients.length === 0 ? (
          <EmptyState
            title="Nenhum cliente encontrado"
            description={
              clients.length === 0
                ? 'Comece adicionando seu primeiro cliente'
                : 'Tente ajustar seus filtros de pesquisa'
            }
            action={
              clients.length === 0
                ? { label: 'Adicionar Primeiro Cliente', onClick: handleNew }
                : undefined
            }
          />
        ) : (
          <Card>
            <div className="p-6 overflow-x-auto">
              <Table
                columns={[
                  {
                    key: 'name' as any,
                    label: 'Nome',
                    sortable: true,
                  },
                  {
                    key: 'email' as any,
                    label: 'Email',
                    render: (val) => (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-secondary-400" />
                        <span>{val || '-'}</span>
                      </div>
                    ),
                  },
                  {
                    key: 'phone' as any,
                    label: 'Telefone',
                    render: (val) => (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-secondary-400" />
                        <span>{val || '-'}</span>
                      </div>
                    ),
                  },
                  {
                    key: 'status' as any,
                    label: 'Status',
                    render: (val) => (
                      <Badge variant={val === 'ACTIVE' ? 'success' : 'secondary'}>
                        {val === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    ),
                  },
                  {
                    key: 'id' as any,
                    label: 'Ações',
                    render: (val, row: any) => (
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(row);
                          }}
                          className="p-1.5 hover:bg-primary-100 rounded-lg text-primary-600 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConfirm(row);
                          }}
                          className="p-1.5 hover:bg-danger-100 rounded-lg text-danger-600 transition-colors"
                          title="Deletar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ),
                  },
                ]}
                data={filteredClients}
              />
            </div>
          </Card>
        )}

        {/* Form Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}
          size="md"
        >
          <div className="space-y-4">
            {errors.submit && (
              <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm">
                {errors.submit}
              </div>
            )}

            <Input
              label="Nome/Razão Social"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              required
            />

            <Input
              type="email"
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              required
            />

            <Input
              label="Telefone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={errors.phone}
              required
            />

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'ACTIVE', label: 'Ativo' },
                { value: 'INACTIVE', label: 'Inativo' },
              ]}
            />

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Observações
              </label>
              <textarea
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                placeholder="Adicione observações sobre este cliente..."
                className="input-base h-24 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              isLoading={submitLoading}
              disabled={submitLoading}
            >
              {editingClient ? 'Atualizar' : 'Criar'} Cliente
            </Button>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          title="Confirmar Exclusão"
        >
          <div className="space-y-4">
            <p className="text-secondary-700">
              Tem certeza que deseja deletar o cliente <strong>{clientToDelete?.name}</strong>?
            </p>
            <p className="text-sm text-secondary-500">Esta ação não pode ser desfeita.</p>
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <Button variant="ghost" onClick={() => setDeleteConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirmed}>
              Deletar
            </Button>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};
