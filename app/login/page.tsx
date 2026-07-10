'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? 'Não foi possível entrar.');

      localStorage.setItem('imobconnect.session', JSON.stringify(data));
      window.location.href = '/dashboard';
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f5f7f6' }}>
      <section style={{ width: '100%', maxWidth: 440, background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 18px 60px rgba(15, 50, 40, 0.10)' }}>
        <Link href="/" style={{ color: '#176b52', fontWeight: 800, textDecoration: 'none' }}>ImobConnect</Link>
        <h1 style={{ margin: '24px 0 8px', fontSize: 32 }}>Entre na sua conta</h1>
        <p style={{ margin: '0 0 24px', color: '#62706b' }}>Acesse seus imóveis, leads e visitas.</p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>E-mail</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required style={{ padding: 14, border: '1px solid #d7dfdc', borderRadius: 10 }} />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Senha</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required style={{ padding: 14, border: '1px solid #d7dfdc', borderRadius: 10 }} />
          </label>
          {message && <p style={{ margin: 0, color: '#b42318' }}>{message}</p>}
          <button disabled={loading} style={{ border: 0, borderRadius: 10, padding: 15, background: '#176b52', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={{ marginBottom: 0, marginTop: 24, color: '#62706b' }}>
          Ainda não possui conta? <Link href="/cadastro">Cadastre-se</Link>
        </p>
      </section>
    </main>
  );
}
