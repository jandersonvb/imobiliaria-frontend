'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { getStoredSession, type Session } from '@/lib/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api';

export default function AgencyOnboardingPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = getStoredSession();
    if (!stored) {
      window.location.href = '/login';
      return;
    }
    setSession(stored);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;

    setLoading(true);
    setError('');

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const response = await fetch(`${API_URL}/agencies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(Array.isArray(data.message) ? data.message.join(', ') : data.message);
      }

      localStorage.setItem('imobconnect.agency', JSON.stringify(data));
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível cadastrar a imobiliária.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f5f7f6', padding: '40px 20px' }}>
      <section style={{ width: '100%', maxWidth: 680, margin: '0 auto', background: '#fff', padding: 32, borderRadius: 18, border: '1px solid #e4e9e7' }}>
        <Link href="/dashboard" style={{ color: '#176b52', textDecoration: 'none', fontWeight: 700 }}>← Voltar ao painel</Link>
        <p style={{ color: '#176b52', fontWeight: 800, marginTop: 28 }}>CONFIGURAÇÃO INICIAL</p>
        <h1 style={{ fontSize: 34, margin: '6px 0 8px' }}>Cadastre sua imobiliária</h1>
        <p style={{ color: '#62706b', marginTop: 0 }}>Essas informações formarão o perfil público da sua empresa.</p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16, marginTop: 28 }}>
          <label>Nome da imobiliária<input name="name" required minLength={2} style={inputStyle} /></label>
          <label>CRECI<input name="creci" placeholder="Ex.: CRECI-MG 12345" style={inputStyle} /></label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <label>Telefone<input name="phone" style={inputStyle} /></label>
            <label>E-mail comercial<input name="email" type="email" style={inputStyle} /></label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 14 }}>
            <label>Cidade<input name="city" style={inputStyle} /></label>
            <label>UF<input name="state" maxLength={2} style={inputStyle} /></label>
          </div>

          {error && <p style={{ color: '#b42318', background: '#fef3f2', padding: 12, borderRadius: 8 }}>{error}</p>}

          <button disabled={loading} style={{ border: 0, borderRadius: 10, padding: '14px 18px', background: '#176b52', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
            {loading ? 'Cadastrando...' : 'Criar imobiliária'}
          </button>
        </form>
      </section>
    </main>
  );
}

const inputStyle = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box' as const,
  marginTop: 7,
  padding: '12px 13px',
  border: '1px solid #cfd8d4',
  borderRadius: 9,
  fontSize: 15,
};
