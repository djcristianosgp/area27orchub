import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@services/api';
import { Invoice } from '@types/index';

export const PublicInvoicePage: React.FC = () => {
  const { publicUrl } = useParams<{ publicUrl: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    loadInvoice();
  }, [publicUrl]);

  const loadInvoice = async () => {
    if (!publicUrl) return;
    try {
      setLoading(true);
      const response = await api.getPublicInvoice(publicUrl);
      setInvoice(response.data);
    } catch (err: any) {
      setError('Orçamento não encontrado ou expirou');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!publicUrl) return;
    try {
      setResponding(true);
      await api.approveInvoice(publicUrl);
      setInvoice((prev) => prev ? { ...prev, responseStatus: 'APPROVED' } : null);
    } catch (err: any) {
      setError('Erro ao aprovar orçamento');
    } finally {
      setResponding(false);
    }
  };

  const handleRefuse = async () => {
    if (!publicUrl) return;
    try {
      setResponding(true);
      await api.refuseInvoice(publicUrl);
      setInvoice((prev) => prev ? { ...prev, responseStatus: 'REFUSED' } : null);
    } catch (err: any) {
      setError('Erro ao recusar orçamento');
    } finally {
      setResponding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Carregando orçamento...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow p-6 max-w-md">
          <h1 className="text-xl font-bold text-gray-800 mb-4">Erro</h1>
          <p className="text-gray-600">{error}</p>
          <Link to="/" className="text-blue-600 hover:text-blue-700 font-semibold mt-4 block">
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  const canRespond = invoice.responseStatus === undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="border-b pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Orçamento</h1>
            <p className="text-gray-600">ID: {invoice.id}</p>
            <p className="text-gray-600">Criado em: {new Date(invoice.createdAt).toLocaleDateString('pt-BR')}</p>
          </div>

          {/* Client Info */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Informações do Cliente</h2>
            {invoice.client && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800"><strong>Nome:</strong> {invoice.client.name}</p>
                <p className="text-gray-800"><strong>Email:</strong> {invoice.client.email}</p>
                <p className="text-gray-800"><strong>Telefone:</strong> {invoice.client.phone}</p>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Itens do Orçamento</h2>
            {invoice.groups?.map((group) => (
              <div key={group.id} className="mb-6 border-l-4 border-blue-600 pl-4">
                <h3 className="font-semibold text-gray-800 mb-3">{group.name}</h3>
                <div className="space-y-2">
                  {group.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                      <div>
                        <p className="text-gray-800">Quantidade: {item.quantity}</p>
                        <p className="text-gray-600 text-sm">Valor unit: R$ {item.unitPrice.toFixed(2)}</p>
                      </div>
                      <p className="font-semibold text-gray-800">R$ {item.totalPrice.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded mb-8">
            <p className="text-gray-600 mb-2">Total do Orçamento</p>
            <p className="text-3xl font-bold text-blue-600">R$ {invoice.totalAmount.toFixed(2)}</p>
          </div>

          {/* Response Status */}
          {invoice.responseStatus === 'APPROVED' && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded mb-6">
              <p className="font-semibold">✓ Orçamento Aprovado</p>
              <p className="text-sm">Aprovado em: {new Date(invoice.responseDate || '').toLocaleDateString('pt-BR')}</p>
            </div>
          )}

          {invoice.responseStatus === 'REFUSED' && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
              <p className="font-semibold">✗ Orçamento Recusado</p>
              <p className="text-sm">Recusado em: {new Date(invoice.responseDate || '').toLocaleDateString('pt-BR')}</p>
            </div>
          )}

          {/* Action Buttons */}
          {canRespond && (
            <div className="flex gap-4">
              <button
                onClick={handleApprove}
                disabled={responding}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50"
              >
                {responding ? 'Processando...' : '✓ Aprovar'}
              </button>
              <button
                onClick={handleRefuse}
                disabled={responding}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50"
              >
                {responding ? 'Processando...' : '✗ Recusar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
