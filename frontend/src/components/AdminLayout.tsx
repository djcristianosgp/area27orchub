import React, { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { label: 'Dashboard', path: '/admin', icon: '📊' },
    { label: 'Empresa', path: '/admin/company', icon: '🏢' },
    { label: 'Clientes', path: '/admin/clients', icon: '👥' },
    { label: 'Produtos', path: '/admin/products', icon: '📦' },
    { label: 'Serviços', path: '/admin/services', icon: '🛠️' },
    { label: 'Categorias', path: '/admin/categories', icon: '🏷️' },
    { label: 'Marcas', path: '/admin/brands', icon: '™️' },
    { label: 'Grupos', path: '/admin/groups', icon: '🎯' },
    { label: 'Orçamentos', path: '/admin/invoices', icon: '📋' },
    { label: 'Cupons', path: '/admin/coupons', icon: '🎟️' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Sidebar - Design Moderno com Glassmorphism */}
      <aside className="w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl relative flex flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
              <span className="text-2xl">🌐</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Budget Hub
              </h1>
              <p className="text-xs text-slate-400 font-medium">Sistema de Orçamentos</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-600/30 scale-[1.02]'
                    : 'hover:bg-slate-700/50 hover:translate-x-1'
                }`}
              >
                <span className={`text-2xl transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                <span className="font-semibold text-sm">
                  {item.label}
                </span>
                {isActive && (
                  <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    ✓
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span>✨</span>
              <span>v1.0.5</span>
            </span>
            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-md font-medium">
              Online
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Design Moderno com Glassmorphism */}
        <header className="bg-white/70 backdrop-blur-xl shadow-sm border-b border-white/20 sticky top-0 z-10">
          <div className="flex justify-between items-center px-8 py-4">
            {/* Page Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-xl">
                  {menuItems.find((m) => m.path === location.pathname)?.icon || '📊'}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {menuItems.find((m) => m.path === location.pathname)?.label || 'Painel'}
                </h2>
                <p className="text-xs text-slate-500">
                  Gerencie e acompanhe suas informações
                </p>
              </div>
            </div>

            {/* User Section */}
            <div className="flex items-center gap-4">
              {/* User Info Card */}
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200 shadow-sm">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-lg shadow-md">
                  👤
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 max-w-[200px] truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    Administrador
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="group px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl transition-all font-semibold text-sm shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 flex items-center gap-2 transform hover:scale-105"
                title="Sair do sistema"
              >
                <span className="text-base group-hover:rotate-12 transition-transform">🚪</span>
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Container - Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-indigo-50/50">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
