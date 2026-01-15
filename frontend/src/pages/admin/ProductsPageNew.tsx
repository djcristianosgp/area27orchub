import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@components/layout';
import { Button, Card, Input, Select, Modal, Badge } from '@components/ui';
import { PageHeader, SearchBar, EmptyState, Loading } from '@components/common';
import api from '@services/api';
import { Plus, Edit2, Trash2, Link as LinkIcon, DollarSign, Package } from 'lucide-react';
import type { Product, ProductVariation, Category, Brand, Group } from '@types/index';

export const ProductsPageNew: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Product Modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    brandId: '',
    groupId: '',
  });

  // Variation Modal
  const [variationModalOpen, setVariationModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingVariation, setEditingVariation] = useState<ProductVariation | null>(null);
  const [variationFormData, setVariationFormData] = useState({
    name: '',
    price: '',
    affiliateLink: '',
    observation: '',
  });

  // View Variations Modal
  const [viewVariationsModalOpen, setViewVariationsModalOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes, brandsRes, groupsRes] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getBrands(),
        api.getGroups(),
      ]);
      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
      setBrands(brandsRes.data || []);
      setGroups(groupsRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query)
      );
    }
    setFilteredProducts(filtered);
  };

  // ===== Product CRUD =====
  const validateProductForm = () => {
    const newErrors: Record<string, string> = {};
    if (!productFormData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!productFormData.categoryId) newErrors.categoryId = 'Categoria é obrigatória';
    if (!productFormData.brandId) newErrors.brandId = 'Marca é obrigatória';
    if (!productFormData.groupId) newErrors.groupId = 'Grupo é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    setProductFormData({
      name: '',
      description: '',
      categoryId: '',
      brandId: '',
      groupId: '',
    });
    setErrors({});
    setProductModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductFormData({
      name: product.name,
      description: product.description || '',
      categoryId: product.categoryId,
      brandId: product.brandId,
      groupId: product.groupId,
    });
    setErrors({});
    setProductModalOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!validateProductForm()) return;

    try {
      setSubmitLoading(true);
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productFormData);
      } else {
        await api.createProduct(productFormData);
      }
      setProductModalOpen(false);
      await loadData();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      setErrors({
        submit: error.response?.data?.message || 'Erro ao salvar produto',
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`Deseja realmente excluir o produto "${product.name}"?`)) return;

    try {
      await api.deleteProduct(product.id);
      await loadData();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      alert('Erro ao deletar produto');
    }
  };

  // ===== Variation CRUD =====
  const validateVariationForm = () => {
    const newErrors: Record<string, string> = {};
    if (!variationFormData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!variationFormData.price || parseFloat(variationFormData.price) <= 0)
      newErrors.price = 'Preço válido é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleViewVariations = (product: Product) => {
    setViewingProduct(product);
    setViewVariationsModalOpen(true);
  };

  const handleNewVariation = (product: Product) => {
    setSelectedProduct(product);
    setEditingVariation(null);
    setVariationFormData({
      name: '',
      price: '',
      affiliateLink: '',
      observation: '',
    });
    setErrors({});
    setVariationModalOpen(true);
  };

  const handleEditVariation = (product: Product, variation: ProductVariation) => {
    setSelectedProduct(product);
    setEditingVariation(variation);
    setVariationFormData({
      name: variation.name,
      price: variation.price.toString(),
      affiliateLink: variation.affiliateLink || '',
      observation: variation.observation || '',
    });
    setErrors({});
    setViewVariationsModalOpen(false);
    setVariationModalOpen(true);
  };

  const handleSaveVariation = async () => {
    if (!validateVariationForm() || !selectedProduct) return;

    try {
      setSubmitLoading(true);
      const data = {
        ...variationFormData,
        price: parseFloat(variationFormData.price),
      };

      if (editingVariation) {
        await api.updateProductVariation(selectedProduct.id, editingVariation.id, data);
      } else {
        await api.createProductVariation(selectedProduct.id, data);
      }
      setVariationModalOpen(false);
      await loadData();
      
      // Reopen view variations modal if it was open
      if (viewingProduct) {
        const updatedProduct = products.find(p => p.id === selectedProduct.id);
        if (updatedProduct) {
          setViewingProduct(updatedProduct);
          setViewVariationsModalOpen(true);
        }
      }
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      setErrors({
        submit: error.response?.data?.message || 'Erro ao salvar variação',
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteVariation = async (productId: string, variationId: string) => {
    if (!window.confirm('Deseja realmente excluir esta variação?')) return;

    try {
      await api.deleteProductVariation(productId, variationId);
      await loadData();
      
      // Update viewing product
      const updatedProduct = products.find(p => p.id === productId);
      if (updatedProduct && viewingProduct) {
        setViewingProduct(updatedProduct);
      }
    } catch (error) {
      console.error('Erro ao deletar:', error);
      alert('Erro ao deletar variação');
    }
  };

  const getCategoryName = (categoryId: string) =>
    categories.find((c) => c.id === categoryId)?.name || '-';
  const getBrandName = (brandId: string) =>
    brands.find((b) => b.id === brandId)?.name || '-';
  const getGroupName = (groupId: string) =>
    groups.find((g) => g.id === groupId)?.name || '-';

  if (loading) {
    return (
      <AdminLayout>
        <Loading message="Carregando produtos..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Produtos"
          subtitle="Gerencie produtos, categorias e variações"
          action={
            <Button onClick={handleNewProduct} icon={Plus}>
              Novo Produto
            </Button>
          }
        />

        {/* Search & Filters */}
        <Card>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar por nome ou descrição..."
          />
        </Card>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <EmptyState
            title="Nenhum produto encontrado"
            description={
              searchQuery
                ? 'Tente ajustar sua busca'
                : 'Clique em "Novo Produto" para começar'
            }
            icon={Package}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} hover className="relative">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="primary">{getCategoryName(product.categoryId)}</Badge>
                      <Badge variant="secondary">{getBrandName(product.brandId)}</Badge>
                      <Badge variant="secondary">{getGroupName(product.groupId)}</Badge>
                    </div>

                    {/* Variations count */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Package className="w-4 h-4" />
                      <span>
                        {product.variations?.length || 0} variação(ões)
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewVariations(product)}
                      className="flex-1"
                    >
                      Ver Variações
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                      icon={Edit2}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProduct(product)}
                      icon={Trash2}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Product Modal */}
        <Modal
          isOpen={productModalOpen}
          onClose={() => setProductModalOpen(false)}
          title={editingProduct ? 'Editar Produto' : 'Novo Produto'}
          footer={
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setProductModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveProduct} isLoading={submitLoading}>
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
                label="Nome do Produto"
                value={productFormData.name}
                onChange={(e) =>
                  setProductFormData({ ...productFormData, name: e.target.value })
                }
                error={errors.name}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descrição
              </label>
              <textarea
                value={productFormData.description}
                onChange={(e) =>
                  setProductFormData({ ...productFormData, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <Select
                label="Categoria"
                value={productFormData.categoryId}
                onChange={(e) =>
                  setProductFormData({ ...productFormData, categoryId: e.target.value })
                }
                error={errors.categoryId}
                required
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Select
                label="Marca"
                value={productFormData.brandId}
                onChange={(e) =>
                  setProductFormData({ ...productFormData, brandId: e.target.value })
                }
                error={errors.brandId}
                required
              >
                <option value="">Selecione uma marca</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Select
                label="Grupo"
                value={productFormData.groupId}
                onChange={(e) =>
                  setProductFormData({ ...productFormData, groupId: e.target.value })
                }
                error={errors.groupId}
                required
              >
                <option value="">Selecione um grupo</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </Modal>

        {/* View Variations Modal */}
        <Modal
          isOpen={viewVariationsModalOpen}
          onClose={() => setViewVariationsModalOpen(false)}
          title={`Variações de ${viewingProduct?.name}`}
          size="lg"
          footer={
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setViewVariationsModalOpen(false)}>
                Fechar
              </Button>
              {viewingProduct && (
                <Button onClick={() => handleNewVariation(viewingProduct)} icon={Plus}>
                  Nova Variação
                </Button>
              )}
            </div>
          }
        >
          {viewingProduct?.variations && viewingProduct.variations.length > 0 ? (
            <div className="space-y-3">
              {viewingProduct.variations.map((variation) => (
                <Card key={variation.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {variation.name}
                      </h4>
                      <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span>
                            R$ {variation.price.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        {variation.affiliateLink && (
                          <div className="flex items-center gap-2">
                            <LinkIcon className="w-4 h-4" />
                            <a
                              href={variation.affiliateLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:underline truncate"
                            >
                              Link de afiliado
                            </a>
                          </div>
                        )}
                        {variation.observation && (
                          <p className="mt-1 text-sm">{variation.observation}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditVariation(viewingProduct, variation)}
                        icon={Edit2}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteVariation(viewingProduct.id, variation.id)}
                        icon={Trash2}
                        className="text-red-600 hover:text-red-700"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nenhuma variação cadastrada"
              description="Adicione variações para este produto"
              icon={Package}
            />
          )}
        </Modal>

        {/* Variation Modal */}
        <Modal
          isOpen={variationModalOpen}
          onClose={() => setVariationModalOpen(false)}
          title={editingVariation ? 'Editar Variação' : 'Nova Variação'}
          footer={
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setVariationModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveVariation} isLoading={submitLoading}>
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
                label="Nome da Variação"
                value={variationFormData.name}
                onChange={(e) =>
                  setVariationFormData({ ...variationFormData, name: e.target.value })
                }
                error={errors.name}
                required
                placeholder="Ex: Modelo A, Cor Azul, Tamanho M"
              />
            </div>

            <div>
              <Input
                label="Preço"
                type="number"
                step="0.01"
                value={variationFormData.price}
                onChange={(e) =>
                  setVariationFormData({ ...variationFormData, price: e.target.value })
                }
                error={errors.price}
                required
                placeholder="0.00"
              />
            </div>

            <div>
              <Input
                label="Link de Afiliado"
                type="url"
                value={variationFormData.affiliateLink}
                onChange={(e) =>
                  setVariationFormData({
                    ...variationFormData,
                    affiliateLink: e.target.value,
                  })
                }
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Observação
              </label>
              <textarea
                value={variationFormData.observation}
                onChange={(e) =>
                  setVariationFormData({
                    ...variationFormData,
                    observation: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Informações adicionais sobre esta variação"
              />
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};
