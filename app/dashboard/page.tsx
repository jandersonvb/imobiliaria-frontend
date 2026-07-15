'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { clearSession, getStoredSession, type Session } from '@/lib/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api';

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
    const stored = getStoredSession();
    if (!stored) {
      window.location.href = '/login';
      return;
    }

    setSession(stored);

    fetch(`${API_URL}/agencies/mine`, {
      headers: { Authorization: `Bearer ${stored.accessToken}` },
    })
      .then(async (response) => {
        if (response.status === 401) {
          clearSession();
          window.location.href = '/login';
          return [];
        }
        if (!response.ok) throw new Error('Não foi possível carregar a imobiliária.');
        return response.json();
      })
      .then((agencies: Agency[]) => setAgency(agencies[0] ?? null))
      .catch(() => setAgency(null))
      .finally(() => setLoadingAgency(false));
  }, []);

  if (!session) return <main style={{ padding: 40 }}>Redirecionando para o login...</main>;

  const cards: { label: string; value: number; href?: string }[] = [
    { label: 'Imóveis cadastrados', value: agency?._count.properties ?? 0, href: '/dashboard/imoveis' },
    { label: 'Leads recebidos', value: agency?._count.leads ?? 0, href: '/dashboard/leads' },
    { label: 'Membros da equipe', value: agency?._count.members ?? 0 },
    { label: 'Visitas agendadas', value: 0 },
  ];

  return (
    <main>
      <section style={{ padding: '48px 6vw' }}>
        <p style={{ color: '#176b52', fontWeight: 700, margin: 0 }}>PAINEL DA IMOBILIÁRIA</p>
        <h1 style={{ fontSize: 36, margin: '8px 0' }}>Olá, {session.user.firstName}</h1>
        <p style={{ color: '#62706b', marginTop: 0 }}>
          {agency ? `Gerenciando ${agency.name}.` : 'Organize sua operação imobiliária em um só lugar.'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 32 }}>
          {cards.map((card) => {
            const content = (
              <article style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e4e9e7', height: '100%' }}>
                <span style={{ color: '#62706b' }}>{card.label}</span>
                <strong style={{ display: 'block', fontSize: 36, marginTop: 10, color: '#17211b' }}>{card.value}</strong>
              </article>
            );
            return card.href ? (
              <Link key={card.label} href={card.href} style={{ textDecoration: 'none' }}>
                {content}
              </Link>
            ) : (
              <div key={card.label}>{content}</div>
            );
          })}
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
