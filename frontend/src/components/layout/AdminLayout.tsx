import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-secondary-50">
      {/* Header */}
      <Header onMenuToggle={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto lg:ml-64 transition-all duration-300">
          <div className="p-6 lg:p-8">
            <div className="max-w-7xl">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
