import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Card, Badge, Alert } from '@components/ui';
import { Loading } from '@components/common';
import api from '@services/api';
import { Download, Check, X, Package } from 'lucide-react';

export const PublicInvoicePage: React.FC = () => {
  const { publicUrl } = useParams<{ publicUrl: string }>();
  const [invoice, setInvoice] = useState<any>(null);
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
      setInvoice((prev: any) => (prev ? { ...prev, responseStatus: 'APPROVED' } : null));
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
      setInvoice((prev: any) => (prev ? { ...prev, responseStatus: 'REFUSED' } : null));
    } catch (err: any) {
      setError('Erro ao recusar orçamento');
    } finally {
      setResponding(false);
    }
  };

  if (loading) {
    return <Loading message="Carregando orçamento..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <Alert variant="danger" title="Erro" message={error} />
        </Card>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <p className="text-secondary-600">Orçamento não encontrado</p>
        </Card>
      </div>
    );
  }

  const isApproved = invoice.responseStatus === 'APPROVED';
  const isRefused = invoice.responseStatus === 'REFUSED';
  const alreadyResponded = isApproved || isRefused;

  return (
    <div className="min-h-screen bg-secondary-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-2xl">OH</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-secondary-900">Seu Orçamento</h1>
          <p className="text-secondary-600">ID: {invoice.id}</p>
        </div>

        {/* Status Alert */}
        {alreadyResponded && (
          <Alert
            variant={isApproved ? 'success' : 'warning'}
            title={isApproved ? 'Orçamento Aprovado' : 'Orçamento Recusado'}
            message={
              isApproved
                ? 'Você aprovou este orçamento. Entraremos em contato em breve!'
                : 'Você recusou este orçamento.'
            }
          />
        )}

        {/* Main Content */}
        <Card>
          <div className="p-6 md:p-8 space-y-6">
            {/* Invoice Header */}
            <div className="border-b border-secondary-200 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-secondary-500 font-medium">Cliente</p>
                  <p className="text-lg font-semibold text-secondary-900">{invoice.client?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-secondary-500 font-medium">Data de Emissão</p>
                  <p className="text-lg font-semibold text-secondary-900">
                    {new Date(invoice.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            {/* Items */}
            {invoice.items && invoice.items.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-secondary-900 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Itens do Orçamento
                </h3>
                <div className="space-y-3">
                  {invoice.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-secondary-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-secondary-900">{item.name}</p>
                        <p className="text-sm text-secondary-500">Quantidade: {item.quantity || 1}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-secondary-900">
                          R$ {(item.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="border-t border-secondary-200 pt-6 space-y-3">
              {invoice.subtotal && (
                <div className="flex justify-between">
                  <span className="text-secondary-600">Subtotal</span>
                  <span className="text-secondary-900">
                    R$ {invoice.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              {invoice.discount && invoice.discount > 0 && (
                <div className="flex justify-between text-success-600">
                  <span>Desconto</span>
                  <span>
                    -R$ {invoice.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold bg-primary-50 p-4 rounded-lg border border-primary-200">
                <span className="text-primary-900">Total</span>
                <span className="text-primary-700">
                  R$ {(invoice.totalAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Observations */}
            {invoice.observations && (
              <div className="border-t border-secondary-200 pt-6">
                <p className="text-sm text-secondary-500 font-medium mb-2">Observações</p>
                <p className="text-secondary-700 whitespace-pre-wrap">{invoice.observations}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Actions */}
        {!alreadyResponded && (
          <Card>
            <div className="p-6 space-y-4">
              <p className="text-secondary-700 font-medium">Deseja aprovar ou recusar este orçamento?</p>
              <div className="flex gap-3 flex-col md:flex-row">
                <Button
                  variant="success"
                  size="lg"
                  onClick={handleApprove}
                  isLoading={responding}
                  disabled={responding}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Check className="h-5 w-5" />
                  Aprovar
                </Button>
                <Button
                  variant="danger"
                  size="lg"
                  onClick={handleRefuse}
                  isLoading={responding}
                  disabled={responding}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <X className="h-5 w-5" />
                  Recusar
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-secondary-500 text-sm">
          <p>© 2025 OrçHub - Sistema de Orçamentos Virtuais</p>
        </div>
      </div>
    </div>
  );
};
