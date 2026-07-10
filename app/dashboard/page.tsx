'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Session = {
  user: { firstName: string; lastName: string; email: string };
  accessToken: string;
};

export default function DashboardPage() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('imobconnect.session');
    if (!raw) {
      window.location.href = '/login';
      return;
    }

    setSession(JSON.parse(raw) as Session);
  }, []);

  function logout() {
    localStorage.removeItem('imobconnect.session');
    window.location.href = '/login';
  }

  if (!session) return <main style={{ padding: 40 }}>Carregando...</main>;

  const cards = [
    ['Imóveis ativos', '0'],
    ['Novos leads', '0'],
    ['Visitas agendadas', '0'],
    ['Propostas abertas', '0'],
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
        <p style={{ color: '#62706b', marginTop: 0 }}>Organize sua operação imobiliária em um só lugar.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 32 }}>
          {cards.map(([label, value]) => (
            <article key={label} style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e4e9e7' }}>
              <span style={{ color: '#62706b' }}>{label}</span>
              <strong style={{ display: 'block', fontSize: 36, marginTop: 10 }}>{value}</strong>
            </article>
          ))}
        </div>

        <section style={{ background: '#fff', borderRadius: 16, padding: 28, marginTop: 24, border: '1px solid #e4e9e7' }}>
          <h2 style={{ marginTop: 0 }}>Primeiros passos</h2>
          <p style={{ color: '#62706b' }}>Cadastre sua imobiliária, adicione sua equipe e publique o primeiro imóvel.</p>
          <button style={{ border: 0, borderRadius: 10, padding: '13px 18px', background: '#176b52', color: '#fff', fontWeight: 700 }}>Cadastrar imobiliária</button>
        </section>
      </section>
    </main>
  );
}
