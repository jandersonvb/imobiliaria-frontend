export type AgencySummary = {
  id: string;
  name: string;
};

const STORAGE_KEY = 'imobconnect.agency';

export function getCurrentAgency<T extends AgencySummary>(agencies: T[]): T | null {
  if (!agencies.length) return null;

  const stored = readStoredAgencyId();
  const current = agencies.find((agency) => agency.id === stored) ?? agencies[0];
  localStorage.setItem(STORAGE_KEY, current.id);
  return current;
}

export function setCurrentAgencyId(agencyId: string) {
  localStorage.setItem(STORAGE_KEY, agencyId);
}

function readStoredAgencyId(): string | null {
  const value = localStorage.getItem(STORAGE_KEY);
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as string | { id?: string };
    return typeof parsed === 'string' ? parsed : parsed.id ?? null;
  } catch {
    return value;
  }
}
