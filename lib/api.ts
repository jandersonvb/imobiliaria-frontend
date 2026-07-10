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
  coverImageUrl?: string;
  agency: {
    id: string;
    name: string;
    slug: string;
    creci?: string;
  };
};

export async function getProperties(): Promise<Property[]> {
  const response = await fetch(`${API_URL}/properties`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error('Não foi possível carregar os imóveis.');
  }

  return response.json();
}
