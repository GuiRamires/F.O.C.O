import { supabase } from '../supabaseClient'

export interface AceiteDoTermo {
  versao: string
  aceitoEm: string
}

export async function buscarVersaoPendente(): Promise<string | null> {
  const { data, error } = await supabase.rpc('termo_pendente')

  if (error) {
    throw new Error(`Erro ao verificar o aceite do termo: ${error.message}`)
  }

  return data ?? null
}

export async function registrarAceite(): Promise<string> {
  const { data, error } = await supabase.rpc('aceitar_termo')

  if (error) {
    throw new Error(`Erro ao registrar o aceite do termo: ${error.message}`)
  }

  return data
}

export async function buscarUltimoAceite(userId: string): Promise<AceiteDoTermo | null> {
  const { data, error } = await supabase
    .from('aceites_termo')
    .select('versao, aceito_em')
    .eq('user_id', userId)
    .order('aceito_em', { ascending: false })
    .limit(1)

  if (error) {
    throw new Error(`Erro ao buscar o aceite do termo: ${error.message}`)
  }

  const aceite = data?.[0]
  return aceite ? { versao: aceite.versao, aceitoEm: aceite.aceito_em } : null
}
