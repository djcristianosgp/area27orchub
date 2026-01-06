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
    { label: 'Clientes', path: '/admin/clients', icon: '👥' },
    { label: 'Produtos', path: '/admin/products', icon: '📦' },
    { label: 'Serviços', path: '/admin/services', icon: '🔧' },
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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white shadow-lg">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold">🌐 OrchHub</h1>
          <p className="text-sm text-gray-400 mt-1">Painel Admin</p>
        </div>

        <nav className="mt-8">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-6 py-3 transition ${
                location.pathname === item.path
                  ? 'bg-blue-600 border-l-4 border-blue-400'
                  : 'hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow">
          <div className="flex justify-between items-center px-8 py-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {menuItems.find((m) => m.path === location.pathname)?.label ||
                  'Painel'}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <p className="font-medium">{user?.email}</p>
                <p className="text-gray-500">Admin</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition font-medium"
              >
                Sair
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
};
