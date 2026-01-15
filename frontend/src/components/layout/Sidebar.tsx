import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Wrench,
  Tag,
  ShoppingCart,
  Layers,
  Bookmark,
  FolderOpen,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const navigationItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    label: 'Orçamentos',
    href: '/admin/invoices',
    icon: FileText,
    badge: null,
  },
  {
    label: 'Clientes',
    href: '/admin/clients',
    icon: Users,
    badge: null,
  },
  {
    label: 'Produtos',
    href: '/admin/products',
    icon: Package,
    badge: null,
  },
  {
    label: 'Serviços',
    href: '/admin/services',
    icon: Wrench,
    badge: null,
  },
  {
    label: 'Cupons',
    href: '/admin/coupons',
    icon: Tag,
    badge: null,
  },
  {
    label: 'Marketplace',
    href: '/products',
    icon: ShoppingCart,
    badge: null,
  },
];

const configurationItems = [
  {
    label: 'Categorias',
    href: '/admin/categories',
    icon: Bookmark,
  },
  {
    label: 'Marcas',
    href: '/admin/brands',
    icon: Layers,
  },
  {
    label: 'Grupos',
    href: '/admin/groups',
    icon: FolderOpen,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 z-30 w-64 bg-white border-r border-secondary-200 overflow-y-auto transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <nav className="p-6 space-y-8">
          {/* Main Navigation */}
          <div>
            <h3 className="px-3 mb-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">
              Menu Principal
            </h3>
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <NavLink
                      to={item.href}
                      onClick={() => onClose?.()}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                          isActive
                            ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                            : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                        }`
                      }
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-danger-600 text-white text-xs rounded-full px-2 py-0.5">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Configuration Section */}
          <div>
            <h3 className="px-3 mb-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">
              Configuração
            </h3>
            <ul className="space-y-2">
              {configurationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <NavLink
                      to={item.href}
                      onClick={() => onClose?.()}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                          isActive
                            ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                            : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                        }`
                      }
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Public Links */}
          <div className="border-t border-secondary-200 pt-6">
            <h3 className="px-3 mb-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">
              Público
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/coupons"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900 transition-colors"
                >
                  <Tag className="h-5 w-5" />
                  <span>Ver Cupons</span>
                </a>
              </li>
              <li>
                <a
                  href="/products"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900 transition-colors"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Ver Marketplace</span>
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </aside>
    </>
  );
};
