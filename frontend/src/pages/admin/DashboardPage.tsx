import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@components/layout';
import { StatCard, Card, CardBody } from '@components/ui';
import { PageHeader, Loading } from '@components/common';
import { Button } from '@components/ui';
import api from '@services/api';
import {
  Users,
  Package,
  Wrench,
  FileText,
  TrendingUp,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalClients: number;
  totalProducts: number;
  totalServices: number;
  totalInvoices: number;
  approvedInvoices: number;
  totalRevenue: number;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
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
        <Loading message="Carregando estatísticas..." />
      </AdminLayout>
    );
  }

  const quickActions = [
    {
      label: 'Gerenciar Clientes',
      href: '/admin/clients',
      icon: Users,
      color: 'primary',
    },
    {
      label: 'Gerenciar Produtos',
      href: '/admin/products',
      icon: Package,
      color: 'success',
    },
    {
      label: 'Gerenciar Serviços',
      href: '/admin/services',
      icon: Wrench,
      color: 'accent',
    },
    {
      label: 'Gerenciar Orçamentos',
      href: '/admin/invoices',
      icon: FileText,
      color: 'warning',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <PageHeader
          title="Dashboard"
          subtitle="Bem-vindo ao OrçHub! Aqui está um resumo do seu negócio"
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          <StatCard
            title="Total de Clientes"
            value={stats.totalClients}
            subtitle="Clientes cadastrados"
            icon={<Users className="h-8 w-8" />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Total de Produtos"
            value={stats.totalProducts}
            subtitle="Produtos disponíveis"
            icon={<Package className="h-8 w-8" />}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Total de Serviços"
            value={stats.totalServices}
            subtitle="Serviços oferecidos"
            icon={<Wrench className="h-8 w-8" />}
            trend={{ value: 5, isPositive: false }}
          />
          <StatCard
            title="Total de Orçamentos"
            value={stats.totalInvoices}
            subtitle="Orçamentos criados"
            icon={<FileText className="h-8 w-8" />}
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            title="Orçamentos Aprovados"
            value={stats.approvedInvoices}
            subtitle={`${
              stats.totalInvoices > 0
                ? Math.round((stats.approvedInvoices / stats.totalInvoices) * 100)
                : 0
            }% do total`}
            icon={<TrendingUp className="h-8 w-8" />}
            trend={{ value: 23, isPositive: true }}
          />
          <StatCard
            title="Receita Total"
            value={`R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            subtitle="De orçamentos aprovados"
            icon={<DollarSign className="h-8 w-8" />}
            trend={{ value: 34, isPositive: true }}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-6 flex items-center gap-2">
                <span className="p-2 bg-primary-100 rounded-lg">
                  <ArrowRight className="h-5 w-5 text-primary-600" />
                </span>
                Ações Rápidas
              </h3>
              <div className="space-y-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  const colorMap = {
                    primary: 'from-primary-50 to-primary-100 border-primary-200 hover:from-primary-100 hover:to-primary-200',
                    success: 'from-success-50 to-success-100 border-success-200 hover:from-success-100 hover:to-success-200',
                    accent: 'from-accent-50 to-accent-100 border-accent-200 hover:from-accent-100 hover:to-accent-200',
                    warning:
                      'from-warning-50 to-warning-100 border-warning-200 hover:from-warning-100 hover:to-warning-200',
                  };

                  return (
                    <a
                      key={action.href}
                      href={action.href}
                      className={`flex items-center gap-3 p-4 rounded-xl border bg-gradient-to-r ${colorMap[action.color as keyof typeof colorMap]} transition-all duration-300 hover:shadow-md group`}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="flex-1 font-medium text-secondary-800">{action.label}</span>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                    </a>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* System Info */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-6 flex items-center gap-2">
                <span className="p-2 bg-accent-100 rounded-lg">
                  <Package className="h-5 w-5 text-accent-600" />
                </span>
                Sobre o OrçHub
              </h3>
              <div className="space-y-4 text-secondary-600 text-sm">
                <p>
                  Um sistema profissional de gerenciamento de <strong>orçamentos virtuais</strong>,{' '}
                  <strong>cupons de desconto</strong> e <strong>marketplace de afiliados</strong>.
                </p>

                <div className="border-t border-secondary-200 pt-4 space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-primary-50 border border-primary-100">
                    <span className="font-bold text-primary-600 text-lg flex-shrink-0">→</span>
                    <span>
                      <strong className="text-primary-900">API REST</strong> completa com autenticação JWT
                    </span>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-success-50 border border-success-100">
                    <span className="font-bold text-success-600 text-lg flex-shrink-0">→</span>
                    <span>
                      <strong className="text-success-900">Segurança</strong> em primeiro lugar com validações
                    </span>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-accent-50 border border-accent-100">
                    <span className="font-bold text-accent-600 text-lg flex-shrink-0">→</span>
                    <span>
                      <strong className="text-accent-900">Escalável</strong> para crescimento futuro
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '🎯',
              title: 'Gestão Completa',
              description: 'Gerencie clientes, produtos, serviços e orçamentos em um único lugar',
            },
            {
              icon: '📱',
              title: '100% Responsivo',
              description: 'Interface moderna que funciona perfeitamente em qualquer dispositivo',
            },
            {
              icon: '🔗',
              title: 'Links de Afiliados',
              description: 'Compartilhe cupons e produtos com links de afiliados integrados',
            },
          ].map((feature, idx) => (
            <Card key={idx} className="cursor-pointer hover:shadow-md transition-all">
              <div className="p-6 text-center">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h4 className="font-semibold text-secondary-900 mb-2">{feature.title}</h4>
                <p className="text-sm text-secondary-600">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};
