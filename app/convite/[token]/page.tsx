'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { apiFetch } from '@/lib/api-client';
export default function AcceptInvitationPage() {
  const { token } = useParams<{ token: string }>(); const [state, setState] = useState<'idle'|'loading'|'success'|'error'>('idle'); const [message, setMessage] = useState('');
  async function accept() { setState('loading'); const response = await apiFetch(`/agencies/invitations/${token}/accept`, { method: 'POST' }); const data = await response.json().catch(() => ({})); if (!response.ok) { setMessage(data.message ?? 'Entre com a conta do e-mail convidado e tente novamente.'); return setState('error'); } setState('success'); }
  return <main className="invite-accept"><section><p className="eyebrow">IMOBConnect</p><h1>Você foi convidado</h1><p>Entre para a equipe e acompanhe imóveis, leads, tarefas e visitas em um só lugar.</p>{state === 'success' ? <><div className="success-seal">✓ Convite aceito</div><Link className="crm-primary" href="/dashboard">Abrir painel</Link></> : <><button className="crm-primary" disabled={state === 'loading'} onClick={() => void accept()}>{state === 'loading' ? 'Aceitando...' : 'Aceitar convite'}</button>{state === 'error' && <><p className="error-text">{message}</p><Link href={`/login?next=${encodeURIComponent(`/convite/${token}`)}`}>Entrar com outra conta</Link></>}</>}</section></main>;
}
