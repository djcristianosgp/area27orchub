import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@components/ui';
import { SearchBar, Loading, EmptyState } from '@components/common';
import { ProductMarketplaceCard } from '@components/features';
import api from '@services/api';
import { ShoppingCart, Tag, LogIn } from 'lucide-react';
import type { Product } from '@types/index';

export const ProductsPublicPageNew: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory, selectedBrand]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.getProducts();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (p) => p.category?.id === selectedCategory || p.category?.name === selectedCategory
      );
    }

    if (selectedBrand !== 'all') {
      filtered = filtered.filter(
        (p) => p.brand?.id === selectedBrand || p.brand?.name === selectedBrand
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  };

  const categories = Array.from(
    new Map(products.map((p) => [p.category?.id, p.category])).values()
  ).filter(Boolean);

  const brands = Array.from(
    new Map(products.map((p) => [p.brand?.id, p.brand])).values()
  ).filter(Boolean);

  if (loading) {
    return <Loading message="Carregando produtos..." />;
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
              <p className="text-xs text-secondary-500">Marketplace & Afiliados</p>
            </div>
          </div>
          <div className="flex gap-3">
            <a
              href="/coupons"
              className="flex items-center gap-2 px-4 py-2 text-secondary-700 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              <Tag className="h-5 w-5" />
              <span className="hidden sm:inline">Cupons</span>
            </a>
            <Button variant="primary" size="sm" onClick={() => navigate('/login')}>
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Login</span>
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
              Marketplace de Produtos
            </h1>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              Produtos curados com os melhores preços e links de afiliados
            </p>
          </div>

          {/* Filters */}
          <div className="space-y-4 bg-white p-6 rounded-2xl border border-secondary-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <SearchBar
                  onSearch={setSearchQuery}
                  placeholder="Pesquisar produtos..."
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-base px-4 py-2"
              >
                <option value="all">Todas as categorias</option>
                {categories.map((cat: any) => (
                  <option key={cat?.id} value={cat?.id || cat?.name}>
                    {cat?.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="input-base px-4 py-2"
              >
                <option value="all">Todas as marcas</option>
                {brands.map((brand: any) => (
                  <option key={brand?.id} value={brand?.id || brand?.name}>
                    {brand?.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-secondary-900">
              {filteredProducts.length} produtos encontrados
            </h2>
          </div>

          {/* Content */}
          {filteredProducts.length === 0 ? (
            <EmptyState
              icon={<ShoppingCart className="h-16 w-16" />}
              title="Nenhum produto encontrado"
              description="Tente ajustar seus filtros de pesquisa para encontrar o que procura"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const lowestPrice =
                  product.productVariations && product.productVariations.length > 0
                    ? Math.min(...product.productVariations.map((v: any) => v.price || 0))
                    : 0;

                return (
                  <ProductMarketplaceCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    description={product.description}
                    image={product.image}
                    category={product.category?.name || 'Sem categoria'}
                    brand={product.brand?.name || 'Sem marca'}
                    lowestPrice={lowestPrice}
                    variations={
                      product.productVariations?.map((v: any) => ({
                        id: v.id,
                        name: v.name,
                        price: v.price,
                        affiliateLink: v.affiliateLink || '#',
                      })) || []
                    }
                  />
                );
              })}
            </div>
          )}

          {/* Info Section */}
          <div className="mt-16 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl border border-primary-200 p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="font-bold text-secondary-900 mb-2">Melhor Preço</h3>
                <p className="text-sm text-secondary-600">
                  Comparamos os melhores preços entre plataformas
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🔗</div>
                <h3 className="font-bold text-secondary-900 mb-2">Links Seguros</h3>
                <p className="text-sm text-secondary-600">
                  Links de afiliados diretos e confiáveis
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">💰</div>
                <h3 className="font-bold text-secondary-900 mb-2">Cashback</h3>
                <p className="text-sm text-secondary-600">
                  Ganhe cashback em suas compras
                </p>
              </div>
            </div>
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
