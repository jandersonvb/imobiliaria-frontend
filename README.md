# Imobiliária Frontend

Portal público e painel de gestão imobiliária construídos com Next.js.

## Funcionalidades atuais

- página inicial e busca de imóveis
- página pública do imóvel
- painel da imobiliária
- cadastro e gestão do ciclo de vida dos imóveis
- galeria com capa e ordenação
- captação, filtro, paginação e funil de leads
- sessão segura por cookie `HttpOnly`

## Stack

- Next.js
- React
- TypeScript
- CSS global e componentes React

## Execução local

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Produção

Configure `NEXT_PUBLIC_API_URL` com a URL HTTPS do backend incluindo `/api`. O endpoint `/health` é usado pela plataforma para verificar a disponibilidade do frontend. O build aplica headers básicos de segurança e otimização de imagens do Cloudinary.

Todas as chamadas autenticadas usam `credentials: include`. O token de sessão não é salvo nem acessível no `localStorage`.
