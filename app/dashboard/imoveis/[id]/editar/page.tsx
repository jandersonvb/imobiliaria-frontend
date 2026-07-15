'use client';

import Link from 'next/link';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { getStoredSession } from '@/lib/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api';
const inputStyle = { width: '100%', padding: 12, border: '1px solid #d7dfdc', borderRadius: 9 };

type ImageItem = { id: string; url: string; isCover: boolean; sortOrder: number };
type Property = {
  id: string; code: string; title: string; description: string; purpose: string; type: string; status: string;
  salePrice?: string; rentPrice?: string; bedrooms?: number; bathrooms?: number; parkingSpaces?: number;
  totalArea?: string; neighborhood: string; city: string; state: string; isFeatured: boolean; images: ImageItem[];
};

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState('');
  const [token, setToken] = useState('');
  const [property, setProperty] = useState<Property | null>(null);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    params.then(({ id }) => {
      setId(id);
      const stored = getStoredSession();
      if (!stored) return void (window.location.href = '/login');
      setToken(stored.accessToken);
      fetch(`${API_URL}/properties/mine/${id}`, { headers: { Authorization: `Bearer ${stored.accessToken}` } })
        .then((r) => r.ok ? r.json() : Promise.reject())
        .then(setProperty)
        .catch(() => setMessage('Não foi possível carregar o imóvel.'));
    });
  }, [params]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!property) return;
    setMessage('Salvando...');
    const body = {
      code: property.code, title: property.title, description: property.description,
      purpose: property.purpose, type: property.type, status: property.status,
      salePrice: property.salePrice ? Number(property.salePrice) : undefined,
      rentPrice: property.rentPrice ? Number(property.rentPrice) : undefined,
      bedrooms: property.bedrooms, bathrooms: property.bathrooms, parkingSpaces: property.parkingSpaces,
      totalArea: property.totalArea ? Number(property.totalArea) : undefined,
      neighborhood: property.neighborhood, city: property.city, state: property.state,
      isFeatured: property.isFeatured,
    };
    const response = await fetch(`${API_URL}/properties/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body),
    });
    setMessage(response.ok ? 'Imóvel atualizado.' : 'Não foi possível salvar.');
  }

  async function uploadImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length || !property) return;
    setUploading(true);
    setMessage('Enviando imagens...');

    try {
      const uploaded: ImageItem[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(`${API_URL}/properties/${id}/images/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!response.ok) throw new Error();
        uploaded.push(await response.json());
      }
      setProperty({ ...property, images: [...property.images, ...uploaded] });
      setMessage(`${uploaded.length} imagem(ns) enviada(s).`);
      event.target.value = '';
    } catch {
      setMessage('Não foi possível enviar todas as imagens.');
    } finally {
      setUploading(false);
    }
  }

  async function removeImage(imageId: string) {
    if (!property) return;
    const response = await fetch(`${API_URL}/properties/${id}/images/${imageId}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) setProperty({ ...property, images: property.images.filter((image) => image.id !== imageId) });
  }

  if (!property) return <main style={{ padding: 40 }}>{message || 'Carregando...'}</main>;
  const field = (key: keyof Property, value: string | number | boolean) => setProperty({ ...property, [key]: value });

  return (
    <main style={{ minHeight: '100vh', background: '#f5f7f6', padding: '40px 6vw' }}>
      <Link href="/dashboard/imoveis">← Voltar</Link>
      <h1>Editar imóvel</h1>
      <form onSubmit={save} style={{ maxWidth: 920, background: '#fff', padding: 24, borderRadius: 16, display: 'grid', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
          <input style={inputStyle} value={property.code} onChange={(e) => field('code', e.target.value)} placeholder="Código" />
          <input style={inputStyle} value={property.title} onChange={(e) => field('title', e.target.value)} placeholder="Título" />
        </div>
        <textarea style={{ ...inputStyle, minHeight: 130 }} value={property.description} onChange={(e) => field('description', e.target.value)} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <select style={inputStyle} value={property.status} onChange={(e) => field('status', e.target.value)}><option>DRAFT</option><option>AVAILABLE</option><option>RESERVED</option><option>NEGOTIATION</option><option>SOLD</option><option>RENTED</option><option>INACTIVE</option></select>
          <select style={inputStyle} value={property.purpose} onChange={(e) => field('purpose', e.target.value)}><option>SALE</option><option>RENT</option><option>SEASONAL</option></select>
          <select style={inputStyle} value={property.type} onChange={(e) => field('type', e.target.value)}><option>HOUSE</option><option>APARTMENT</option><option>LAND</option><option>FARM</option><option>COMMERCIAL</option><option>OFFICE</option><option>WAREHOUSE</option><option>RURAL</option><option>DEVELOPMENT</option></select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          <input style={inputStyle} type="number" value={property.salePrice ?? ''} onChange={(e) => field('salePrice', e.target.value)} placeholder="Preço de venda" />
          <input style={inputStyle} type="number" value={property.rentPrice ?? ''} onChange={(e) => field('rentPrice', e.target.value)} placeholder="Preço de aluguel" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <input style={inputStyle} type="number" value={property.bedrooms ?? ''} onChange={(e) => field('bedrooms', Number(e.target.value))} placeholder="Quartos" />
          <input style={inputStyle} type="number" value={property.bathrooms ?? ''} onChange={(e) => field('bathrooms', Number(e.target.value))} placeholder="Banheiros" />
          <input style={inputStyle} type="number" value={property.parkingSpaces ?? ''} onChange={(e) => field('parkingSpaces', Number(e.target.value))} placeholder="Vagas" />
          <input style={inputStyle} type="number" value={property.totalArea ?? ''} onChange={(e) => field('totalArea', e.target.value)} placeholder="Área" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 90px', gap: 12 }}>
          <input style={inputStyle} value={property.neighborhood} onChange={(e) => field('neighborhood', e.target.value)} placeholder="Bairro" />
          <input style={inputStyle} value={property.city} onChange={(e) => field('city', e.target.value)} placeholder="Cidade" />
          <input style={inputStyle} value={property.state} maxLength={2} onChange={(e) => field('state', e.target.value)} placeholder="UF" />
        </div>
        <label><input type="checkbox" checked={property.isFeatured} onChange={(e) => field('isFeatured', e.target.checked)} /> Imóvel em destaque</label>
        <button style={{ padding: 13, background: '#176b52', color: '#fff', border: 0, borderRadius: 10, fontWeight: 700 }}>Salvar alterações</button>
        {message && <p>{message}</p>}
      </form>

      <section style={{ maxWidth: 920, marginTop: 24, background: '#fff', padding: 24, borderRadius: 16 }}>
        <h2>Galeria de imagens</h2>
        <p style={{ color: '#62706b' }}>Selecione fotos JPG, PNG ou WebP. Limite de 10 MB por arquivo.</p>
        <label style={{ display: 'inline-block', padding: '12px 16px', background: '#176b52', color: '#fff', borderRadius: 10, cursor: uploading ? 'wait' : 'pointer', fontWeight: 700 }}>
          {uploading ? 'Enviando...' : 'Selecionar imagens'}
          <input type="file" accept="image/*" multiple onChange={uploadImages} disabled={uploading} style={{ display: 'none' }} />
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginTop: 18 }}>
          {property.images.map((image) => (
            <article key={image.id}>
              <div style={{ position: 'relative' }}>
                <img src={image.url} alt="" style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 10 }} />
                {image.isCover && <span style={{ position: 'absolute', top: 8, left: 8, background: '#176b52', color: '#fff', padding: '4px 7px', borderRadius: 6, fontSize: 12 }}>Capa</span>}
              </div>
              <button type="button" onClick={() => removeImage(image.id)} style={{ marginTop: 8 }}>Remover</button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
