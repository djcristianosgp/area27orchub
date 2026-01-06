import React, { useState, useEffect } from 'react';
import { AdminLayout, Button, FormField, Modal, PageHeader, Card, EmptyState, SelectField } from '@components/index';
import api from '@services/api';
import { Client, ClientEmail, ClientPhone, ClientSocialMedia } from '@types/index';

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    status: 'ACTIVE',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    zipCode: '',
    state: '',
    emails: [] as ClientEmail[],
    phones: [] as ClientPhone[],
    socialMedia: [] as ClientSocialMedia[],
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nome/Razão Social é obrigatório';
    if (formData.emails.length === 0) newErrors.emails = 'Adicione pelo menos um email';
    if (formData.phones.length === 0) newErrors.phones = 'Adicione pelo menos um telefone';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNew = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      nickname: '',
      status: 'ACTIVE',
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      zipCode: '',
      state: '',
      emails: [],
      phones: [],
      socialMedia: [],
      observations: '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      nickname: client.nickname || '',
      status: client.status || 'ACTIVE',
      street: client.street || '',
      number: client.number || '',
      neighborhood: client.neighborhood || '',
      city: client.city || '',
      zipCode: client.zipCode || '',
      state: client.state || '',
      emails: client.clientEmails || [],
      phones: client.clientPhones || [],
      socialMedia: client.clientSocialMedia || [],
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

  const handleAddEmail = () => {
    setFormData({
      ...formData,
      emails: [...formData.emails, { email: '', primary: formData.emails.length === 0 }],
    });
  };

  const handleRemoveEmail = (index: number) => {
    setFormData({
      ...formData,
      emails: formData.emails.filter((_, i) => i !== index),
    });
  };

  const handleEmailChange = (index: number, field: string, value: any) => {
    const newEmails = [...formData.emails];
    newEmails[index] = { ...newEmails[index], [field]: value };
    setFormData({ ...formData, emails: newEmails });
  };

  const handleAddPhone = () => {
    setFormData({
      ...formData,
      phones: [...formData.phones, { phone: '', hasWhatsapp: false, primary: formData.phones.length === 0 }],
    });
  };

  const handleRemovePhone = (index: number) => {
    setFormData({
      ...formData,
      phones: formData.phones.filter((_, i) => i !== index),
    });
  };

  const handlePhoneChange = (index: number, field: string, value: any) => {
    const newPhones = [...formData.phones];
    newPhones[index] = { ...newPhones[index], [field]: value };
    setFormData({ ...formData, phones: newPhones });
  };

  const handleAddSocialMedia = () => {
    setFormData({
      ...formData,
      socialMedia: [...formData.socialMedia, { platform: '', url: '' }],
    });
  };

  const handleRemoveSocialMedia = (index: number) => {
    setFormData({
      ...formData,
      socialMedia: formData.socialMedia.filter((_, i) => i !== index),
    });
  };

  const handleSocialMediaChange = (index: number, field: string, value: any) => {
    const newSocialMedia = [...formData.socialMedia];
    newSocialMedia[index] = { ...newSocialMedia[index], [field]: value };
    setFormData({ ...formData, socialMedia: newSocialMedia });
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      ACTIVE: '✅',
      INACTIVE: '⏸️',
      BLOCKED: '🚫',
    };
    return icons[status] || '⚪';
  };

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
                    <th className="px-6 py-4 font-semibold text-gray-800 text-sm uppercase tracking-wide">Nome</th>
                    <th className="px-6 py-4 font-semibold text-gray-800 text-sm uppercase tracking-wide">CPF/CNPJ</th>
                    <th className="px-6 py-4 font-semibold text-gray-800 text-sm uppercase tracking-wide">Email Principal</th>
                    <th className="px-6 py-4 font-semibold text-gray-800 text-sm uppercase tracking-wide">Telefone</th>
                    <th className="px-6 py-4 font-semibold text-gray-800 text-sm uppercase tracking-wide">Status</th>
                    <th className="px-6 py-4 font-semibold text-gray-800 text-sm uppercase tracking-wide">Cadastro</th>
                    <th className="px-6 py-4 font-semibold text-gray-800 text-sm uppercase tracking-wide">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{client.name}</p>
                          {client.nickname && <p className="text-xs text-gray-500">{client.nickname}</p>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {client.clientEmails && client.clientEmails.length > 0
                          ? client.clientEmails.find((e) => e.primary)?.email || client.clientEmails[0]?.email || '-'
                          : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {client.clientPhones && client.clientPhones.length > 0
                          ? (client.clientPhones.find((p) => p.primary)?.phone || client.clientPhones[0]?.phone || '-') +
                            (client.clientPhones.find((p) => p.hasWhatsapp) ? ' 📱' : '')
                          : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          client.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : client.status === 'INACTIVE'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          <span>{getStatusIcon(client.status)}</span>
                          {client.status === 'ACTIVE' ? 'Ativo' : client.status === 'INACTIVE' ? 'Inativo' : 'Bloqueado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{new Date(client.createdAt).toLocaleDateString('pt-BR')}</td>
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

        <div className="space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300">
          {/* Dados Básicos */}
          <div className="pb-4 border-b-2 border-gray-200">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📋</span>
              Dados Básicos
            </h4>
            <div className="space-y-3">
              <FormField
                label="Nome/Razão Social"
                placeholder="João Silva ou Empresa LTDA"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
                required
              />
              <FormField
                label="Apelido/Nome Fantasia"
                placeholder="João ou Empresa Popular"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              />
              <div className="grid grid-cols-1 gap-3">
                <SelectField
                  label="Status"
                  options={[
                    { value: 'ACTIVE', label: '✅ Ativo' },
                    { value: 'INACTIVE', label: '⏸️ Inativo' },
                    { value: 'BLOCKED', label: '🚫 Bloqueado' },
                  ]}
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="pb-4 border-b-2 border-gray-200">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>🏠</span>
              Endereço
            </h4>
            <div className="space-y-3">
              <FormField
                label="Logradouro"
                placeholder="Rua/Avenida"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              />
              <div className="grid grid-cols-3 gap-3">
                <FormField
                  label="Número"
                  placeholder="Número"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                />
                <FormField
                  label="Bairro"
                  placeholder="Bairro"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                />
                <FormField
                  label="CEP"
                  placeholder="00000-000"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="Cidade"
                  placeholder="São Paulo"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
                <FormField
                  label="Estado"
                  placeholder="SP"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          {/* Emails */}
          <div className="pb-4 border-b-2 border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span>✉️</span>
                Emails
              </h4>
              <Button size="sm" onClick={handleAddEmail}>
                + Email
              </Button>
            </div>
            {errors.emails && <p className="text-sm text-red-500 mb-2">{errors.emails}</p>}
            <div className="space-y-2">
              {formData.emails.map((email, index) => (
                <div key={index} className="flex gap-2 items-end bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={email.email}
                    onChange={(e) => handleEmailChange(index, 'email', e.target.value)}
                    className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={email.primary || false}
                      onChange={(e) => handleEmailChange(index, 'primary', e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-600">Principal</span>
                  </label>
                  <button
                    onClick={() => handleRemoveEmail(index)}
                    className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {formData.emails.length === 0 && (
                <p className="text-xs text-gray-500 italic text-center py-2">Nenhum email adicionado</p>
              )}
            </div>
          </div>

          {/* Telefones */}
          <div className="pb-4 border-b-2 border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span>📱</span>
                Telefones
              </h4>
              <Button size="sm" onClick={handleAddPhone}>
                + Telefone
              </Button>
            </div>
            {errors.phones && <p className="text-sm text-red-500 mb-2">{errors.phones}</p>}
            <div className="space-y-2">
              {formData.phones.map((phone, index) => (
                <div key={index} className="flex gap-2 items-end bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={phone.phone}
                    onChange={(e) => handlePhoneChange(index, 'phone', e.target.value)}
                    className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={phone.hasWhatsapp || false}
                      onChange={(e) => handlePhoneChange(index, 'hasWhatsapp', e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-600">WhatsApp</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={phone.primary || false}
                      onChange={(e) => handlePhoneChange(index, 'primary', e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-600">Principal</span>
                  </label>
                  <button
                    onClick={() => handleRemovePhone(index)}
                    className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {formData.phones.length === 0 && (
                <p className="text-xs text-gray-500 italic text-center py-2">Nenhum telefone adicionado</p>
              )}
            </div>
          </div>

          {/* Redes Sociais */}
          <div className="pb-4 border-b-2 border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span>🌐</span>
                Redes Sociais
              </h4>
              <Button size="sm" onClick={handleAddSocialMedia}>
                + Rede Social
              </Button>
            </div>
            <div className="space-y-2">
              {formData.socialMedia.map((social, index) => (
                <div key={index} className="flex gap-2 items-end bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <select
                    value={social.platform}
                    onChange={(e) => handleSocialMediaChange(index, 'platform', e.target.value)}
                    className="w-40 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Twitter">Twitter</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Outro">Outro</option>
                  </select>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={social.url}
                    onChange={(e) => handleSocialMediaChange(index, 'url', e.target.value)}
                    className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleRemoveSocialMedia(index)}
                    className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {formData.socialMedia.length === 0 && (
                <p className="text-xs text-gray-500 italic text-center py-2">Nenhuma rede social adicionada</p>
              )}
            </div>
          </div>

          {/* Observações */}
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📝</span>
              Observações
            </h4>
            <textarea
              placeholder="Anotações sobre o cliente..."
              rows={4}
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-normal resize-none"
            />
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
};
