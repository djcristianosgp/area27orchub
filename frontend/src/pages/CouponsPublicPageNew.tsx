import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@components/ui';
import { SearchBar, Loading, PageHeader, EmptyState } from '@components/common';
import { CouponCard } from '@components/features';
import api from '@services/api';
import { ShoppingCart, Tag } from 'lucide-react';
import type { Coupon } from '@types/index';

export const CouponsPublicPageNew: React.FC = () => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  useEffect(() => {
    loadCoupons();
  }, []);

  useEffect(() => {
    filterCoupons();
  }, [coupons, searchQuery, selectedPlatform]);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const response = await api.getCoupons(true);
      setCoupons(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar cupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCoupons = () => {
    let filtered = coupons.filter((c) => !isExpired(c.expiryDate));

    if (selectedPlatform !== 'all') {
      filtered = filtered.filter((c) => c.platform === selectedPlatform);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title?.toLowerCase().includes(query) ||
          c.code?.toLowerCase().includes(query) ||
          c.platform?.toLowerCase().includes(query)
      );
    }

    setFilteredCoupons(filtered);
  };

  const isExpired = (date: string | undefined) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const platforms = Array.from(new Set(coupons.map((c) => c.platform)));

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Código copiado: ' + code);
  };

  if (loading) {
    return <Loading message="Carregando cupons..." />;
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-secondary-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">OH</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-secondary-900">OrçHub</h1>
              <p className="text-xs text-secondary-500">Cupons & Marketplace</p>
            </div>
          </div>
          <div className="flex gap-3">
            <a
              href="/products"
              className="flex items-center gap-2 px-4 py-2 text-secondary-700 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden sm:inline">Marketplace</span>
            </a>
            <Button variant="primary" size="sm" onClick={() => navigate('/login')}>
              Login Administrativo
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
          {/* Page Header */}
          <div className="text-center space-y-4 py-8">
            <h1 className="text-4xl md:text-5xl font-bold text-secondary-900">
              Cupons de Desconto
            </h1>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              Encontre os melhores cupons e códigos de desconto para suas compras
            </p>
          </div>

          {/* Filters */}
          <div className="space-y-4 bg-white p-6 rounded-2xl border border-secondary-200 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <SearchBar
                  onSearch={setSearchQuery}
                  placeholder="Pesquisar cupons, código ou plataforma..."
                />
              </div>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="input-base px-4 py-2"
              >
                <option value="all">Todas as plataformas</option>
                {platforms.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Content */}
          {filteredCoupons.length === 0 ? (
            <EmptyState
              icon={<Tag className="h-16 w-16" />}
              title="Nenhum cupom encontrado"
              description="Tente ajustar seus filtros de pesquisa ou volte mais tarde para verificar novos cupons"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCoupons.map((coupon) => (
                <CouponCard
                  key={coupon.id}
                  id={coupon.id}
                  title={coupon.title}
                  description={coupon.description}
                  code={coupon.code}
                  platform={coupon.platform}
                  expiryDate={coupon.expiryDate}
                  isActive={!isExpired(coupon.expiryDate)}
                  onCopy={() => handleCopyCoupon(coupon.code)}
                  onVisit={
                    coupon.affiliateLink
                      ? () => window.open(coupon.affiliateLink, '_blank')
                      : undefined
                  }
                />
              ))}
            </div>
          )}

          {/* Info Section */}
          <div className="mt-16 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl border border-primary-200 p-8 text-center">
            <h2 className="text-2xl font-bold text-secondary-900 mb-3">
              Mais de {filteredCoupons.length} Cupons Disponíveis
            </h2>
            <p className="text-secondary-600 max-w-2xl mx-auto">
              Economize em compras em suas plataformas favoritas. Cupons atualizados regularmente!
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-secondary-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-secondary-600 text-sm">
          <p>© 2025 OrçHub. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};
