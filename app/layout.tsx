import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Imobiliária | Encontre seu próximo imóvel',
  description: 'Marketplace e CRM para imobiliárias, corretores e clientes.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
