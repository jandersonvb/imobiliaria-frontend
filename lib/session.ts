import { apiFetch } from './api-client';

export type Session = {
  user: { firstName: string; lastName: string; email: string };
};

export async function getSession(): Promise<Session | null> {
  localStorage.removeItem('imobconnect.session');
  try {
    const response = await apiFetch('/auth/me');
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function clearSession() {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } finally {
    localStorage.removeItem('imobconnect.session');
    localStorage.removeItem('imobconnect.agency');
  }
}
