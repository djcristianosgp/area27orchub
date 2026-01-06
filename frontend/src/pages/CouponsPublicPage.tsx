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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            OrçHub
          </Link>
          <div className="space-x-4">
            <Link to="/coupons" className="text-blue-600 font-semibold">
              Cupons
            </Link>
            <Link to="/marketplace" className="text-gray-600 hover:text-gray-800">
              Marketplace
            </Link>
          </div>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-12">Cupons de Desconto</h1>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedPlatform(null)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                selectedPlatform === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-600'
              }`}
            >
              Todos
            </button>
            {platforms.map((platform) => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  selectedPlatform === platform
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-600'
                }`}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>

        {/* Coupons Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Carregando cupons...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoupons.map((coupon) => (
              <div
                key={coupon.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex-1">
                      {coupon.title}
                    </h3>
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold ml-2">
                      {coupon.platform}
                    </span>
                  </div>

                  {coupon.description && (
                    <p className="text-gray-600 text-sm mb-4">{coupon.description}</p>
                  )}

                  <div className="bg-gray-100 p-3 rounded mb-4">
                    <p className="text-xs text-gray-500 mb-1">Código do Cupom:</p>
                    <p className="text-xl font-bold text-gray-800">{coupon.code}</p>
                  </div>

                  {isExpired(coupon.validUntil) ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded mb-4">
                      Cupom expirado
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 mb-4">
                      Válido até: {new Date(coupon.validUntil).toLocaleDateString('pt-BR')}
                    </div>
                  )}

                  <a
                    href={coupon.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition block text-center"
                  >
                    Ir para Oferta
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredCoupons.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum cupom disponível</p>
          </div>
        )}
      </main>
    </div>
  );
};
