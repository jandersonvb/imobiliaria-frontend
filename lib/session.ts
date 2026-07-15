export type Session = {
  user: { firstName: string; lastName: string; email: string };
  accessToken: string;
};

const SESSION_KEY = 'imobconnect.session';

export function getStoredSession(): Session | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Session;
    if (!parsed?.accessToken || !parsed?.user) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('imobconnect.agency');
}
