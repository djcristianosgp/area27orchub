import React, { useEffect, useState } from 'react';
import api from '@services/api';
import { AdminLayout } from '@components/AdminLayout';

interface CompanyEmail { email: string; primary?: boolean }
interface CompanyPhone { phone: string; hasWhatsapp?: boolean; primary?: boolean }
interface CompanySocial { platform: string; url: string }
interface CompanyPixKey { key: string; type?: string }

interface Company {
  id?: string;
  name: string;
  nickname?: string;
  cpfCnpj?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  zipCode?: string;
  state?: string;
  observations?: string;
  createdAt?: string;
  updatedAt?: string;
  emails: CompanyEmail[];
  phones: CompanyPhone[];
  socials: CompanySocial[];
  pixKeys: CompanyPixKey[];
}

export const CompanyPage: React.FC = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emptyCompany: Company = {
    name: '',
    nickname: '',
    cpfCnpj: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    zipCode: '',
    state: '',
    observations: '',
    emails: [],
    phones: [],
    socials: [],
    pixKeys: [],
  };

  const fetchCompany = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getMyCompany();
      setCompany(res.data);
    } catch (e: any) {
      // Se não existir, inicia form vazio
      setCompany(emptyCompany);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const handleChange = (field: keyof Company, value: any) => {
    if (!company) return;
    setCompany({ ...company, [field]: value });
  };

  const addItem = (field: keyof Company) => {
    if (!company) return;
    const list = (company[field] as any[]) || [];
    const newItem = field === 'emails' ? { email: '' } : field === 'phones' ? { phone: '', hasWhatsapp: false } : field === 'socials' ? { platform: '', url: '' } : { key: '', type: '' };
    setCompany({ ...company, [field]: [...list, newItem] as any });
  };

  const updateListItem = (field: keyof Company, index: number, item: any) => {
    if (!company) return;
    const list = (company[field] as any[]) || [];
    const newList = list.slice();
    newList[index] = item;
    setCompany({ ...company, [field]: newList as any });
  };

  const removeListItem = (field: keyof Company, index: number) => {
    if (!company) return;
    const list = (company[field] as any[]) || [];
    const newList = list.filter((_, i) => i !== index);
    setCompany({ ...company, [field]: newList as any });
  };

  const save = async () => {
    if (!company) return;
    setSaving(true);
    setError(null);
    const { id, createdAt, updatedAt, ...payload } = company;
    try {
      if (id) {
        await api.updateMyCompany(payload);
      } else {
        const res = await api.createCompany(payload);
        setCompany(res.data);
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Erro ao salvar empresa');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Dados da Empresa</h2>
        {loading && <p>Carregando...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {company && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="input" placeholder="Nome/Razão Social" value={company.name || ''} onChange={(e) => handleChange('name', e.target.value)} />
            <input className="input" placeholder="Apelido/Nome Fantasia" value={company.nickname || ''} onChange={(e) => handleChange('nickname', e.target.value)} />
            <input className="input" placeholder="CPF/CNPJ" value={company.cpfCnpj || ''} onChange={(e) => handleChange('cpfCnpj', e.target.value)} />
            <input className="input" placeholder="Logradouro" value={company.street || ''} onChange={(e) => handleChange('street', e.target.value)} />
            <input className="input" placeholder="Número" value={company.number || ''} onChange={(e) => handleChange('number', e.target.value)} />
            <input className="input" placeholder="Bairro" value={company.neighborhood || ''} onChange={(e) => handleChange('neighborhood', e.target.value)} />
            <input className="input" placeholder="Cidade" value={company.city || ''} onChange={(e) => handleChange('city', e.target.value)} />
            <input className="input" placeholder="CEP" value={company.zipCode || ''} onChange={(e) => handleChange('zipCode', e.target.value)} />
            <input className="input" placeholder="Estado" value={company.state || ''} onChange={(e) => handleChange('state', e.target.value)} />
            <textarea className="textarea md:col-span-2" placeholder="Observações" value={company.observations || ''} onChange={(e) => handleChange('observations', e.target.value)} />

            {/* Emails */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Emails</h3>
                <button className="btn" onClick={() => addItem('emails')}>+ Adicionar Email</button>
              </div>
              {company.emails.map((e, i) => (
                <div key={i} className="flex gap-2 mt-2">
                  <input className="input flex-1" placeholder="email@dominio" value={e.email} onChange={(ev) => updateListItem('emails', i, { ...e, email: ev.target.value })} />
                  <label className="flex items-center gap-1"><input type="checkbox" checked={e.primary || false} onChange={(ev) => updateListItem('emails', i, { ...e, primary: ev.target.checked })} /> Primário</label>
                  <button className="btn-danger" onClick={() => removeListItem('emails', i)}>Remover</button>
                </div>
              ))}
            </div>

            {/* Telefones */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Contatos</h3>
                <button className="btn" onClick={() => addItem('phones')}>+ Adicionar Contato</button>
              </div>
              {company.phones.map((p, i) => (
                <div key={i} className="flex gap-2 mt-2">
                  <input className="input flex-1" placeholder="(11) 99999-9999" value={p.phone} onChange={(ev) => updateListItem('phones', i, { ...p, phone: ev.target.value })} />
                  <label className="flex items-center gap-1"><input type="checkbox" checked={p.hasWhatsapp || false} onChange={(ev) => updateListItem('phones', i, { ...p, hasWhatsapp: ev.target.checked })} /> Whatsapp</label>
                  <label className="flex items-center gap-1"><input type="checkbox" checked={p.primary || false} onChange={(ev) => updateListItem('phones', i, { ...p, primary: ev.target.checked })} /> Primário</label>
                  <button className="btn-danger" onClick={() => removeListItem('phones', i)}>Remover</button>
                </div>
              ))}
            </div>

            {/* Redes sociais */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Redes Sociais</h3>
                <button className="btn" onClick={() => addItem('socials')}>+ Adicionar Rede</button>
              </div>
              {company.socials.map((s, i) => (
                <div key={i} className="flex gap-2 mt-2">
                  <input className="input w-48" placeholder="Plataforma" value={s.platform} onChange={(ev) => updateListItem('socials', i, { ...s, platform: ev.target.value })} />
                  <input className="input flex-1" placeholder="https://" value={s.url} onChange={(ev) => updateListItem('socials', i, { ...s, url: ev.target.value })} />
                  <button className="btn-danger" onClick={() => removeListItem('socials', i)}>Remover</button>
                </div>
              ))}
            </div>

            {/* Chaves Pix */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Chaves Pix</h3>
                <button className="btn" onClick={() => addItem('pixKeys')}>+ Adicionar Chave</button>
              </div>
              {company.pixKeys.map((k, i) => (
                <div key={i} className="flex gap-2 mt-2">
                  <input className="input flex-1" placeholder="Chave" value={k.key} onChange={(ev) => updateListItem('pixKeys', i, { ...k, key: ev.target.value })} />
                  <input className="input w-48" placeholder="Tipo (email, cpf, aleatória)" value={k.type || ''} onChange={(ev) => updateListItem('pixKeys', i, { ...k, type: ev.target.value })} />
                  <button className="btn-danger" onClick={() => removeListItem('pixKeys', i)}>Remover</button>
                </div>
              ))}
            </div>

            <div className="md:col-span-2 flex justify-end mt-4">
              <button className="btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Empresa'}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
