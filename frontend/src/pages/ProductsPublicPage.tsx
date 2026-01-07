import React, { useEffect, useMemo, useState } from 'react';
import api from '@services/api';
import { Product, Category, Brand, Group } from '@types/index';
import { Link } from 'react-router-dom';

export const ProductsPublicPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [filters, setFilters] = useState<{ categoryId?: string; brandId?: string; groupId?: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // SEO básico: título e metas
    document.title = 'Produtos | Area27 Hub';
    const desc = 'Marketplace de produtos com variações, filtros e links de afiliados. Encontre o menor preço e compre agora.';
    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = desc;

    let metaOgTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
    if (!metaOgTitle) {
      metaOgTitle = document.createElement('meta');
      metaOgTitle.setAttribute('property', 'og:title');
      document.head.appendChild(metaOgTitle);
    }
    metaOgTitle.content = 'Produtos | Area27 Hub';

    let metaOgDesc = document.querySelector('meta[property="og:description"]') as HTMLMetaElement | null;
    if (!metaOgDesc) {
      metaOgDesc = document.createElement('meta');
      metaOgDesc.setAttribute('property', 'og:description');
      document.head.appendChild(metaOgDesc);
    }
    metaOgDesc.content = desc;

    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.rel = 'canonical';
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.href = `${window.location.origin}/products`;

    const loadFilters = async () => {
      try {
        const [catRes, brandRes, groupRes] = await Promise.all([
          api.getCategories(),
          api.getBrands(),
          api.getGroups(),
        ]);
        setCategories(catRes.data || []);
        setBrands(brandRes.data || []);
        setGroups(groupRes.data || []);
      } catch (error) {
        console.error('Erro ao carregar filtros:', error);
      }
    };
    loadFilters();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const res = await api.getProducts();
        setProducts(res.data || []);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (filters.categoryId && p.categoryId !== filters.categoryId) return false;
      if (filters.brandId && p.brandId !== filters.brandId) return false;
      if (filters.groupId && p.groupId !== filters.groupId) return false;
      return true;
    });
  }, [products, filters]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const getMinVariation = (product: Product) => {
    const vars = product.variations || [];
    if (vars.length === 0) return null;
    return vars.reduce((min, v) => (v.price < (min?.price ?? Infinity) ? v : min), vars[0]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-gray-900">Area27 Hub</Link>
          <nav className="flex gap-4 text-sm">
            <Link className="text-gray-600 hover:text-gray-900" to="/coupons">Cupons</Link>
            <Link className="text-gray-600 hover:text-gray-900" to="/invoices/demo-public">Orçamentos</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filtros */}
          <aside className="lg:w-64 bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Filtros</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Categoria</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={filters.categoryId || ''}
                  onChange={(e) => setFilters((f) => ({ ...f, categoryId: e.target.value || undefined }))}
                >
                  <option value="">Todas</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Marca</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={filters.brandId || ''}
                  onChange={(e) => setFilters((f) => ({ ...f, brandId: e.target.value || undefined }))}
                >
                  <option value="">Todas</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Grupo</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={filters.groupId || ''}
                  onChange={(e) => setFilters((f) => ({ ...f, groupId: e.target.value || undefined }))}
                >
                  <option value="">Todos</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* Lista de produtos */}
          <section className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full text-center py-12 text-gray-600">Carregando produtos...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-600">Nenhum produto encontrado</div>
              ) : (
                filteredProducts.map((p) => {
                  const minVar = getMinVariation(p);
                  return (
                    <div key={p.id} className="bg-white rounded-lg shadow hover:shadow-md transition">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-full h-40 object-cover rounded-t" />
                      ) : (
                        <div className="w-full h-40 bg-gray-100 rounded-t flex items-center justify-center text-gray-400">Sem imagem</div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 truncate">{p.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{p.description || 'Produto sem descrição'}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900">
                            {minVar ? formatCurrency(minVar.price) : 'Preço indisponível'}
                          </span>
                          {minVar?.affiliateLink ? (
                            <a
                              href={minVar.affiliateLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded"
                            >
                              Comprar
                            </a>
                          ) : (
                            <button className="px-3 py-2 bg-gray-200 text-gray-600 text-sm rounded cursor-not-allowed">
                              Indisponível
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
