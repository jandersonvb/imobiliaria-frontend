import Image from 'next/image';
import Link from 'next/link';
import { Bath, BedDouble, Car, MapPin, Ruler } from 'lucide-react';
import type { Property } from '@/lib/api';

function money(value?: string) {
  if (!value) return 'Consulte';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Number(value));
}

export function PropertyCard({ property }: { property: Property }) {
  const price = property.purpose === 'RENT' ? property.rentPrice : property.salePrice;
  return (
    <article className="property-card">
      <Link className="property-card-link" href={`/imovel/${property.slug}`}>
        <div className="property-image">
          {property.coverImageUrl ? <Image src={property.coverImageUrl} alt={property.title} fill sizes="(max-width: 760px) 100vw, 33vw" /> : <span className="property-placeholder">Sem foto</span>}
          <span className="property-purpose">{property.purpose === 'RENT' ? 'Aluguel' : property.purpose === 'SEASONAL' ? 'Temporada' : 'Venda'}</span>
        </div>
        <div className="property-content">
          <p className="property-price">{money(price)}</p>
          <h3>{property.title}</h3>
          <p className="property-location"><MapPin size={16} /> {property.neighborhood}, {property.city}/{property.state}</p>
          <div className="property-features">
            {property.bedrooms !== undefined && <span><BedDouble size={15} />{property.bedrooms}</span>}
            {property.bathrooms !== undefined && <span><Bath size={15} />{property.bathrooms}</span>}
            {property.parkingSpaces !== undefined && <span><Car size={15} />{property.parkingSpaces}</span>}
            {property.totalArea && <span><Ruler size={15} />{property.totalArea} m²</span>}
          </div>
          <small>{property.agency.name}</small>
        </div>
      </Link>
    </article>
  );
}
