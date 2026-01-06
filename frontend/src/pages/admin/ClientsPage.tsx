import React, { useState, useEffect } from 'react';
import { AdminLayout, Table, Modal, FormField, TextAreaField, Button, PageHeader, Card, EmptyState } from '@components/index';
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
        <PageHeader
          emoji="👥"
          title="Gerenciar Clientes"
          description={`${clients.length} cliente(s) cadastrado(s)`}
          actions={
            <Button icon="+" onClick={handleNew} size="lg">
              Novo Cliente
            </Button>
          }
        />

        <Card>
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Carregando clientes...</p>
              </div>
            </div>
          ) : clients.length === 0 ? (
            <EmptyState
              emoji="👥"
              title="Nenhum cliente encontrado"
              description="Comece cadastrando seu primeiro cliente"
              action={
                <Button icon="+" onClick={handleNew}>
                  Cadastrar Primeiro Cliente
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    {columns.map((col) => (
                      <th key={col.key} className="px-6 py-4 font-semibold text-gray-800 text-sm uppercase tracking-wide">
                        {col.label}
                      </th>
                    ))}
                    <th className="px-6 py-4 font-semibold text-gray-800 text-sm uppercase tracking-wide">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 transition">
                      {columns.map((col) => (
                        <td key={col.key} className="px-6 py-4">
                          {col.render
                            ? col.render(client[col.key as keyof Client], client)
                            : (client[col.key as keyof Client] as any)?.toString() || '-'}
                        </td>
                      ))}
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(client)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-xs font-medium transition"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleDelete(client)}
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

      {/* Modal de Criação/Edição */}
      <Modal
        isOpen={modalOpen}
        title={editingClient ? '✏️ Editar Cliente' : '➕ Novo Cliente'}
        onClose={() => setModalOpen(false)}
        actions={[
          {
            label: 'Cancelar',
            onClick: () => setModalOpen(false),
            variant: 'secondary',
          },
          {
            label: editingClient ? 'Atualizar Cliente' : 'Criar Cliente',
            onClick: handleSave,
            variant: 'primary',
            loading: submitLoading,
          },
        ]}
      >
        {errors.submit && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
            <span>⚠️</span>
            <span>{errors.submit}</span>
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
