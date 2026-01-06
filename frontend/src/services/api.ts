import axios, { AxiosInstance } from 'axios';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
      timeout: 10000,
    });

    // Add token to every request
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Auth endpoints
  async register(email: string, name: string, password: string) {
    return this.client.post('/auth/register', { email, name, password });
  }

  async login(email: string, password: string) {
    return this.client.post('/auth/login', { email, password });
  }

  // Clients endpoints
  async createClient(data: any) {
    return this.client.post('/clients', data);
  }

  async getClients() {
    return this.client.get('/clients');
  }

  async getClient(id: string) {
    return this.client.get(`/clients/${id}`);
  }

  async updateClient(id: string, data: any) {
    return this.client.patch(`/clients/${id}`, data);
  }

  async deleteClient(id: string) {
    return this.client.delete(`/clients/${id}`);
  }

  // Categories endpoints
  async createCategory(data: any) {
    return this.client.post('/categories', data);
  }

  async getCategories() {
    return this.client.get('/categories');
  }

  async getCategory(id: string) {
    return this.client.get(`/categories/${id}`);
  }

  async updateCategory(id: string, data: any) {
    return this.client.patch(`/categories/${id}`, data);
  }

  async deleteCategory(id: string) {
    return this.client.delete(`/categories/${id}`);
  }

  // Brands endpoints
  async createBrand(data: any) {
    return this.client.post('/brands', data);
  }

  async getBrands() {
    return this.client.get('/brands');
  }

  async getBrand(id: string) {
    return this.client.get(`/brands/${id}`);
  }

  async updateBrand(id: string, data: any) {
    return this.client.patch(`/brands/${id}`, data);
  }

  async deleteBrand(id: string) {
    return this.client.delete(`/brands/${id}`);
  }

  // Groups endpoints
  async createGroup(data: any) {
    return this.client.post('/groups', data);
  }

  async getGroups() {
    return this.client.get('/groups');
  }

  async getGroup(id: string) {
    return this.client.get(`/groups/${id}`);
  }

  async updateGroup(id: string, data: any) {
    return this.client.patch(`/groups/${id}`, data);
  }

  async deleteGroup(id: string) {
    return this.client.delete(`/groups/${id}`);
  }

  // Products endpoints
  async createProduct(data: any) {
    return this.client.post('/products', data);
  }

  async getProducts() {
    return this.client.get('/products');
  }

  async getProduct(id: string) {
    return this.client.get(`/products/${id}`);
  }

  async updateProduct(id: string, data: any) {
    return this.client.patch(`/products/${id}`, data);
  }

  async deleteProduct(id: string) {
    return this.client.delete(`/products/${id}`);
  }

  // Product variations endpoints
  async createProductVariation(productId: string, data: any) {
    return this.client.post(`/products/${productId}/variations`, data);
  }

  async updateProductVariation(productId: string, variationId: string, data: any) {
    return this.client.patch(`/products/${productId}/variations/${variationId}`, data);
  }

  async deleteProductVariation(productId: string, variationId: string) {
    return this.client.delete(`/products/${productId}/variations/${variationId}`);
  }

  // Services endpoints
  async createService(data: any) {
    return this.client.post('/services', data);
  }

  async getServices() {
    return this.client.get('/services');
  }

  async getService(id: string) {
    return this.client.get(`/services/${id}`);
  }

  async updateService(id: string, data: any) {
    return this.client.patch(`/services/${id}`, data);
  }

  async deleteService(id: string) {
    return this.client.delete(`/services/${id}`);
  }

  // Service variations endpoints
  async createServiceVariation(serviceId: string, data: any) {
    return this.client.post(`/services/${serviceId}/variations`, data);
  }

  async deleteServiceVariation(serviceId: string, variationId: string) {
    return this.client.delete(`/services/${serviceId}/variations/${variationId}`);
  }

  // Invoices endpoints
  async createInvoice(data: any) {
    return this.client.post('/invoices', data);
  }

  async getInvoices(clientId?: string) {
    return this.client.get('/invoices', { params: { clientId } });
  }

  async getInvoice(id: string) {
    return this.client.get(`/invoices/${id}`);
  }

  async updateInvoice(id: string, data: any) {
    return this.client.patch(`/invoices/${id}`, data);
  }

  async cloneInvoice(id: string) {
    return this.client.post(`/invoices/${id}/clone`);
  }

  async deleteInvoice(id: string) {
    return this.client.delete(`/invoices/${id}`);
  }

  // Public invoice endpoints
  async getPublicInvoice(publicUrl: string) {
    return this.client.get(`/invoices/public/${publicUrl}`);
  }

  async approveInvoice(publicUrl: string) {
    return this.client.post(`/invoices/public/${publicUrl}/approve`);
  }

  async refuseInvoice(publicUrl: string) {
    return this.client.post(`/invoices/public/${publicUrl}/refuse`);
  }

  // Coupons endpoints
  async createCoupon(data: any) {
    return this.client.post('/coupons', data);
  }

  async getCoupons(active?: boolean) {
    return this.client.get('/coupons', { params: { active } });
  }

  async getCoupon(id: string) {
    return this.client.get(`/coupons/${id}`);
  }

  async getCouponsByPlatform(platform: string) {
    return this.client.get(`/coupons/platform/${platform}`);
  }

  async updateCoupon(id: string, data: any) {
    return this.client.patch(`/coupons/${id}`, data);
  }

  async deleteCoupon(id: string) {
    return this.client.delete(`/coupons/${id}`);
  }

  // Company endpoints
  async getMyCompany() {
    return this.client.get('/companies/me');
  }

  async createCompany(data: any) {
    return this.client.post('/companies', data);
  }

  async updateMyCompany(data: any) {
    return this.client.put('/companies/me', data);
  }
}

export default new ApiClient();
