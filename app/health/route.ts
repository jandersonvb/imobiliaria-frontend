export function GET() {
  return Response.json({ status: 'ok', service: 'imobiliaria-frontend', timestamp: new Date().toISOString() });
}
