'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api';

export default function CadastroPage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? 'Não foi possível criar a conta.');

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
      <section style={{ width: '100%', maxWidth: 560, background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 18px 60px rgba(15, 50, 40, 0.10)' }}>
        <Link href="/" style={{ color: '#176b52', fontWeight: 800, textDecoration: 'none' }}>ImobConnect</Link>
        <h1 style={{ margin: '24px 0 8px', fontSize: 32 }}>Crie sua conta</h1>
        <p style={{ margin: '0 0 24px', color: '#62706b' }}>Comece como corretor ou gestor de imobiliária.</p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input name="firstName" placeholder="Nome" required style={{ padding: 14, border: '1px solid #d7dfdc', borderRadius: 10 }} />
            <input name="lastName" placeholder="Sobrenome" required style={{ padding: 14, border: '1px solid #d7dfdc', borderRadius: 10 }} />
          </div>
          <input name="email" type="email" placeholder="E-mail" required style={{ padding: 14, border: '1px solid #d7dfdc', borderRadius: 10 }} />
          <input name="phone" placeholder="Telefone" style={{ padding: 14, border: '1px solid #d7dfdc', borderRadius: 10 }} />
          <input name="password" type="password" minLength={8} placeholder="Senha com pelo menos 8 caracteres" required style={{ padding: 14, border: '1px solid #d7dfdc', borderRadius: 10 }} />
          {message && <p style={{ margin: 0, color: '#b42318' }}>{message}</p>}
          <button disabled={loading} style={{ border: 0, borderRadius: 10, padding: 15, background: '#176b52', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p style={{ marginBottom: 0, marginTop: 24, color: '#62706b' }}>
          Já possui conta? <Link href="/login">Entrar</Link>
        </p>
      </section>
    </main>
  );
}
