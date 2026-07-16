'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { getSession } from '@/lib/session';

type Agency = { id: string; name: string };

export default function NewPropertyPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      if (!await getSession()) return void (window.location.href = '/login');
      setAuthenticated(true);
      const response = await apiFetch('/agencies/mine');
      if (!response.ok) return void (window.location.href = '/login');
      const items = await response.json() as Agency[];
      if (!items[0]) window.location.href = '/onboarding/imobiliaria';
      else setAgency(items[0]);
    })();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!authenticated || !agency) return;

    setLoading(true);
    setError('');

    const form = new FormData(event.currentTarget);
    const numericFields = ['salePrice', 'rentPrice', 'bedrooms', 'bathrooms', 'parkingSpaces', 'totalArea'];
    const payload: Record<string, unknown> = { agencyId: agency.id };

    for (const [key, value] of form.entries()) {
      if (value === '') continue;
      payload[key] = numericFields.includes(key) ? Number(value) : value;
    }

    try {
      const response = await apiFetch('/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(Array.isArray(data.message) ? data.message.join(', ') : data.message);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível cadastrar o imóvel.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f5f7f6', padding: '36px 20px' }}>
      <section style={{ maxWidth: 820, margin: '0 auto', background: '#fff', border: '1px solid #e4e9e7', borderRadius: 18, padding: 32 }}>
        <Link href="/dashboard/imoveis" style={{ color: '#176b52', fontWeight: 700, textDecoration: 'none' }}>← Voltar aos imóveis</Link>
        <p style={{ color: '#176b52', fontWeight: 800, marginTop: 28 }}>NOVO IMÓVEL</p>
        <h1 style={{ fontSize: 34, margin: '6px 0 24px' }}>{agency ? `Cadastrar em ${agency.name}` : 'Carregando imobiliária...'}</h1>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 15 }}>
          <div style={twoColumns}>
            <label>Código<input name="code" required style={inputStyle} /></label>
            <label>Status<select name="status" defaultValue="DRAFT" style={inputStyle}><option value="DRAFT">Rascunho</option><option value="AVAILABLE">Disponível</option></select></label>
          </div>
          <label>Título<input name="title" required minLength={4} style={inputStyle} /></label>
          <label>Descrição<textarea name="description" required minLength={20} rows={6} style={inputStyle} /></label>
          <div style={twoColumns}>
            <label>Finalidade<select name="purpose" style={inputStyle}><option value="SALE">Venda</option><option value="RENT">Locação</option><option value="SEASONAL">Temporada</option></select></label>
            <label>Tipo<select name="type" style={inputStyle}><option value="HOUSE">Casa</option><option value="APARTMENT">Apartamento</option><option value="LAND">Terreno</option><option value="COMMERCIAL">Comercial</option><option value="RURAL">Rural</option></select></label>
          </div>
          <div style={twoColumns}>
            <label>Preço de venda<input name="salePrice" type="number" min="0" step="0.01" style={inputStyle} /></label>
            <label>Preço de locação<input name="rentPrice" type="number" min="0" step="0.01" style={inputStyle} /></label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <label>Quartos<input name="bedrooms" type="number" min="0" style={inputStyle} /></label>
            <label>Banheiros<input name="bathrooms" type="number" min="0" style={inputStyle} /></label>
            <label>Vagas<input name="parkingSpaces" type="number" min="0" style={inputStyle} /></label>
            <label>Área m²<input name="totalArea" type="number" min="0" step="0.01" style={inputStyle} /></label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 90px', gap: 12 }}>
            <label>Bairro<input name="neighborhood" required style={inputStyle} /></label>
            <label>Cidade<input name="city" required style={inputStyle} /></label>
            <label>UF<input name="state" required maxLength={2} style={inputStyle} /></label>
          </div>
          <label>URL da imagem de capa<input name="coverImageUrl" type="url" style={inputStyle} /></label>
          {error && <p style={{ color: '#b42318', background: '#fef3f2', padding: 12, borderRadius: 8 }}>{error}</p>}
          <button disabled={loading || !agency} style={{ border: 0, borderRadius: 10, padding: '14px 18px', background: '#176b52', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
            {loading ? 'Salvando...' : 'Cadastrar imóvel'}
          </button>
        </form>
      </section>
    </main>
  );
}

const twoColumns = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };
const inputStyle = { display: 'block', width: '100%', boxSizing: 'border-box' as const, marginTop: 7, padding: '12px 13px', border: '1px solid #cfd8d4', borderRadius: 9, fontSize: 15 };
