import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@components/layout';
import { Button, Card, Input, Modal, Badge, Select } from '@components/ui';
import { PageHeader, SearchBar, EmptyState, Loading } from '@components/common';
import api from '@services/api';
import { Plus, Edit2, Trash2, Tag, ExternalLink, Calendar, ToggleLeft, ToggleRight } from 'lucide-react';
import type { Coupon } from '@types/index';

const PLATFORMS = [
  { value: 'Amazon', label: 'Amazon' },
  { value: 'Mercado Livre', label: 'Mercado Livre' },
  { value: 'AliExpress', label: 'AliExpress' },
  { value: 'Shopee', label: 'Shopee' },
  { value: 'Magalu', label: 'Magazine Luiza' },
  { value: 'Outro', label: 'Outro' },
];

export const CouponsPageNew: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    platform: '',
    affiliateLink: '',
    validUntil: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    loadCoupons();
  }, []);

  useEffect(() => {
    filterCoupons();
  }, [coupons, searchQuery, filterStatus]);

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

  const filterCoupons = () => {
    let filtered = coupons;

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (coupon) =>
          coupon.title?.toLowerCase().includes(query) ||
          coupon.code?.toLowerCase().includes(query) ||
          coupon.platform?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((coupon) =>
        filterStatus === 'active' ? coupon.isActive : !coupon.isActive
      );
    }

    setFilteredCoupons(filtered);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Título é obrigatório';
    if (!formData.code.trim()) newErrors.code = 'Código é obrigatório';
    if (!formData.platform) newErrors.platform = 'Plataforma é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNew = () => {
    setEditingCoupon(null);
    setFormData({
      title: '',
      description: '',
      code: '',
      platform: '',
      affiliateLink: '',
      validUntil: '',
      isActive: true,
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      title: coupon.title,
      description: coupon.description || '',
      code: coupon.code,
      platform: coupon.platform,
      affiliateLink: coupon.affiliateLink || '',
      validUntil: coupon.validUntil ? coupon.validUntil.split('T')[0] : '',
      isActive: coupon.isActive,
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSubmitLoading(true);
      const data = {
        ...formData,
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : undefined,
      };

      if (editingCoupon) {
        await api.updateCoupon(editingCoupon.id, data);
      } else {
        await api.createCoupon(data);
      }
      setModalOpen(false);
      await loadCoupons();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      setErrors({
        submit: error.response?.data?.message || 'Erro ao salvar cupom',
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    if (!window.confirm(`Deseja realmente excluir o cupom "${coupon.code}"?`)) return;

    try {
      await api.deleteCoupon(coupon.id);
      await loadCoupons();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      alert('Erro ao deletar cupom');
    }
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      await api.updateCoupon(coupon.id, { isActive: !coupon.isActive });
      await loadCoupons();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do cupom');
    }
  };

  const isExpired = (validUntil: string | null) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  if (loading) {
    return (
      <AdminLayout>
        <Loading message="Carregando cupons..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Cupons de Desconto"
          subtitle="Gerencie cupons de desconto para divulgação"
          action={
            <Button onClick={handleNew} icon={Plus}>
              Novo Cupom
            </Button>
          }
        />

        {/* Filters */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Buscar por título, código ou plataforma..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                Todos
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('active')}
                size="sm"
              >
                Ativos
              </Button>
              <Button
                variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('inactive')}
                size="sm"
              >
                Inativos
              </Button>
            </div>
          </div>
        </Card>

        {/* Coupons List */}
        {filteredCoupons.length === 0 ? (
          <EmptyState
            title="Nenhum cupom encontrado"
            description={
              searchQuery || filterStatus !== 'all'
                ? 'Tente ajustar seus filtros'
                : 'Clique em "Novo Cupom" para começar'
            }
            icon={Tag}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredCoupons.map((coupon) => (
              <Card key={coupon.id} hover>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-3">
                      <Tag className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {coupon.title}
                        </h3>
                        {coupon.description && (
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {coupon.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 ml-8">
                      <Badge
                        variant="secondary"
                        className="font-mono text-sm px-3 py-1"
                      >
                        {coupon.code}
                      </Badge>
                      <Badge variant="outline">{coupon.platform}</Badge>
                      {coupon.validUntil && (
                        <Badge
                          variant={isExpired(coupon.validUntil) ? 'destructive' : 'default'}
                        >
                          <Calendar className="w-3 h-3 mr-1" />
                          {isExpired(coupon.validUntil)
                            ? 'Expirado'
                            : `Válido até ${new Date(coupon.validUntil).toLocaleDateString(
                                'pt-BR'
                              )}`}
                        </Badge>
                      )}
                      {coupon.isActive ? (
                        <Badge variant="success">Ativo</Badge>
                      ) : (
                        <Badge variant="secondary">Inativo</Badge>
                      )}
                    </div>

                    {/* Affiliate Link */}
                    {coupon.affiliateLink && (
                      <div className="ml-8">
                        <a
                          href={coupon.affiliateLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Ver link de afiliado
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Right Section - Actions */}
                  <div className="flex items-center gap-2 ml-8 md:ml-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(coupon)}
                      title={coupon.isActive ? 'Desativar' : 'Ativar'}
                    >
                      {coupon.isActive ? (
                        <ToggleRight className="w-5 h-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-gray-400" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(coupon)}
                      icon={Edit2}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(coupon)}
                      icon={Trash2}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}
          size="lg"
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
                label="Título do Cupom"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                error={errors.title}
                required
                placeholder="Ex: 20% OFF em Eletrônicos"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Detalhes sobre o cupom e condições de uso"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Código do Cupom"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  error={errors.code}
                  required
                  placeholder="CUPOM2024"
                  className="font-mono"
                />
              </div>

              <div>
                <Select
                  label="Plataforma"
                  value={formData.platform}
                  onChange={(value) => setFormData({ ...formData, platform: value })}
                  options={PLATFORMS}
                  error={errors.platform}
                  required
                />
              </div>
            </div>

            <div>
              <Input
                label="Link de Afiliado"
                value={formData.affiliateLink}
                onChange={(e) =>
                  setFormData({ ...formData, affiliateLink: e.target.value })
                }
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Válido Até"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                />
              </div>

              <div className="flex items-center pt-8">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Cupom Ativo
                  </span>
                </label>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};
