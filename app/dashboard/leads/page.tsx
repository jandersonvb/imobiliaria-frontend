'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api';
const stages = ['NEW', 'CONTACTED', 'QUALIFIED', 'VISIT_SCHEDULED', 'VISITED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST'];

type Lead = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  notes?: string;
  stage: string;
  createdAt: string;
  property?: { title: string; code: string; slug: string };
};

export default function LeadsPage() {
  const [items, setItems] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('imobconnect.session');
    if (!raw) return void (window.location.href = '/login');
    const { accessToken } = JSON.parse(raw);
    setToken(accessToken);
    fetch(`${API_URL}/leads/mine`, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then(setItems)
      .catch(() => { window.location.href = '/login'; })
      .finally(() => setLoading(false));
  }, []);

  function changeLocal(id: string, field: 'stage' | 'notes', value: string) {
    setItems((current) => current.map((lead) => lead.id === id ? { ...lead, [field]: value } : lead));
  }

  async function save(lead: Lead) {
    const response = await fetch(`${API_URL}/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ stage: lead.stage, notes: lead.notes ?? '' }),
    });
    if (!response.ok) alert('Não foi possível atualizar o lead.');
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f5f7f6', padding: '40px 6vw' }}>
      <p style={{ color: '#176b52', fontWeight: 700, margin: 0 }}>COMERCIAL</p>
      <h1 style={{ margin: '8px 0 28px' }}>Leads recebidos</h1>

      {loading ? <p>Carregando...</p> : items.length === 0 ? <p>Nenhum lead recebido ainda.</p> : (
        <div style={{ display: 'grid', gap: 14 }}>
          {items.map((lead) => (
            <article key={lead.id} style={{ background: '#fff', border: '1px solid #e4e9e7', borderRadius: 14, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <small style={{ color: '#62706b' }}>{new Date(lead.createdAt).toLocaleString('pt-BR')}</small>
                  <h2 style={{ margin: '6px 0' }}>{lead.name}</h2>
                  {lead.property && <p style={{ margin: 0, color: '#46534f' }}>{lead.property.code} · {lead.property.title}</p>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  {lead.phone && <div>{lead.phone}</div>}
                  {lead.email && <div>{lead.email}</div>}
                </div>
              </div>
              {lead.message && <p style={{ paddingTop: 14, borderTop: '1px solid #eef2f0', color: '#46534f' }}>{lead.message}</p>}
              <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr auto', gap: 12, alignItems: 'end', marginTop: 16 }}>
                <label style={{ display: 'grid', gap: 6 }}>Etapa
                  <select value={lead.stage} onChange={(e) => changeLocal(lead.id, 'stage', e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid #d7dfdc' }}>
                    {stages.map((stage) => <option key={stage}>{stage}</option>)}
                  </select>
                </label>
                <label style={{ display: 'grid', gap: 6 }}>Observações internas
                  <textarea value={lead.notes ?? ''} onChange={(e) => changeLocal(lead.id, 'notes', e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid #d7dfdc', minHeight: 70 }} />
                </label>
                <button onClick={() => save(lead)} style={{ padding: '11px 16px', border: 0, borderRadius: 9, background: '#176b52', color: '#fff', fontWeight: 700 }}>Salvar</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
