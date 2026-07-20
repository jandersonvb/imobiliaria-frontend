'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { getCurrentAgency } from '@/lib/current-agency';
import { getSession } from '@/lib/session';

type Member = { id: string; role: string; user: { id: string; firstName: string; lastName: string; email: string; phone?: string } };
type Invitation = { id: string; email: string; role: string; token: string; expiresAt: string };
type Agency = { id: string; name: string; members: { role: string }[] };
const roles: Record<string, string> = { OWNER: 'Proprietário', MANAGER: 'Gerente', BROKER: 'Corretor', ASSISTANT: 'Assistente' };

export default function TeamPage() {
  const [agency, setAgency] = useState<Agency | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('BROKER');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const canManage = ['OWNER', 'MANAGER'].includes(agency?.members[0]?.role ?? '');
  const load = useCallback(async () => {
    const agencyResponse = await apiFetch('/agencies/mine');
    if (agencyResponse.status === 401) return void (window.location.href = '/login');
    const agencies = await agencyResponse.json() as Agency[];
    const current = getCurrentAgency(agencies); setAgency(current);
    if (!current) return;
    const response = await apiFetch(`/agencies/${current.id}/members`);
    if (!response.ok) throw new Error();
    const data = await response.json() as { members: Member[]; invitations: Invitation[] };
    setMembers(data.members); setInvitations(data.invitations);
  }, []);
  useEffect(() => { void (async () => { if (!await getSession()) return void (window.location.href = '/login'); try { await load(); } catch { setMessage('Não foi possível carregar a equipe.'); } finally { setLoading(false); } })(); }, [load]);
  async function invite(event: React.FormEvent) {
    event.preventDefault(); if (!agency) return; setMessage('');
    const response = await apiFetch(`/agencies/${agency.id}/invitations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, role }) });
    const data = await response.json();
    if (!response.ok) return setMessage(Array.isArray(data.message) ? data.message.join(', ') : data.message ?? 'Não foi possível criar o convite.');
    setEmail(''); setMessage('Convite criado. Compartilhe o link com o novo membro.'); await load();
  }
  async function updateRole(memberId: string, nextRole: string) { if (!agency) return; const response = await apiFetch(`/agencies/${agency.id}/members/${memberId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: nextRole }) }); if (!response.ok) return setMessage('Não foi possível alterar a função.'); setMessage('Função atualizada.'); await load(); }
  async function removeMember(memberId: string) { if (!agency || !window.confirm('Remover este membro da imobiliária?')) return; const response = await apiFetch(`/agencies/${agency.id}/members/${memberId}`, { method: 'DELETE' }); if (!response.ok) return setMessage('Não foi possível remover o membro.'); setMessage('Membro removido.'); await load(); }
  async function revoke(invitationId: string) { if (!agency) return; await apiFetch(`/agencies/${agency.id}/invitations/${invitationId}`, { method: 'DELETE' }); await load(); }
  return <main className="crm-page"><div className="crm-heading"><div><p className="eyebrow">OPERAÇÃO</p><h1>Equipe comercial</h1><p>Organize quem atende, gerencia e acompanha cada oportunidade.</p></div><span className="team-count">{members.length} membro(s)</span></div>{message && <p className="crm-message" role="status">{message}</p>}{canManage && <form className="invite-panel" onSubmit={invite}><div><strong>Convidar para a equipe</strong><p>O convite fica disponível por sete dias.</p></div><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="corretor@imobiliaria.com.br"/><select value={role} onChange={(event) => setRole(event.target.value)}><option value="BROKER">Corretor</option><option value="MANAGER">Gerente</option><option value="ASSISTANT">Assistente</option></select><button className="crm-primary">Criar convite</button></form>}{loading ? <p>Carregando equipe...</p> : <section className="team-grid">{members.map((member) => <article className="team-card" key={member.id}><div className="avatar-mark">{member.user.firstName[0]}{member.user.lastName[0]}</div><div className="team-person"><strong>{member.user.firstName} {member.user.lastName}</strong><span>{member.user.email}</span>{member.user.phone && <small>{member.user.phone}</small>}</div>{member.role === 'OWNER' || !canManage ? <span className="role-pill">{roles[member.role]}</span> : <select value={member.role} onChange={(event) => void updateRole(member.id, event.target.value)}><option value="MANAGER">Gerente</option><option value="BROKER">Corretor</option><option value="ASSISTANT">Assistente</option></select>}{canManage && member.role !== 'OWNER' && <button className="text-danger" onClick={() => void removeMember(member.id)}>Remover</button>}</article>)}</section>}{canManage && invitations.length > 0 && <section className="pending-panel"><h2>Convites pendentes</h2>{invitations.map((item) => <div className="pending-row" key={item.id}><div><strong>{item.email}</strong><span>{roles[item.role]} · expira em {new Date(item.expiresAt).toLocaleDateString('pt-BR')}</span></div><code>{`${window.location.origin}/convite/${item.token}`}</code><button onClick={() => void navigator.clipboard.writeText(`${window.location.origin}/convite/${item.token}`)}>Copiar</button><button className="text-danger" onClick={() => void revoke(item.id)}>Revogar</button></div>)}</section>}</main>;
}
