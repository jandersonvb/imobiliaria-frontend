'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api';

type Session = {
  user: { firstName: string; lastName: string; email: string };
  accessToken: string;
};

type Agency = {
  id: string;
  name: string;
  slug: string;
  members: { role: string }[];
  _count: { properties: number; leads: number; members: number };
};

export default function DashboardPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loadingAgency, setLoadingAgency] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem('imobconnect.session');
    if (!raw) {
      window.location.href = '/login';
      return;
    }

    const parsed = JSON.parse(raw) as Session;
    setSession(parsed);

    fetch(`${API_URL}/agencies/mine`, {
      headers: { Authorization: `Bearer ${parsed.accessToken}` },
    })
      .then(async (response) => {
        if (response.status === 401) {
          localStorage.removeItem('imobconnect.session');
          window.location.href = '/login';
          return [];
        }
        if (!response.ok) throw new Error('Não foi possível carregar a imobiliária.');
        return response.json();
      })
      .then((agencies: Agency[]) => setAgency(agencies[0] ?? null))
      .finally(() => setLoadingAgency(false));
  }, []);

  function logout() {
    localStorage.removeItem('imobconnect.session');
    localStorage.removeItem('imobconnect.agency');
    window.location.href = '/login';
  }

  if (!session) return <main style={{ padding: 40 }}>Carregando...</main>;

  const cards = [
    ['Imóveis cadastrados', agency?._count.properties ?? 0],
    ['Leads recebidos', agency?._count.leads ?? 0],
    ['Membros da equipe', agency?._count.members ?? 0],
    ['Visitas agendadas', 0],
  ];

  return (
    <main style={{ minHeight: '100vh', background: '#f5f7f6' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 6vw', background: '#fff', borderBottom: '1px solid #e4e9e7' }}>
        <Link href="/" style={{ color: '#176b52', fontWeight: 800, textDecoration: 'none', fontSize: 20 }}>ImobConnect</Link>
        <button onClick={logout} style={{ border: '1px solid #cfd8d4', borderRadius: 9, background: '#fff', padding: '10px 14px', cursor: 'pointer' }}>Sair</button>
      </header>

      <section style={{ padding: '48px 6vw' }}>
        <p style={{ color: '#176b52', fontWeight: 700, margin: 0 }}>PAINEL DA IMOBILIÁRIA</p>
        <h1 style={{ fontSize: 36, margin: '8px 0' }}>Olá, {session.user.firstName}</h1>
        <p style={{ color: '#62706b', marginTop: 0 }}>
          {agency ? `Gerenciando ${agency.name}.` : 'Organize sua operação imobiliária em um só lugar.'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 32 }}>
          {cards.map(([label, value]) => (
            <article key={label} style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e4e9e7' }}>
              <span style={{ color: '#62706b' }}>{label}</span>
              <strong style={{ display: 'block', fontSize: 36, marginTop: 10 }}>{value}</strong>
            </article>
          ))}
        </div>

        {!loadingAgency && !agency && (
          <section style={{ background: '#fff', borderRadius: 16, padding: 28, marginTop: 24, border: '1px solid #e4e9e7' }}>
            <h2 style={{ marginTop: 0 }}>Primeiro passo: cadastre sua imobiliária</h2>
            <p style={{ color: '#62706b' }}>Crie o perfil da empresa para liberar imóveis, equipe, leads e relatórios.</p>
            <Link href="/onboarding/imobiliaria" style={{ display: 'inline-block', borderRadius: 10, padding: '13px 18px', background: '#176b52', color: '#fff', fontWeight: 700, textDecoration: 'none' }}>
              Cadastrar imobiliária
            </Link>
          </section>
        )}

        {agency && (
          <section style={{ background: '#fff', borderRadius: 16, padding: 28, marginTop: 24, border: '1px solid #e4e9e7' }}>
            <h2 style={{ marginTop: 0 }}>Sua operação está pronta</h2>
            <p style={{ color: '#62706b' }}>O próximo passo é cadastrar o primeiro imóvel e começar a receber leads.</p>
            <Link href="/dashboard/imoveis/novo" style={{ display: 'inline-block', borderRadius: 10, padding: '13px 18px', background: '#176b52', color: '#fff', fontWeight: 700, textDecoration: 'none' }}>
              Cadastrar primeiro imóvel
            </Link>
          </section>
        )}
      </section>
    </main>
  );
}
