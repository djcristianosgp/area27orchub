import React, { useState, useEffect } from 'react';
import { AdminLayout, Table, Modal, FormField, TextAreaField, Button, PageHeader, Card, Badge, EmptyState } from '@components/index';
import api from '@services/api';
import { Product, ProductVariation, Category, Brand, Group } from '@types/index';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [variationModalOpen, setVariationModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingVariation, setEditingVariation] = useState<ProductVariation | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    brandId: '',
    groupId: '',
  });
  const [variationData, setVariationData] = useState({
    name: '',
    price: '',
    affiliateLink: '',
    observation: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

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

  const validateProductForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.categoryId) newErrors.categoryId = 'Categoria é obrigatória';
    if (!formData.brandId) newErrors.brandId = 'Marca é obrigatória';
    if (!formData.groupId) newErrors.groupId = 'Grupo é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateVariationForm = () => {
    const newErrors: Record<string, string> = {};
    if (!variationData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!variationData.price || parseFloat(variationData.price) <= 0)
      newErrors.price = 'Preço válido é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', categoryId: '', brandId: '', groupId: '' });
    setErrors({});
    setModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      categoryId: product.categoryId,
      brandId: product.brandId,
      groupId: product.groupId,
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!validateProductForm()) return;

    try {
      setSubmitLoading(true);
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData);
      } else {
        await api.createProduct({ ...formData, variations: [] });
      }
      setModalOpen(false);
      await loadData();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setErrors({ submit: 'Erro ao salvar produto' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`Tem certeza que deseja deletar "${product.name}"?`)) return;

    try {
      await api.deleteProduct(product.id);
      await loadData();
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  const handleNewVariation = (product: Product) => {
    setSelectedProduct(product);
    setEditingVariation(null);
    setVariationData({ name: '', price: '', affiliateLink: '', observation: '' });
    setErrors({});
    setVariationModalOpen(true);
  };

  const handleEditVariation = (product: Product, variation: ProductVariation) => {
    setSelectedProduct(product);
    setEditingVariation(variation);
    setVariationData({
      name: variation.name,
      price: variation.price.toString(),
      affiliateLink: variation.affiliateLink || '',
      observation: variation.observation || '',
    });
    setErrors({});
    setVariationModalOpen(true);
  };

  const handleSaveVariation = async () => {
    if (!validateVariationForm() || !selectedProduct) return;

    try {
      setSubmitLoading(true);
      if (editingVariation) {
        // Update endpoint would need to be added
        console.log('Update variation not yet implemented');
      } else {
        await api.createProductVariation(selectedProduct.id, {
          ...variationData,
          price: parseFloat(variationData.price),
        });
      }
      setVariationModalOpen(false);
      await loadData();
    } catch (error) {
      console.error('Erro ao salvar variação:', error);
      setErrors({ submit: 'Erro ao salvar variação' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteVariation = async (product: Product, variation: ProductVariation) => {
    if (!window.confirm(`Tem certeza que deseja deletar a variação "${variation.name}"?`)) return;

    try {
      // Delete endpoint would need to be added
      console.log('Delete variation not yet implemented');
      await loadData();
    } catch (error) {
      console.error('Erro ao deletar variação:', error);
    }
  };

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'N/A';
  const getBrandName = (id: string) => brands.find(b => b.id === id)?.name || 'N/A';
  const getGroupName = (id: string) => groups.find(g => g.id === id)?.name || 'N/A';

  const columns = [
    { key: 'name', label: 'Nome' },
    {
      key: 'categoryId',
      label: 'Categoria',
      render: (value: string) => getCategoryName(value),
    },
    {
      key: 'brandId',
      label: 'Marca',
      render: (value: string) => getBrandName(value),
    },
    {
      key: 'groupId',
      label: 'Grupo',
      render: (value: string) => getGroupName(value),
    },
    {
      key: 'variations',
      label: 'Variações',
      render: (value: ProductVariation[]) => value?.length || 0,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Gerenciar Produtos</h3>
            <p className="text-gray-600">Total: {products.length} produto(s)</p>
          </div>
          <Button icon="+" onClick={handleNewProduct} size="lg">
            Novo Produto
          </Button>
        </div>

        <Table
          columns={columns}
          data={products}
          loading={loading}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
        />

        {/* Expandir variações */}
        <div className="mt-8">
          <h4 className="text-lg font-bold text-gray-800 mb-4">Variações dos Produtos</h4>
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-semibold text-gray-700">{product.name}</h5>
                  <Button
                    icon="+"
                    size="sm"
                    onClick={() => handleNewVariation(product)}
                  >
                    Variação
                  </Button>
                </div>
                <div className="space-y-2">
                  {product.variations?.map((variation) => (
                    <div
                      key={variation.id}
                      className="flex justify-between items-center bg-gray-50 p-3 rounded"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-700">{variation.name}</p>
                        <p className="text-sm text-gray-500">R$ {variation.price.toFixed(2)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleEditVariation(product, variation)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteVariation(product, variation)}
                        >
                          Deletar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Produto */}
      <Modal
        isOpen={modalOpen}
        title={editingProduct ? 'Editar Produto' : 'Novo Produto'}
        onClose={() => setModalOpen(false)}
        actions={[
          { label: 'Cancelar', onClick: () => setModalOpen(false), variant: 'secondary' },
          {
            label: editingProduct ? 'Atualizar' : 'Criar',
            onClick: handleSaveProduct,
            variant: 'primary',
            loading: submitLoading,
          },
        ]}
      >
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{errors.submit}</div>
        )}
        <FormField
          label="Nome"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          required
        />
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.categoryId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Marca <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.brandId}
            onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.brandId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Selecione uma marca</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
          {errors.brandId && <p className="text-red-500 text-sm mt-1">{errors.brandId}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Grupo <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.groupId}
            onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.groupId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Selecione um grupo</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          {errors.groupId && <p className="text-red-500 text-sm mt-1">{errors.groupId}</p>}
        </div>
        <TextAreaField
          label="Descrição"
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </Modal>

      {/* Modal de Variação */}
      <Modal
        isOpen={variationModalOpen}
        title={editingVariation ? 'Editar Variação' : 'Nova Variação'}
        onClose={() => setVariationModalOpen(false)}
        actions={[
          { label: 'Cancelar', onClick: () => setVariationModalOpen(false), variant: 'secondary' },
          {
            label: editingVariation ? 'Atualizar' : 'Criar',
            onClick: handleSaveVariation,
            variant: 'primary',
            loading: submitLoading,
          },
        ]}
      >
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{errors.submit}</div>
        )}
        <FormField
          label="Nome da Variação"
          value={variationData.name}
          onChange={(e) => setVariationData({ ...variationData, name: e.target.value })}
          error={errors.name}
          required
        />
        <FormField
          label="Preço"
          type="number"
          step="0.01"
          min="0"
          value={variationData.price}
          onChange={(e) => setVariationData({ ...variationData, price: e.target.value })}
          error={errors.price}
          required
        />
        <FormField
          label="Link de Afiliado"
          type="url"
          value={variationData.affiliateLink}
          onChange={(e) => setVariationData({ ...variationData, affiliateLink: e.target.value })}
          placeholder="https://amazon.com.br/..."
        />
        <TextAreaField
          label="Observação"
          rows={3}
          value={variationData.observation}
          onChange={(e) => setVariationData({ ...variationData, observation: e.target.value })}
        />
      </Modal>
    </AdminLayout>
  );
};
