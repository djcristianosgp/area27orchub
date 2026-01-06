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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg font-medium">Carregando orçamento...</p>
          <p className="text-gray-500 text-sm mt-1">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Orçamento não encontrado</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            <span>←</span>
            <span>Voltar para o início</span>
          </Link>
        </div>
      </div>
    );
  }

  const canRespond = invoice.responseStatus === undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <span>🌐</span>
            <span>Budget Hub</span>
          </h1>
          <p className="text-gray-600">Sistema de Orçamentos Virtuais</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <span>📋</span>
                  <span>Orçamento</span>
                </h2>
                <div className="space-y-1 text-blue-100">
                  <p className="text-sm">ID: {invoice.id.substring(0, 12)}...</p>
                  <p className="text-sm">Criado em: {new Date(invoice.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-xs text-blue-100">Valor Total</p>
                <p className="text-2xl font-bold">R$ {invoice.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Client Info */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">👤</span>
                <h3 className="text-xl font-bold text-gray-800">Informações do Cliente</h3>
              </div>
              {invoice.client && (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 font-medium">Nome:</span>
                    <span className="text-gray-900 font-semibold">{invoice.client.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 font-medium">Email:</span>
                    <span className="text-gray-900">{invoice.client.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 font-medium">Telefone:</span>
                    <span className="text-gray-900">{invoice.client.phone}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📦</span>
                <h3 className="text-xl font-bold text-gray-800">Itens do Orçamento</h3>
              </div>
              <div className="space-y-6">
                {invoice.groups?.map((group, idx) => (
                  <div key={group.id} className="border-l-4 border-blue-500 bg-gray-50 rounded-r-xl p-6">
                    <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-700 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </span>
                      <span>{group.name}</span>
                    </h4>
                    <div className="space-y-3">
                      {group.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-sm font-semibold text-gray-700">Quantidade:</span>
                              <span className="text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                                {item.quantity}x
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">Valor unitário: R$ {item.unitPrice.toFixed(2)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1">Total</p>
                            <p className="text-xl font-bold text-gray-900">R$ {item.totalPrice.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-6 rounded-xl mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1 flex items-center gap-2">
                    <span>💰</span>
                    <span className="font-semibold">Valor Total do Orçamento</span>
                  </p>
                  <p className="text-4xl font-bold text-green-600">
                    R$ {invoice.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Response Status */}
            {invoice.responseStatus === 'APPROVED' && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 p-6 rounded-xl mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">✅</span>
                  <div>
                    <p className="font-bold text-lg text-green-800 mb-1">Orçamento Aprovado</p>
                    <p className="text-sm text-green-700">
                      Aprovado em: {new Date(invoice.responseDate || '').toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-sm text-green-600 mt-2">
                      Obrigado pela aprovação! Em breve entraremos em contato.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {invoice.responseStatus === 'REFUSED' && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 p-6 rounded-xl mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">❌</span>
                  <div>
                    <p className="font-bold text-lg text-red-800 mb-1">Orçamento Recusado</p>
                    <p className="text-sm text-red-700">
                      Recusado em: {new Date(invoice.responseDate || '').toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-sm text-red-600 mt-2">
                      Agradecemos seu feedback. Estamos à disposição para ajustes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {canRespond && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 flex items-start gap-2">
                    <span className="text-lg">ℹ️</span>
                    <span>
                      Revise o orçamento acima e escolha uma das opções abaixo. 
                      Sua decisão é <strong>definitiva</strong> e não poderá ser alterada.
                    </span>
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={handleApprove}
                    disabled={responding}
                    className="group relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <span className="flex items-center justify-center gap-3 text-lg">
                      <span className="text-2xl">✅</span>
                      <span>{responding ? 'Processando...' : 'Aprovar Orçamento'}</span>
                    </span>
                  </button>
                  <button
                    onClick={handleRefuse}
                    disabled={responding}
                    className="group relative bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <span className="flex items-center justify-center gap-3 text-lg">
                      <span className="text-2xl">❌</span>
                      <span>{responding ? 'Processando...' : 'Recusar Orçamento'}</span>
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Powered by <strong>Budget Hub</strong> - Sistema de Orçamentos Virtuais</p>
        </div>
      </div>
    </div>
  );
};
