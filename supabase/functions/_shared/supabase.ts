import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'

function chaveSecreta(): string {
  const chaves = Deno.env.get('SUPABASE_SECRET_KEYS')
  if (chaves) {
    try {
      const padrao = JSON.parse(chaves).default
      if (typeof padrao === 'string' && padrao) return padrao
    } catch {
      return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    }
  }
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
}

export function clienteAdministrativo(): SupabaseClient {
  return createClient(Deno.env.get('SUPABASE_URL') ?? '', chaveSecreta(), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function usuarioDaRequisicao(req: Request, cliente: SupabaseClient): Promise<User | null> {
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
  if (!token) return null
  const { data, error } = await cliente.auth.getUser(token)
  if (error || !data.user) return null
  return data.user
}

export async function papelDoUsuario(cliente: SupabaseClient, userId: string): Promise<string | null> {
  const { data } = await cliente.from('user_profiles').select('papel').eq('id', userId).maybeSingle()
  return data?.papel ?? null
}

export async function registrarLog(
  cliente: SupabaseClient,
  userId: string,
  acao: string,
  detalhes: Record<string, unknown> = {},
): Promise<void> {
  const { error } = await cliente.from('logs_auditoria').insert({ user_id: userId, acao, detalhes })
  if (error) console.error('Falha ao registrar o log:', error.message)
}
