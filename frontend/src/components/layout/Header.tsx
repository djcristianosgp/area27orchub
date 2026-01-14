import React, { useState } from 'react';
import { Menu, X, LogOut, Settings, User, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuToggle?: (isOpen: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const userEmail = localStorage.getItem('userEmail') || 'usuário@example.com';

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-secondary-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Menu Button (Mobile) + Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
              onMenuToggle?.(!isMobileMenuOpen);
            }}
            className="lg:hidden p-2 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-secondary-600" />
            ) : (
              <Menu className="h-6 w-6 text-secondary-600" />
            )}
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">OH</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-secondary-900">OrçHub</h1>
              <p className="text-xs text-secondary-500">Orçamentos & Marketplace</p>
            </div>
          </div>
        </div>

        {/* Right: Profile Menu */}
        <div className="flex items-center gap-4">
          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 p-2 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-secondary-900">Minha Conta</p>
                <p className="text-xs text-secondary-500">{userEmail}</p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <ChevronDown
                className={`h-4 w-4 text-secondary-600 transition-transform ${
                  isProfileOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 overflow-hidden animate-slide-in">
                <a
                  href="#profile"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                >
                  <User className="h-4 w-4" />
                  Perfil
                </a>
                <a
                  href="#settings"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors border-t border-secondary-200"
                >
                  <Settings className="h-4 w-4" />
                  Configurações
                </a>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-danger-600 hover:bg-danger-50 transition-colors border-t border-secondary-200"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
