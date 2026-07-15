import Link from 'next/link';
import { Building2, Search } from 'lucide-react';
import { PropertyCard } from '@/components/PropertyCard';
import { getProperties } from '@/lib/api';

type SearchParams = Record<string, string | string[] | undefined>;

export const dynamic = 'force-dynamic';

function value(params: SearchParams, key: string) {
  const current = params[key];
  return Array.isArray(current) ? current[0] ?? '' : current ?? '';
}

export default async function PropertiesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const filters = {
    q: value(params, 'q'), city: value(params, 'city'), state: value(params, 'state'),
    purpose: value(params, 'purpose'), type: value(params, 'type'),
    minPrice: value(params, 'minPrice'), maxPrice: value(params, 'maxPrice'), page: value(params, 'page') || '1', limit: 12,
  };
  const result = await getProperties(filters);
  const pageQuery = (page: number) => {
    const query = new URLSearchParams(Object.entries(filters).filter(([, item]) => item !== '').map(([key, item]) => [key, String(item)]));
    query.set('page', String(page));
    return `/imoveis?${query.toString()}`;
  };

  return (
    <main className="search-page">
      <header className="header container"><Link className="brand" href="/"><Building2 size={28} /><span>ImobConnect</span></Link><nav><Link href="/cadastro">Anuncie seus imóveis</Link><Link className="outline-button" href="/login">Entrar</Link></nav></header>
      <section className="search-results-header"><div className="container"><p className="eyebrow">BUSCA DE IMÓVEIS</p><h1>Encontre seu próximo imóvel</h1>
        <form className="filters" method="get">
          <label className="filter-wide"><span>Busca</span><input name="q" defaultValue={filters.q} placeholder="Cidade, bairro, código ou palavra-chave" /></label>
          <label><span>Finalidade</span><select name="purpose" defaultValue={filters.purpose}><option value="">Todas</option><option value="SALE">Comprar</option><option value="RENT">Alugar</option><option value="SEASONAL">Temporada</option></select></label>
          <label><span>Tipo</span><select name="type" defaultValue={filters.type}><option value="">Todos</option><option value="HOUSE">Casa</option><option value="APARTMENT">Apartamento</option><option value="LAND">Terreno</option><option value="COMMERCIAL">Comercial</option><option value="RURAL">Rural</option></select></label>
          <label><span>Preço mínimo</span><input name="minPrice" type="number" min="0" defaultValue={filters.minPrice} /></label>
          <label><span>Preço máximo</span><input name="maxPrice" type="number" min="0" defaultValue={filters.maxPrice} /></label>
          <button className="primary-button" type="submit"><Search size={18} /> Filtrar</button>
        </form>
      </div></section>
      <section className="container properties-section">
        <div className="results-summary"><h2>{result.pagination.total} {result.pagination.total === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}</h2>{Object.values(filters).some((item) => item && item !== '1' && item !== 12) && <Link href="/imoveis">Limpar filtros</Link>}</div>
        {result.items.length ? <div className="property-grid">{result.items.map((property) => <PropertyCard key={property.id} property={property} />)}</div> : <div className="empty-state"><h3>Nenhum imóvel encontrado</h3><p>Tente remover alguns filtros ou buscar outra localização.</p><Link href="/imoveis">Limpar busca</Link></div>}
        {result.pagination.totalPages > 1 && <nav className="pagination" aria-label="Paginação">{result.pagination.page > 1 && <Link href={pageQuery(result.pagination.page - 1)}>Anterior</Link>}<span>Página {result.pagination.page} de {result.pagination.totalPages}</span>{result.pagination.page < result.pagination.totalPages && <Link href={pageQuery(result.pagination.page + 1)}>Próxima</Link>}</nav>}
      </section>
    </main>
  );
}
