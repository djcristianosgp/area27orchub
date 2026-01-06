import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@services/api';
import { Coupon } from '@types/index';

export const CouponsPublicPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const response = await api.getCoupons(true);
      setCoupons(response.data);
    } catch (error) {
      console.error('Erro ao carregar cupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const platforms = Array.from(new Set(coupons.map((c) => c.platform)));
  const filteredCoupons = selectedPlatform
    ? coupons.filter((c) => c.platform === selectedPlatform)
    : coupons;

  const isExpired = (date: Date) => new Date(date) < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
            <span>🌐</span>
            <span>Budget Hub</span>
          </Link>
          <div className="flex gap-6">
            <Link 
              to="/coupons" 
              className="text-blue-600 font-semibold flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg"
            >
              <span>🎟️</span>
              <span>Cupons</span>
            </Link>
            <Link 
              to="/marketplace" 
              className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition"
            >
              <span>🛍️</span>
              <span>Marketplace</span>
            </Link>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <span>🎟️</span>
            <span>Cupons de Desconto</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Economize agora! Encontre os melhores cupons e promoções exclusivas
          </p>
        </div>

        {/* Filters */}
        <div className="mb-10">
          <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Filtrar por plataforma</p>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setSelectedPlatform(null)}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                selectedPlatform === null
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-500'
              }`}
            >
              🌟 Todos
            </button>
            {platforms.map((platform) => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                  selectedPlatform === platform
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-500'
                }`}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>

        {/* Coupons Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Carregando cupons incríveis...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCoupons.map((coupon) => (
              <div
                key={coupon.id}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                      {coupon.platform}
                    </span>
                    {isExpired(coupon.validUntil) ? (
                      <span className="text-xs font-bold px-3 py-1 bg-red-500 rounded-full">
                        ❌ Expirado
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-3 py-1 bg-green-500 rounded-full">
                        ✅ Ativo
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition">
                    {coupon.title}
                  </h3>

                  {coupon.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{coupon.description}</p>
                  )}

                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl mb-4 border-2 border-dashed border-gray-300">
                    <p className="text-xs text-gray-500 mb-1 font-semibold uppercase">Código do Cupom</p>
                    <p className="text-2xl font-bold text-gray-900 tracking-wider font-mono">{coupon.code}</p>
                  </div>

                  {!isExpired(coupon.validUntil) && (
                    <div className="text-xs text-gray-500 mb-4 flex items-center gap-2">
                      <span>📅</span>
                      <span>Válido até: {new Date(coupon.validUntil).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}

                  {isExpired(coupon.validUntil) ? (
                    <div className="w-full bg-gray-300 text-gray-600 font-semibold py-3 px-4 rounded-xl text-center cursor-not-allowed">
                      Cupom Expirado
                    </div>
                  ) : (
                    <a
                      href={coupon.affiliateLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-xl block text-center transform hover:scale-105"
                    >
                      🛒 Usar Cupom Agora
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredCoupons.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Nenhum cupom disponível</h3>
            <p className="text-gray-600">Volte em breve para novas ofertas!</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-600 text-sm">
          <p>Powered by <strong className="text-blue-600">Budget Hub</strong> - Sistema de Orçamentos Virtuais</p>
        </div>
      </footer>
    </div>
  );
};
