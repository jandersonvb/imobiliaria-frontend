'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { getCurrentAgency, setCurrentAgencyId, type AgencySummary } from '@/lib/current-agency';
import { clearSession } from '@/lib/session';

const links = [
  { href: '/dashboard', label: 'Painel' },
  { href: '/dashboard/imoveis', label: 'Imóveis' },
  { href: '/dashboard/leads', label: 'Leads' },
  { href: '/dashboard/equipe', label: 'Equipe' },
];

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [agencies, setAgencies] = useState<AgencySummary[]>([]);
  const [agencyId, setAgencyId] = useState('');

  useEffect(() => {
    void (async () => {
      const response = await apiFetch('/agencies/mine');
      if (!response.ok) return;
      const items = await response.json() as AgencySummary[];
      setAgencies(items);
      setAgencyId(getCurrentAgency(items)?.id ?? '');
    })();
  }, []);

  function isActive(href: string) {
    return href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
  }

  async function logout() {
    await clearSession();
    window.location.href = '/login';
  }

  function changeAgency(nextAgencyId: string) {
    setCurrentAgencyId(nextAgencyId);
    setAgencyId(nextAgencyId);
    window.location.reload();
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7f6' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap', padding: '20px 6vw', background: '#fff', borderBottom: '1px solid #e4e9e7' }}>
        <Link href="/dashboard" style={{ color: '#176b52', fontWeight: 800, textDecoration: 'none', fontSize: 20 }}>ImobConnect</Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
          {agencies.length > 1 && (
            <label style={{ display: 'grid', gap: 3, color: '#62706b', fontSize: 11 }}>
              IMOBILIÁRIA
              <select value={agencyId} onChange={(event) => changeAgency(event.target.value)} style={{ border: '1px solid #cfd8d4', borderRadius: 8, background: '#fff', padding: '8px 10px' }}>
                {agencies.map((agency) => <option key={agency.id} value={agency.id}>{agency.name}</option>)}
              </select>
            </label>
          )}
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{ textDecoration: 'none', color: isActive(link.href) ? '#176b52' : '#38433c', fontWeight: isActive(link.href) ? 700 : 400 }}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/" style={{ textDecoration: 'none', color: '#38433c' }}>Ver site</Link>
          <button onClick={() => void logout()} style={{ border: '1px solid #cfd8d4', borderRadius: 9, background: '#fff', padding: '10px 14px', cursor: 'pointer' }}>Sair</button>
        </nav>
      </header>
      {children}
    </div>
  );
}
