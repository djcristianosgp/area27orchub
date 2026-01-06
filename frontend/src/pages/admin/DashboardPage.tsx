import React, { useState, useEffect } from 'react';
import { AdminLayout, StatCard, Card, CardBody, PageHeader } from '@components/index';
import api from '@services/api';
import { Client, Product, Service, Invoice } from '@types/index';

interface DashboardStats {
  totalClients: number;
  totalProducts: number;
  totalServices: number;
  totalInvoices: number;
  approvedInvoices: number;
  totalRevenue: number;
}

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalProducts: 0,
    totalServices: 0,
    totalInvoices: 0,
    approvedInvoices: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [clients, products, services, invoices] = await Promise.all([
        api.getClients(),
        api.getProducts(),
        api.getServices(),
        api.getInvoices(),
      ]);

      const clientsData = clients.data || [];
      const productsData = products.data || [];
      const servicesData = services.data || [];
      const invoicesData = invoices.data || [];

      // Calcular receita total de orçamentos aprovados
      const totalRevenue = invoicesData
        .filter((inv: any) => inv.status === 'APPROVED')
        .reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0);

      setStats({
        totalClients: clientsData.length,
        totalProducts: productsData.length,
        totalServices: servicesData.length,
        totalInvoices: invoicesData.length,
        approvedInvoices: invoicesData.filter((inv: any) => inv.status === 'APPROVED').length,
        totalRevenue,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Carregando estatísticas...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <PageHeader
          emoji="📊"
          title="Dashboard"
          description="Visão geral do seu negócio em tempo real"
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          <StatCard
            emoji="👥"
            title="Total de Clientes"
            value={stats.totalClients}
            subtitle="Clientes cadastrados"
          />
          <StatCard
            emoji="📦"
            title="Total de Produtos"
            value={stats.totalProducts}
            subtitle="Produtos disponíveis"
          />
          <StatCard
            emoji="🛠️"
            title="Total de Serviços"
            value={stats.totalServices}
            subtitle="Serviços oferecidos"
          />
          <StatCard
            emoji="📋"
            title="Total de Orçamentos"
            value={stats.totalInvoices}
            subtitle="Orçamentos criados"
          />
          <StatCard
            emoji="✅"
            title="Orçamentos Aprovados"
            value={stats.approvedInvoices}
            subtitle={`${stats.totalInvoices > 0 ? Math.round((stats.approvedInvoices / stats.totalInvoices) * 100) : 0}% do total`}
          />
          <StatCard
            emoji="💰"
            title="Receita Total"
            value={`R$ ${stats.totalRevenue.toFixed(2)}`}
            subtitle="De orçamentos aprovados"
          />
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardBody>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-100">
                <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
                  <span className="text-2xl">⚡</span>
                </div>
                <h4 className="text-xl font-bold text-gray-800">Ações Rápidas</h4>
              </div>
              <div className="space-y-3">
                <a
                  href="/admin/clients"
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl text-blue-700 font-medium transition-all duration-300 group shadow-sm hover:shadow-md border border-blue-100"
                >
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <span className="text-xl">👥</span>
                  </div>
                  <span className="flex-1">Gerenciar Clientes</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">→</span>
                </a>
                <a
                  href="/admin/products"
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl text-green-700 font-medium transition-all duration-300 group shadow-sm hover:shadow-md border border-green-100"
                >
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <span className="text-xl">📦</span>
                  </div>
                  <span className="flex-1">Gerenciar Produtos</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">→</span>
                </a>
                <a
                  href="/admin/services"
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 rounded-xl text-indigo-700 font-medium transition-all duration-300 group shadow-sm hover:shadow-md border border-indigo-100"
                >
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <span className="text-xl">🛠️</span>
                  </div>
                  <span className="flex-1">Gerenciar Serviços</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">→</span>
                </a>
                <a
                  href="/admin/invoices"
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl text-orange-700 font-medium transition-all duration-300 group shadow-sm hover:shadow-md border border-orange-100"
                >
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <span className="text-xl">📋</span>
                  </div>
                  <span className="flex-1">Gerenciar Orçamentos</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">→</span>
                </a>
                <a
                  href="/admin/coupons"
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl text-purple-700 font-medium transition-all duration-300 group shadow-sm hover:shadow-md border border-purple-100"
                >
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <span className="text-xl">🎟️</span>
                  </div>
                  <span className="flex-1">Gerenciar Cupons</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">→</span>
                </a>
              </div>
            </CardBody>
          </Card>

          {/* About */}
          <Card>
            <CardBody>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-100">
                <div className="p-2 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg">
                  <span className="text-2xl">ℹ️</span>
                </div>
                <h4 className="text-xl font-bold text-gray-800">Sobre o Sistema</h4>
              </div>
              <div className="space-y-4 text-gray-600">
                <p className="leading-relaxed text-base">
                  <strong className="text-gray-800">OrçHub</strong> é um sistema completo de 
                  gerenciamento de orçamentos virtuais com suporte a produtos, serviços e 
                  cupons de desconto.
                </p>
                <div className="pt-4 border-t border-gray-100">
                  <p className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-lg">🚀</span>
                    Stack Tecnológico
                  </p>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <span className="text-blue-600 font-bold text-lg">•</span>
                      <span><strong className="text-blue-800">Frontend:</strong> React 18 + TypeScript + Tailwind CSS</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <span className="text-green-600 font-bold text-lg">•</span>
                      <span><strong className="text-green-800">Backend:</strong> NestJS + Prisma + PostgreSQL</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <span className="text-purple-600 font-bold text-lg">•</span>
                      <span><strong className="text-purple-800">Auth:</strong> JWT com 24h de expiração</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Additional Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hover>
            <CardBody>
              <div className="text-center">
                <div className="inline-flex p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full mb-4">
                  <span className="text-4xl">🎯</span>
                </div>
                <h5 className="font-bold text-gray-800 mb-2 text-lg">Gestão Completa</h5>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Gerencie clientes, produtos, serviços e orçamentos em um único lugar
                </p>
              </div>
            </CardBody>
          </Card>

          <Card hover>
            <CardBody>
              <div className="text-center">
                <div className="inline-flex p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-full mb-4">
                  <span className="text-4xl">📱</span>
                </div>
                <h5 className="font-bold text-gray-800 mb-2 text-lg">100% Responsivo</h5>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Interface moderna que funciona perfeitamente em qualquer dispositivo
                </p>
              </div>
            </CardBody>
          </Card>

          <Card hover>
            <CardBody>
              <div className="text-center">
                <div className="inline-flex p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full mb-4">
                  <span className="text-4xl">🔗</span>
                </div>
                <h5 className="font-bold text-gray-800 mb-2 text-lg">Links de Afiliados</h5>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Compartilhe cupons e produtos com links de afiliados integrados
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};
