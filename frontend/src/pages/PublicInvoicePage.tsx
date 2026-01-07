import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@services/api';

export const PublicInvoicePage: React.FC = () => {
  const { publicUrl } = useParams<{ publicUrl: string }>();
  const [invoice, setInvoice] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
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
      // Buscar dados da empresa
      try {
        const companyRes = await (api as any).getMe?.();
        if (companyRes?.data) {
          setCompany(companyRes.data.company || companyRes.data);
        }
      } catch {
        // Empresa não encontrada, continuar sem ela
      }
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
      setInvoice((prev: any) => prev ? { ...prev, responseStatus: 'APPROVED' } : null);
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
      setInvoice((prev: any) => prev ? { ...prev, responseStatus: 'REFUSED' } : null);
    } catch (err: any) {
      setError('Erro ao recusar orçamento');
    } finally {
      setResponding(false);
    }
  };

  // Baixar PDF (público)
  const handleDownloadPdf = async () => {
    if (!publicUrl) return;
    try {
      const res = await (api as any).downloadPublicInvoicePdf(publicUrl);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `Orcamento_${invoice?.code || (invoice?.id || '').substring(0, 8)}.pdf`;
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError('Não foi possível baixar o PDF do orçamento');
    }
  };

  // Imprimir página
  const handlePrint = () => {
    window.print();
  };

  // Função para converter data para formato BR (DD/MM/YYYY) sem problemas de timezone
  const formatDateBR = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const calculateFinalAmount = () => {
    if (!invoice) return 0;
    const baseTotal = invoice.totalAmount || 0;
    const discounts = (invoice.discounts || 0) * -1; // Desconto é negativo
    const additions = invoice.additions || 0;
    const displacement = invoice.displacement || 0;
    return baseTotal + discounts + additions + displacement;
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

  const canRespond = (invoice as any).responseStatus === undefined || (invoice as any).responseStatus === null;

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
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <span>📋</span>
                  <span>Orçamento</span>
                </h2>
                <div className="space-y-1 text-blue-100">
                  <p className="text-sm">ID: {invoice.code || invoice.id.substring(0, 12)}...</p>
                  <p className="text-sm">Criado em: {new Date(invoice.createdAt).toLocaleDateString('pt-BR')}</p>
                  {invoice.proposalValidDate && (
                    <p className="text-sm">Válido até: {formatDateBR(invoice.proposalValidDate)}</p>
                  )}
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-xs text-blue-100">Valor Total</p>
                <p className="text-2xl font-bold">R$ {calculateFinalAmount().toFixed(2)}</p>
              </div>
            </div>

            {/* Ações: PDF e Imprimir */}
            <div className="flex items-center gap-3 justify-end mt-2">
              <button
                onClick={handleDownloadPdf}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-md transition"
                title="Baixar PDF"
              >
                <span>📄</span>
                <span>Baixar PDF</span>
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 font-semibold rounded-md transition"
                title="Imprimir"
              >
                <span>🖨️</span>
                <span>Imprimir</span>
              </button>
            </div>

            {/* Dados da Empresa */}
            {company && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-blue-100 text-xs">Empresa</p>
                    <p className="font-semibold">{company.name}</p>
                    {company.nickname && <p className="text-blue-100 text-xs">{company.nickname}</p>}
                  </div>
                  <div>
                    <p className="text-blue-100 text-xs">Localização</p>
                    <p className="font-semibold">{company.city}, {company.state}</p>
                  </div>
                </div>
              </div>
            )}
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
                  {invoice.client?.clientEmails?.[0]?.email && (
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 font-medium">Email:</span>
                      <span className="text-gray-900">{invoice.client.clientEmails[0].email}</span>
                    </div>
                  )}
                  {invoice.client?.clientPhones?.[0]?.phone && (
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 font-medium">Telefone:</span>
                      <span className="text-gray-900">{invoice.client.clientPhones[0].phone}</span>
                    </div>
                  )}
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
                {invoice.groups?.map((group: any, idx: number) => (
                  <div key={group.id} className="border-l-4 border-blue-500 bg-gray-50 rounded-r-xl p-6">
                    <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-700 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </span>
                      <span>{group.name}</span>
                    </h4>
                    <div className="space-y-3">
                      {group.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-start bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex-1">
                            <div className="mb-3">
                              {(item.customName || item.product?.name || item.service?.name) && (
                                <p className="font-bold text-gray-900 text-lg">
                                  {item.customName || item.product?.name || item.service?.name}
                                </p>
                              )}
                              {item.customDescription && (
                                <p className="text-sm text-gray-600 mb-2">{item.customDescription}</p>
                              )}
                              
                              {/* Descrição do Produto */}
                              {item.product?.description && (
                                <p className="text-sm text-gray-500 italic border-l-2 border-blue-300 pl-2 mb-2">
                                  {item.product.description}
                                </p>
                              )}
                              
                              {/* Descrição do Serviço */}
                              {item.service?.description && (
                                <p className="text-sm text-gray-500 italic border-l-2 border-green-300 pl-2 mb-2">
                                  {item.service.description}
                                </p>
                              )}
                              
                              {/* Nome da Variação de Produto */}
                              {item.productVariation?.name && (
                                <p className="text-sm font-semibold text-purple-700 mb-1">
                                  Variação: {item.productVariation.name}
                                </p>
                              )}
                              
                              {/* Observação da Variação de Produto */}
                              {item.productVariation?.observation && (
                                <p className="text-sm text-gray-600 mb-2">
                                  📝 {item.productVariation.observation}
                                </p>
                              )}
                              
                              {/* Nome da Variação de Serviço */}
                              {item.serviceVariation?.name && (
                                <p className="text-sm font-semibold text-teal-700 mb-1">
                                  Variação: {item.serviceVariation.name}
                                </p>
                              )}
                              
                              {/* Observação da Variação de Serviço */}
                              {item.serviceVariation?.observation && (
                                <p className="text-sm text-gray-600 mb-2">
                                  📝 {item.serviceVariation.observation}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <span className="text-sm font-semibold text-gray-700">Quantidade:</span>
                              <span className="text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                                {item.quantity}x
                              </span>
                            </div>
                            <div className="space-y-1 text-sm">
                              <p className="text-gray-600">Valor unitário: R$ {item.unitPrice.toFixed(2)}</p>
                              {item.customPrice && (
                                <p className="text-gray-600">Preço customizado: R$ {item.customPrice.toFixed(2)}</p>
                              )}
                            </div>
                            {/* Botão de link de afiliado */}
                            {item.productVariation?.affiliateLink && (
                              <div className="mt-3">
                                <a
                                  href={item.productVariation.affiliateLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm font-semibold rounded-lg transition transform hover:scale-105"
                                >
                                  <span>🛒</span>
                                  <span>Comprar</span>
                                  <span>↗</span>
                                </a>
                              </div>
                            )}
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
              <div className="space-y-4">
                {/* Subtotal */}
                <div className="flex items-center justify-between pb-4 border-b border-green-300">
                  <p className="text-gray-600 font-medium">Subtotal</p>
                  <p className="text-lg font-semibold text-gray-900">R$ {(invoice.totalAmount || 0).toFixed(2)}</p>
                </div>

                {/* Descontos */}
                {invoice.discounts && invoice.discounts > 0 && (
                  <div className="flex items-center justify-between text-green-700">
                    <p className="font-medium flex items-center gap-2">
                      <span>✂️</span>
                      <span>Desconto</span>
                    </p>
                    <p className="text-lg font-semibold">- R$ {invoice.discounts.toFixed(2)}</p>
                  </div>
                )}

                {/* Acréscimos */}
                {invoice.additions && invoice.additions > 0 && (
                  <div className="flex items-center justify-between text-orange-700">
                    <p className="font-medium flex items-center gap-2">
                      <span>➕</span>
                      <span>Acréscimo</span>
                    </p>
                    <p className="text-lg font-semibold">+ R$ {invoice.additions.toFixed(2)}</p>
                  </div>
                )}

                {/* Deslocamento */}
                {invoice.displacement && invoice.displacement > 0 && (
                  <div className="flex items-center justify-between text-blue-700">
                    <p className="font-medium flex items-center gap-2">
                      <span>🚚</span>
                      <span>Deslocamento</span>
                    </p>
                    <p className="text-lg font-semibold">+ R$ {invoice.displacement.toFixed(2)}</p>
                  </div>
                )}

                {/* Total Final */}
                <div className="flex items-center justify-between pt-4 border-t-2 border-green-400 bg-white/50 p-3 rounded-lg">
                  <div>
                    <p className="text-gray-600 mb-1 flex items-center gap-2">
                      <span>💰</span>
                      <span className="font-semibold">Valor Total do Orçamento</span>
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    R$ {calculateFinalAmount().toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Response Status */}
            {(invoice as any).responseStatus === 'APPROVED' && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 p-6 rounded-xl mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">✅</span>
                  <div>
                    <p className="font-bold text-lg text-green-800 mb-1">Orçamento Aprovado</p>
                    <p className="text-sm text-green-700">
                      Aprovado em: {new Date((invoice as any).responseDate || '').toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-sm text-green-600 mt-2">
                      Obrigado pela aprovação! Em breve entraremos em contato.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {(invoice as any).responseStatus === 'REFUSED' && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 p-6 rounded-xl mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">❌</span>
                  <div>
                    <p className="font-bold text-lg text-red-800 mb-1">Orçamento Recusado</p>
                    <p className="text-sm text-red-700">
                      Recusado em: {new Date((invoice as any).responseDate || '').toLocaleDateString('pt-BR')}
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
