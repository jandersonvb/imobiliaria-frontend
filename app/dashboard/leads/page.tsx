'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api';

type Lead = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  stage: string;
  createdAt: string;
  property?: { title: string; code: string; slug: string };
};

export default function LeadsPage() {
  const [items, setItems] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem('imobconnect.session');
    if (!raw) return void (window.location.href = '/login');
    const { accessToken } = JSON.parse(raw);
    fetch(`${API_URL}/leads/mine`, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then(setItems)
      .catch(() => { window.location.href = '/login'; })
      .finally(() => setLoading(false));
  }, []);

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
                  <small style={{ color: '#62706b' }}>{lead.stage} · {new Date(lead.createdAt).toLocaleString('pt-BR')}</small>
                  <h2 style={{ margin: '6px 0' }}>{lead.name}</h2>
                  {lead.property && <p style={{ margin: 0, color: '#46534f' }}>{lead.property.code} · {lead.property.title}</p>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  {lead.phone && <div>{lead.phone}</div>}
                  {lead.email && <div>{lead.email}</div>}
                </div>
              </div>
              {lead.message && <p style={{ marginBottom: 0, paddingTop: 14, borderTop: '1px solid #eef2f0', color: '#46534f' }}>{lead.message}</p>}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
