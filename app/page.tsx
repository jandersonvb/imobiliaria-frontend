import Link from 'next/link';
import { Building2, MapPin, Search } from 'lucide-react';

const properties = [
  {
    id: 1,
    title: 'Apartamento moderno no centro',
    location: 'Poços de Caldas, MG',
    price: 'R$ 480.000',
    details: '3 quartos • 2 banheiros • 2 vagas',
  },
  {
    id: 2,
    title: 'Casa com amplo quintal',
    location: 'Itajubá, MG',
    price: 'R$ 690.000',
    details: '4 quartos • 3 banheiros • 240 m²',
  },
  {
    id: 3,
    title: 'Chácara com vista para as montanhas',
    location: 'São Lourenço, MG',
    price: 'R$ 1.150.000',
    details: '5 quartos • piscina • 3.000 m²',
  },
];

export default function Home() {
  return (
    <main>
      <header className="header container">
        <Link className="brand" href="/">
          <Building2 size={28} />
          <span>ImobConnect</span>
        </Link>
        <nav>
          <a href="#imoveis">Imóveis</a>
          <Link href="/cadastro">Para imobiliárias</Link>
          <Link className="outline-button" href="/login">Entrar</Link>
        </nav>
      </header>

      <section className="hero">
        <div className="container hero-content">
          <p className="eyebrow">Seu próximo imóvel começa aqui</p>
          <h1>Encontre o lugar ideal para viver ou investir</h1>
          <p className="hero-text">
            Pesquise imóveis verificados, fale diretamente com corretores e acompanhe visitas e propostas em um só lugar.
          </p>

          <form className="search-box">
            <label>
              <span>Finalidade</span>
              <select defaultValue="SALE">
                <option value="SALE">Comprar</option>
                <option value="RENT">Alugar</option>
              </select>
            </label>
            <label className="location-field">
              <span>Localização</span>
              <div>
                <MapPin size={18} />
                <input placeholder="Cidade ou bairro" />
              </div>
            </label>
            <label>
              <span>Tipo</span>
              <select defaultValue="">
                <option value="">Todos os imóveis</option>
                <option value="APARTMENT">Apartamento</option>
                <option value="HOUSE">Casa</option>
                <option value="LAND">Terreno</option>
                <option value="RURAL">Imóvel rural</option>
              </select>
            </label>
            <button className="primary-button" type="submit">
              <Search size={19} /> Buscar
            </button>
          </form>
        </div>
      </section>

      <section className="container properties-section" id="imoveis">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Seleção especial</p>
            <h2>Imóveis em destaque</h2>
          </div>
          <a href="#imoveis">Ver todos</a>
        </div>

        <div className="property-grid">
          {properties.map((property) => (
            <article className="property-card" key={property.id}>
              <div className="property-image">
                <span>Destaque</span>
              </div>
              <div className="property-content">
                <p className="property-price">{property.price}</p>
                <h3>{property.title}</h3>
                <p className="property-location">
                  <MapPin size={16} /> {property.location}
                </p>
                <p className="property-details">{property.details}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
