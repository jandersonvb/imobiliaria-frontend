const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api';

export type Property = {
  id: string;
  slug: string;
  title: string;
  city: string;
  state: string;
  salePrice?: string;
  rentPrice?: string;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  totalArea?: string;
  neighborhood: string;
  purpose: 'SALE' | 'RENT' | 'SEASONAL';
  type: string;
  coverImageUrl?: string;
  agency: {
    id: string;
    name: string;
    slug: string;
    creci?: string;
  };
};

export type PropertySearchResult = {
  items: Property[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export type PropertyFilters = Record<string, string | number | boolean | undefined>;

export async function getProperties(filters: PropertyFilters = {}): Promise<PropertySearchResult> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });

  const response = await fetch(`${API_URL}/properties?${params.toString()}`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error('Não foi possível carregar os imóveis.');
  }

  return response.json();
}
