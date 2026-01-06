import React, { useState, useEffect } from 'react';
import { AdminLayout, Modal, FormField, SelectField, Button, PageHeader, Card, EmptyState } from '@components/index';
import api from '@services/api';
import { Coupon } from '@types/index';

const PLATFORMS = [
  { value: 'Amazon', label: 'Amazon' },
  { value: 'Mercado Livre', label: 'Mercado Livre' },
  { value: 'AliExpress', label: 'AliExpress' },
  { value: 'eBay', label: 'eBay' },
  { value: 'Shopee', label: 'Shopee' },
  { value: 'Outro', label: 'Outro' },
];

export const CouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    platform: '',
    code: '',
    affiliateLink: '',
    validUntil: '',
    active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const response = await api.getCoupons();
      setCoupons(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar cupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Título é obrigatório';
    if (!formData.platform) newErrors.platform = 'Plataforma é obrigatória';
    if (!formData.code.trim()) newErrors.code = 'Código é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNew = () => {
    setEditingCoupon(null);
    setFormData({
      title: '',
      description: '',
      platform: '',
      code: '',
      affiliateLink: '',
      validUntil: '',
      active: true,
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      title: coupon.title,
      description: coupon.description || '',
      platform: coupon.platform,
      code: coupon.code,
      affiliateLink: coupon.affiliateLink || '',
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
      active: coupon.active,
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSubmitLoading(true);
      const dataToSend = {
        ...formData,
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
      };

      if (editingCoupon) {
        await api.updateCoupon(editingCoupon.id, dataToSend);
      } else {
        await api.createCoupon(dataToSend);
      }
      setModalOpen(false);
      await loadCoupons();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setErrors({ submit: 'Erro ao salvar cupom' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    if (!window.confirm(`Tem certeza que deseja deletar o cupom "${coupon.title}"?`)) return;

    try {
      await api.deleteCoupon(coupon.id);
      await loadCoupons();
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  const columns = [
    { key: 'title', label: 'Título' },
    { key: 'platform', label: 'Plataforma' },
    { key: 'code', label: 'Código' },
    {
      key: 'active',
      label: 'Status',
      render: (value: boolean) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {value ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
    {
      key: 'validUntil',
      label: 'Válido até',
      render: (value: string) => value ? new Date(value).toLocaleDateString('pt-BR') : 'Sem limite',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          emoji="🎟️"
          title="Gerenciar Cupons"
          description={`${coupons.length} cupom(ns) cadastrado(s)`}
          actions={
            <Button icon="+" onClick={handleNew} size="lg">
              Novo Cupom
            </Button>
          }
        />

        <Card>
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Carregando cupons...</p>
              </div>
            </div>
          ) : coupons.length === 0 ? (
            <EmptyState
              emoji="🎟️"
              title="Nenhum cupom encontrado"
              description="Comece criando seu primeiro cupom de desconto"
              action={
                <Button icon="+" onClick={handleNew}>
                  Criar Primeiro Cupom
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
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50 transition">
                      {columns.map((col) => (
                        <td key={col.key} className="px-6 py-4">
                          {col.render ? col.render(coupon[col.key as keyof typeof coupon]) : coupon[col.key as keyof typeof coupon]?.toString() || '-'}
                        </td>
                      ))}
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(coupon)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-xs font-medium transition"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleDelete(coupon)}
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
        title={editingCoupon ? '✏️ Editar Cupom' : '➕ Novo Cupom'}
        onClose={() => setModalOpen(false)}
        actions={[
          { label: 'Cancelar', onClick: () => setModalOpen(false), variant: 'secondary' },
          {
            label: editingCoupon ? 'Atualizar Cupom' : 'Criar Cupom',
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
          label="Título"
          placeholder="Ex: 20% de desconto em eletrônicos"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          error={errors.title}
          required
        />
        <FormField
          label="Código"
          placeholder="Ex: PROMO20"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          error={errors.code}
          required
        />
        <SelectField
          label="Plataforma"
          options={PLATFORMS}
          value={formData.platform}
          onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
          error={errors.platform}
          required
        />

        <FormField
          label="Descrição"
          placeholder="Detalhes sobre o cupom"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        <FormField
          label="Link de Afiliado"
          type="url"
          placeholder="https://..."
          value={formData.affiliateLink}
          onChange={(e) => setFormData({ ...formData, affiliateLink: e.target.value })}
        />
        <FormField
          label="Válido até"
          type="date"
          value={formData.validUntil}
          onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
        />
        <div className="mb-5">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-5 h-5 rounded border-2 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
              />
            </div>
            <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition">
              {formData.active ? '✅ Cupom ativo' : '⚪ Cupom inativo'}
            </span>
          </label>
        </div>
      </Modal>
    </AdminLayout>
  );
};
