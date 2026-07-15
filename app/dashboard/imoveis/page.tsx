'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getStoredSession } from '@/lib/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api';

type Property = {
  id: string;
  slug: string;
  code: string;
  title: string;
  city: string;
  state: string;
  status: string;
  purpose: string;
  salePrice?: string;
  rentPrice?: string;
  _count: { leads: number };
};

export default function PropertiesPage() {
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredSession();
    if (!stored) return void (window.location.href = '/login');
    fetch(`${API_URL}/properties/mine`, { headers: { Authorization: `Bearer ${stored.accessToken}` } })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then(setItems)
      .catch(() => { window.location.href = '/login'; })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ minHeight: '100vh', background: '#f5f7f6', padding: '40px 6vw' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <div><p style={{ color: '#176b52', fontWeight: 700, margin: 0 }}>CARTEIRA</p><h1 style={{ margin: '8px 0 0' }}>Meus imóveis</h1></div>
        <Link href="/dashboard/imoveis/novo" style={{ background: '#176b52', color: '#fff', padding: '12px 16px', borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>Novo imóvel</Link>
      </div>

      {loading ? <p>Carregando...</p> : items.length === 0 ? <p>Nenhum imóvel cadastrado.</p> : (
        <div style={{ display: 'grid', gap: 14 }}>
          {items.map((property) => (
            <article key={property.id} style={{ background: '#fff', padding: 20, borderRadius: 14, border: '1px solid #e4e9e7', display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'center' }}>
              <div>
                <small style={{ color: '#62706b' }}>{property.code} · {property.status}</small>
                <h2 style={{ margin: '6px 0' }}>{property.title}</h2>
                <span>{property.city}/{property.state} · {property._count.leads} leads</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {property.status === 'AVAILABLE' && <Link href={`/imovel/${property.slug}`}>Ver anúncio</Link>}
                <Link href={`/dashboard/imoveis/${property.id}/editar`}>Editar</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
