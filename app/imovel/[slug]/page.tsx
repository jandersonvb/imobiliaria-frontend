import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LeadForm } from './LeadForm';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api';

type Property = {
  id: string;
  title: string;
  description: string;
  purpose: 'SALE' | 'RENT' | 'SEASONAL';
  type: string;
  salePrice?: string;
  rentPrice?: string;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  totalArea?: string;
  neighborhood: string;
  city: string;
  state: string;
  coverImageUrl?: string;
  images: { id: string; url: string; isCover: boolean; sortOrder: number }[];
  agency: { name: string; creci?: string; phone?: string; email?: string };
};

function money(value?: string) {
  if (!value) return 'Consulte';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const response = await fetch(`${API_URL}/properties/${slug}`, { cache: 'no-store' });
  if (!response.ok) notFound();
  const property = (await response.json()) as Property;
  const price = property.purpose === 'RENT' ? property.rentPrice : property.salePrice;
  const gallery = property.images?.length
    ? property.images
    : property.coverImageUrl
      ? [{ id: 'cover', url: property.coverImageUrl, isCover: true, sortOrder: 0 }]
      : [];

  return (
    <main style={{ minHeight: '100vh', background: '#f5f7f6' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '20px 6vw', background: '#fff', borderBottom: '1px solid #e4e9e7' }}>
        <Link href="/" style={{ color: '#176b52', fontWeight: 800, textDecoration: 'none', fontSize: 20 }}>ImobConnect</Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <Link href="/#imoveis" style={{ textDecoration: 'none', color: '#38433c' }}>Ver mais imóveis</Link>
          <Link href="/login" style={{ textDecoration: 'none', color: '#176b52', fontWeight: 700 }}>Área da imobiliária</Link>
        </nav>
      </header>

      <div style={{ padding: '40px 6vw', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(300px, 380px)', gap: 28, alignItems: 'start' }}>
        <section>
          {gallery.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: gallery.length > 1 ? '2fr 1fr' : '1fr', gap: 12, marginBottom: 24 }}>
              <img src={gallery[0].url} alt={property.title} style={{ width: '100%', height: 430, objectFit: 'cover', borderRadius: 20 }} />
              {gallery.length > 1 && (
                <div style={{ display: 'grid', gap: 12 }}>
                  {gallery.slice(1, 3).map((image) => <img key={image.id} src={image.url} alt="" style={{ width: '100%', height: 209, objectFit: 'cover', borderRadius: 16 }} />)}
                </div>
              )}
            </div>
          ) : <div style={{ minHeight: 420, borderRadius: 20, background: '#dfe8e4', marginBottom: 24 }} />}

          {gallery.length > 3 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
              {gallery.slice(3).map((image) => <img key={image.id} src={image.url} alt="" style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 14 }} />)}
            </div>
          )}

          <p style={{ margin: 0, color: '#176b52', fontWeight: 700 }}>{property.neighborhood} · {property.city}/{property.state}</p>
          <h1 style={{ fontSize: 40, margin: '10px 0' }}>{property.title}</h1>
          <strong style={{ fontSize: 30, color: '#176b52' }}>{money(price)}</strong>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, margin: '24px 0' }}>
            {property.bedrooms !== undefined && <span>{property.bedrooms} quartos</span>}
            {property.bathrooms !== undefined && <span>{property.bathrooms} banheiros</span>}
            {property.parkingSpaces !== undefined && <span>{property.parkingSpaces} vagas</span>}
            {property.totalArea && <span>{property.totalArea} m²</span>}
          </div>

          <article style={{ background: '#fff', border: '1px solid #e4e9e7', borderRadius: 16, padding: 28 }}>
            <h2 style={{ marginTop: 0 }}>Sobre o imóvel</h2>
            <p style={{ whiteSpace: 'pre-line', lineHeight: 1.7, color: '#46534f' }}>{property.description}</p>
          </article>
        </section>

        <aside style={{ background: '#fff', border: '1px solid #e4e9e7', borderRadius: 16, padding: 24, position: 'sticky', top: 24 }}>
          <h2 style={{ marginTop: 0 }}>Fale com a imobiliária</h2>
          <p style={{ color: '#62706b' }}>{property.agency.name}{property.agency.creci ? ` · CRECI ${property.agency.creci}` : ''}</p>
          <LeadForm propertyId={property.id} />
        </aside>
      </div>
    </main>
  );
}
