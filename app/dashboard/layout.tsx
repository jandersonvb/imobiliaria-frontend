'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clearSession } from '@/lib/session';

const links = [
  { href: '/dashboard', label: 'Painel' },
  { href: '/dashboard/imoveis', label: 'Imóveis' },
  { href: '/dashboard/leads', label: 'Leads' },
  { href: '/dashboard/equipe', label: 'Equipe' },
];

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  function isActive(href: string) {
    return href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
  }

  async function logout() {
    await clearSession();
    window.location.href = '/login';
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7f6' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap', padding: '20px 6vw', background: '#fff', borderBottom: '1px solid #e4e9e7' }}>
        <Link href="/dashboard" style={{ color: '#176b52', fontWeight: 800, textDecoration: 'none', fontSize: 20 }}>ImobConnect</Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
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
