export async function fetchRealDataStatus() {
  const res = await fetch('/api/dados/status');
  if (!res.ok) throw new Error('Falha ao obter status dos dados');
  return res.json();
}

export async function clearDemoDataAndStartFresh() {
  const res = await fetch('/api/dados/limpar-demonstracao', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Falha ao limpar dados de demonstração');
  return res.json();
}

export async function syncAllToPostgresDatabase() {
  const res = await fetch('/api/dados/sincronizar-postgres', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Falha ao sincronizar com PostgreSQL');
  return res.json();
}
