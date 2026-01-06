import React, { useState, useEffect } from 'react';
import { AdminLayout, Table, Modal, FormField, TextAreaField, Button } from '@components/index';
import api from '@services/api';
import { Client } from '@types/index';

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    observations: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);

  // Carregar clientes
  useEffect(() => {
    loadClients();
  }, []);

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

  // Validar form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Abrir modal para novo
  const handleNew = () => {
    setEditingClient(null);
    setFormData({ name: '', email: '', phone: '', observations: '' });
    setErrors({});
    setModalOpen(true);
  };

  // Abrir modal para editar
  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      observations: client.observations || '',
    });
    setErrors({});
    setModalOpen(true);
  };

  // Salvar cliente
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
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setErrors({ submit: 'Erro ao salvar cliente' });
    } finally {
      setSubmitLoading(false);
    }
  };

  // Deletar cliente
  const handleDelete = async (client: Client) => {
    if (!window.confirm(`Tem certeza que deseja deletar "${client.name}"?`)) return;

    try {
      await api.deleteClient(client.id);
      await loadClients();
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Telefone' },
    {
      key: 'createdAt',
      label: 'Cadastro',
      render: (value: string) => new Date(value).toLocaleDateString('pt-BR'),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Gerenciar Clientes</h3>
            <p className="text-gray-600">Total: {clients.length} cliente(s)</p>
          </div>
          <Button icon="+" onClick={handleNew} size="lg">
            Novo Cliente
          </Button>
        </div>

        <Table
          columns={columns}
          data={clients}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Modal de Criação/Edição */}
      <Modal
        isOpen={modalOpen}
        title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}
        onClose={() => setModalOpen(false)}
        actions={[
          {
            label: 'Cancelar',
            onClick: () => setModalOpen(false),
            variant: 'secondary',
          },
          {
            label: editingClient ? 'Atualizar' : 'Criar',
            onClick: handleSave,
            variant: 'primary',
            loading: submitLoading,
          },
        ]}
      >
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {errors.submit}
          </div>
        )}
        <FormField
          label="Nome"
          placeholder="João Silva"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          required
        />
        <FormField
          label="Email"
          type="email"
          placeholder="joao@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
          required
        />
        <FormField
          label="Telefone"
          placeholder="(11) 99999-9999"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <TextAreaField
          label="Observações"
          placeholder="Anotações sobre o cliente..."
          rows={4}
          value={formData.observations}
          onChange={(e) =>
            setFormData({ ...formData, observations: e.target.value })
          }
        />
      </Modal>
    </AdminLayout>
  );
};
