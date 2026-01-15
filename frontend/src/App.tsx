import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@pages/LoginPage';
import { CouponsPublicPageNew as CouponsPublicPage } from '@pages/CouponsPublicPageNew';
import { PublicInvoicePageNew as PublicInvoicePage } from '@pages/PublicInvoicePageNew';
import { ProductsPublicPageNew as ProductsPublicPage } from '@pages/ProductsPublicPageNew';
import { ProtectedRoute } from '@components/ProtectedRoute';
import {
  DashboardPage,
  InvoiceFormPage,
  CompanyPage,
} from '@pages/admin';
import { ClientsPageNew as ClientsPage } from '@pages/admin/ClientsPageNew';
import { InvoicesPageNew as InvoicesPage } from '@pages/admin/InvoicesPageNew';
import { ProductsPageNew as ProductsPage } from '@pages/admin/ProductsPageNew';
import { ServicesPageNew as ServicesPage } from '@pages/admin/ServicesPageNew';
import { CouponsPageNew as CouponsPage } from '@pages/admin/CouponsPageNew';
import { CategoriesPageNew as CategoriesPage } from '@pages/admin/CategoriesPageNew';
import { BrandsPageNew as BrandsPage } from '@pages/admin/BrandsPageNew';
import { GroupsPageNew as GroupsPage } from '@pages/admin/GroupsPageNew';

export function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage />} />
        <Route path="/coupons" element={<CouponsPublicPage />} />
        <Route path="/products" element={<ProductsPublicPage />} />
        <Route path="/public/invoice/:publicUrl" element={<PublicInvoicePage />} />
        <Route path="/" element={<Navigate to="/admin" replace />} />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clients"
          element={
            <ProtectedRoute>
              <ClientsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute>
              <ProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/services"
          element={
            <ProtectedRoute>
              <ServicesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/invoices"
          element={
            <ProtectedRoute>
              <InvoicesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/invoices/new"
          element={
            <ProtectedRoute>
              <InvoiceFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/invoices/:id/edit"
          element={
            <ProtectedRoute>
              <InvoiceFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/coupons"
          element={
            <ProtectedRoute>
              <CouponsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute>
              <CategoriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/brands"
          element={
            <ProtectedRoute>
              <BrandsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/groups"
          element={
            <ProtectedRoute>
              <GroupsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/company"
          element={
            <ProtectedRoute>
              <CompanyPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
