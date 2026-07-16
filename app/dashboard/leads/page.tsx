'use client';

import { useCallback, useEffect, useState } from 'react';
import { getStoredSession } from '@/lib/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api';
const stageLabels: Record<string, string> = {
  NEW: 'Novo', CONTACTED: 'Em contato', QUALIFIED: 'Qualificado',
  VISIT_SCHEDULED: 'Visita agendada', VISITED: 'Visitou', PROPOSAL_SENT: 'Proposta enviada',
  NEGOTIATION: 'Negociação', WON: 'Convertido', LOST: 'Perdido',
};

type Lead = {
  id: string; name: string; email?: string; phone?: string; message?: string; notes?: string;
  stage: string; createdAt: string;
  property?: { id: string; title: string; code: string; slug: string };
};
type LeadResponse = {
  items: Lead[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export default function LeadsPage() {
  const [items, setItems] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [stage, setStage] = useState('');
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [savingId, setSavingId] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async (accessToken: string) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (stage) params.set('stage', stage);
    if (appliedSearch) params.set('search', appliedSearch);

    try {
      const response = await fetch(`${API_URL}/leads/mine?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.status === 401) return void (window.location.href = '/login');
      if (!response.ok) throw new Error();
      const data = await response.json() as LeadResponse;
      setItems(data.items);
      setPagination(data.pagination);
    } catch {
      setMessage('Não foi possível carregar os leads.');
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, page, stage]);

  useEffect(() => {
    const stored = getStoredSession();
    if (!stored) return void (window.location.href = '/login');
    setToken(stored.accessToken);
    void load(stored.accessToken);
  }, [load]);

  function changeLocal(id: string, field: 'stage' | 'notes', value: string) {
    setItems((current) => current.map((lead) => lead.id === id ? { ...lead, [field]: value } : lead));
  }

  async function save(lead: Lead) {
    setSavingId(lead.id);
    setMessage('');
    try {
      const response = await fetch(`${API_URL}/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stage: lead.stage, notes: lead.notes ?? '' }),
      });
      if (!response.ok) throw new Error();
      setMessage('Lead atualizado com sucesso.');
    } catch {
      setMessage('Não foi possível atualizar o lead.');
    } finally {
      setSavingId('');
    }
  }

  function applyFilters(event: React.FormEvent) {
    event.preventDefault();
    setPage(1);
    setAppliedSearch(search.trim());
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f5f7f6', padding: '40px 6vw' }}>
      <p style={{ color: '#176b52', fontWeight: 700, margin: 0 }}>COMERCIAL</p>
      <h1 style={{ margin: '8px 0 8px' }}>Leads recebidos</h1>
      <p style={{ marginTop: 0, color: '#62706b' }}>{pagination.total} contato(s) encontrado(s)</p>

      <form onSubmit={applyFilters} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '24px 0' }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nome, contato ou imóvel" style={inputStyle} />
        <select value={stage} onChange={(e) => { setStage(e.target.value); setPage(1); }} style={inputStyle}>
          <option value="">Todas as etapas</option>
          {Object.entries(stageLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
        </select>
        <button style={primaryButton}>Buscar</button>
      </form>

      {message && <p role="status" style={{ color: message.includes('sucesso') ? '#176b52' : '#b42318' }}>{message}</p>}
      {loading ? <p>Carregando...</p> : items.length === 0 ? <p>Nenhum lead encontrado.</p> : (
        <div style={{ display: 'grid', gap: 14 }}>
          {items.map((lead) => (
            <article key={lead.id} style={{ background: '#fff', border: '1px solid #e4e9e7', borderRadius: 14, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <small style={{ color: '#62706b' }}>{new Date(lead.createdAt).toLocaleString('pt-BR')}</small>
                  <h2 style={{ margin: '6px 0' }}>{lead.name}</h2>
                  {lead.property && <a href={`/imovel/${lead.property.slug}`} style={{ color: '#176b52' }}>{lead.property.code} · {lead.property.title}</a>}
                </div>
                <div style={{ textAlign: 'right', display: 'grid', gap: 5 }}>
                  {lead.phone && <a href={`https://wa.me/${lead.phone.startsWith('55') ? lead.phone : `55${lead.phone}`}`} target="_blank" rel="noreferrer">WhatsApp: {lead.phone}</a>}
                  {lead.email && <a href={`mailto:${lead.email}`}>{lead.email}</a>}
                </div>
              </div>
              {lead.message && <p style={{ paddingTop: 14, borderTop: '1px solid #eef2f0', color: '#46534f' }}>{lead.message}</p>}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 220px) minmax(260px, 1fr) auto', gap: 12, alignItems: 'end', marginTop: 16 }}>
                <label style={{ display: 'grid', gap: 6 }}>Etapa
                  <select value={lead.stage} onChange={(e) => changeLocal(lead.id, 'stage', e.target.value)} style={inputStyle}>
                    {Object.entries(stageLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                  </select>
                </label>
                <label style={{ display: 'grid', gap: 6 }}>Observações internas
                  <textarea value={lead.notes ?? ''} maxLength={5000} onChange={(e) => changeLocal(lead.id, 'notes', e.target.value)} style={{ ...inputStyle, minHeight: 70 }} />
                </label>
                <button disabled={savingId === lead.id} onClick={() => void save(lead)} style={primaryButton}>{savingId === lead.id ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && <nav aria-label="Paginação" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 24 }}>
        <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} style={secondaryButton}>Anterior</button>
        <span>Página {page} de {pagination.totalPages}</span>
        <button disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)} style={secondaryButton}>Próxima</button>
      </nav>}
    </main>
  );
}

const inputStyle = { padding: 10, borderRadius: 8, border: '1px solid #d7dfdc', font: 'inherit' };
const primaryButton = { padding: '11px 16px', border: 0, borderRadius: 9, background: '#176b52', color: '#fff', fontWeight: 700, cursor: 'pointer' };
const secondaryButton = { padding: '9px 14px', border: '1px solid #ccd7d3', borderRadius: 9, background: '#fff', cursor: 'pointer' };
