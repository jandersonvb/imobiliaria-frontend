import Link from 'next/link';
import { Building2, MapPin, Search } from 'lucide-react';
import { PropertyCard } from '@/components/PropertyCard';
import { getProperties } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { items: properties } = await getProperties({ featured: true, limit: 6 });

  return (
    <main>
      <header className="header container">
        <Link className="brand" href="/"><Building2 size={28} /><span>ImobConnect</span></Link>
        <nav>
          <Link href="/imoveis">Imóveis</Link>
          <Link href="/cadastro">Para imobiliárias</Link>
          <Link className="outline-button" href="/login">Entrar</Link>
        </nav>
      </header>

      <section className="hero">
        <div className="container hero-content">
          <p className="eyebrow">Seu próximo imóvel começa aqui</p>
          <h1>Encontre o lugar ideal para viver ou investir</h1>
          <p className="hero-text">Pesquise imóveis disponíveis e fale diretamente com a imobiliária responsável.</p>

          <form className="search-box" action="/imoveis" method="get">
            <label><span>Finalidade</span><select name="purpose" defaultValue="SALE"><option value="SALE">Comprar</option><option value="RENT">Alugar</option><option value="SEASONAL">Temporada</option></select></label>
            <label className="location-field"><span>Localização</span><div><MapPin size={18} /><input name="q" placeholder="Cidade, bairro ou imóvel" /></div></label>
            <label><span>Tipo</span><select name="type" defaultValue=""><option value="">Todos os imóveis</option><option value="APARTMENT">Apartamento</option><option value="HOUSE">Casa</option><option value="LAND">Terreno</option><option value="RURAL">Imóvel rural</option><option value="COMMERCIAL">Comercial</option></select></label>
            <button className="primary-button" type="submit"><Search size={19} /> Buscar</button>
          </form>
        </div>
      </section>

      <section className="container properties-section" id="imoveis">
        <div className="section-heading"><div><p className="eyebrow">Seleção especial</p><h2>Imóveis em destaque</h2></div><Link href="/imoveis">Ver todos</Link></div>
        {properties.length ? <div className="property-grid">{properties.map((property) => <PropertyCard key={property.id} property={property} />)}</div> : <div className="empty-state"><h3>Nenhum imóvel em destaque ainda</h3><p>Veja todos os imóveis disponíveis ou volte em breve.</p><Link className="primary-button" href="/imoveis">Explorar imóveis</Link></div>}
      </section>
    </main>
  );
}
