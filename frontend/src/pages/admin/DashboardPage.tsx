import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@components/index';
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

  const StatCard = ({ title, value, icon, color }: any) => (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${color}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <div className="text-4xl opacity-20">{icon}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Dashboard</h3>
          <p className="text-gray-600 mt-1">Bem-vindo ao painel de controle</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total de Clientes"
            value={stats.totalClients}
            icon="👥"
            color="border-blue-500"
          />
          <StatCard
            title="Total de Produtos"
            value={stats.totalProducts}
            icon="📦"
            color="border-green-500"
          />
          <StatCard
            title="Total de Serviços"
            value={stats.totalServices}
            icon="🔧"
            color="border-purple-500"
          />
          <StatCard
            title="Total de Orçamentos"
            value={stats.totalInvoices}
            icon="📋"
            color="border-orange-500"
          />
          <StatCard
            title="Orçamentos Aprovados"
            value={stats.approvedInvoices}
            icon="✅"
            color="border-green-500"
          />
          <StatCard
            title="Receita Total"
            value={`R$ ${stats.totalRevenue.toFixed(2)}`}
            icon="💰"
            color="border-yellow-500"
          />
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-lg font-bold text-gray-800 mb-4">📌 Ações Rápidas</h4>
            <div className="space-y-2">
              <a
                href="/admin/clients"
                className="block p-3 bg-blue-50 hover:bg-blue-100 rounded text-blue-700 font-medium transition"
              >
                ➜ Gerenciar Clientes
              </a>
              <a
                href="/admin/products"
                className="block p-3 bg-green-50 hover:bg-green-100 rounded text-green-700 font-medium transition"
              >
                ➜ Gerenciar Produtos
              </a>
              <a
                href="/admin/invoices"
                className="block p-3 bg-orange-50 hover:bg-orange-100 rounded text-orange-700 font-medium transition"
              >
                ➜ Gerenciar Orçamentos
              </a>
            </div>
          </div>

          {/* About */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-lg font-bold text-gray-800 mb-4">ℹ️ Sobre o Sistema</h4>
            <div className="space-y-2 text-gray-600 text-sm">
              <p>
                <strong>OrçHub</strong> é um sistema completo de gerenciamento de orçamentos
                virtuais com suporte a produtos, serviços e cupons de desconto.
              </p>
              <p className="mt-3">
                <strong>Stack Tecnológico:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Frontend: React 18 + TypeScript + Tailwind</li>
                <li>Backend: NestJS + Prisma + PostgreSQL</li>
                <li>Auth: JWT com 24h de expiração</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
