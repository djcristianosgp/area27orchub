import React, { useState, useEffect } from 'react';
import { AdminLayout, Table, Modal, FormField, Button } from '@components/index';
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
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Gerenciar Cupons</h3>
            <p className="text-gray-600">Total: {coupons.length} cupom(ns)</p>
          </div>
          <Button icon="+" onClick={handleNew} size="lg">
            Novo Cupom
          </Button>
        </div>

        <Table
          columns={columns}
          data={coupons}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Modal de Criação/Edição */}
      <Modal
        isOpen={modalOpen}
        title={editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}
        onClose={() => setModalOpen(false)}
        actions={[
          { label: 'Cancelar', onClick: () => setModalOpen(false), variant: 'secondary' },
          {
            label: editingCoupon ? 'Atualizar' : 'Criar',
            onClick: handleSave,
            variant: 'primary',
            loading: submitLoading,
          },
        ]}
      >
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{errors.submit}</div>
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
        <select
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition mb-4 ${
            errors.platform ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
          }`}
          value={formData.platform}
          onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
          required
        >
          <option value="">Selecione a plataforma</option>
          {PLATFORMS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        {errors.platform && <p className="mb-4 text-sm text-red-500">{errors.platform}</p>}

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
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Cupom ativo</span>
          </label>
        </div>
      </Modal>
    </AdminLayout>
  );
};
