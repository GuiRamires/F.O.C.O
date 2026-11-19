export const CABECALHOS_CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-region, x-supabase-api-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export function responder(corpo: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { ...CABECALHOS_CORS, 'Content-Type': 'application/json' },
  })
}

export function preflight(req: Request): Response | null {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CABECALHOS_CORS })
  if (req.method !== 'POST') return responder({ erro: 'Método não permitido.' }, 405)
  return null
}

export async function lerCorpo(req: Request): Promise<Record<string, unknown>> {
  try {
    const corpo = await req.json()
    return corpo && typeof corpo === 'object' ? (corpo as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

export function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : ''
}

export function iguaisEmTempoConstante(a: string, b: string): boolean {
  const codificador = new TextEncoder()
  const bytesA = codificador.encode(a)
  const bytesB = codificador.encode(b)
  let diferenca = bytesA.length ^ bytesB.length
  for (let i = 0; i < Math.max(bytesA.length, bytesB.length); i++) {
    diferenca |= (bytesA[i] ?? 0) ^ (bytesB[i] ?? 0)
  }
  return diferenca === 0
}
