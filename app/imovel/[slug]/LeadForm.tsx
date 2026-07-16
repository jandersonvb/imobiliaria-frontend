'use client';

import { FormEvent, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api';

export function LeadForm({ propertyId }: { propertyId: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setError('');
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const phone = String(form.get('phone') ?? '').trim();
    if (!email && !phone) {
      setError('Informe seu e-mail ou WhatsApp.');
      setStatus('error');
      return;
    }

    let response: Response;
    try {
      response = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          name: form.get('name'),
          email: email || undefined,
          phone: phone || undefined,
          message: form.get('message') || undefined,
          privacyAccepted: form.get('privacyAccepted') === 'on',
          website: form.get('website') || undefined,
        }),
      });
    } catch {
      setError('Não foi possível conectar ao servidor. Tente novamente em instantes.');
      setStatus('error');
      return;
    }

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(Array.isArray(data?.message) ? data.message.join(', ') : data?.message ?? 'Não foi possível enviar seu contato.');
      setStatus('error');
      return;
    }

    event.currentTarget.reset();
    setStatus('success');
  }

  const inputStyle = { width: '100%', padding: 12, border: '1px solid #d9e0dd', borderRadius: 10, font: 'inherit' };

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
      <input name="name" required minLength={2} placeholder="Seu nome" style={inputStyle} />
      <input name="email" type="email" placeholder="Seu e-mail" maxLength={254} style={inputStyle} />
      <input name="phone" placeholder="Seu WhatsApp" minLength={8} maxLength={30} style={inputStyle} />
      <textarea name="message" rows={4} defaultValue="Tenho interesse neste imóvel e gostaria de mais informações." style={inputStyle} />
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-10000px' }} />
      <label style={{ display: 'flex', gap: 9, alignItems: 'flex-start', color: '#46534f', fontSize: 14 }}>
        <input name="privacyAccepted" type="checkbox" required style={{ marginTop: 3 }} />
        Autorizo a imobiliária responsável pelo anúncio a entrar em contato pelos dados informados.
      </label>
      <button disabled={status === 'loading'} style={{ border: 0, borderRadius: 10, padding: 14, background: '#176b52', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
        {status === 'loading' ? 'Enviando...' : 'Tenho interesse'}
      </button>
      {status === 'success' && <p style={{ margin: 0, color: '#176b52' }}>Contato enviado. A imobiliária poderá falar com você em breve.</p>}
      {status === 'error' && <p style={{ margin: 0, color: '#b42318' }}>{error}</p>}
    </form>
  );
}
