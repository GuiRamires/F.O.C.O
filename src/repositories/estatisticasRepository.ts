import { supabase } from '../supabaseClient'

export interface SessaoComFoco {
  focoId: string
  tituloFoco: string
  duracaoMinutos: number
  criadaEm: string
}

interface LinhaSessao {
  foco_id: string
  duracao_minutos: number
  created_at: string
  focos: { titulo: string }
}

export async function getSessoesComFocoDoUsuario(userId: string): Promise<SessaoComFoco[]> {
  const { data, error } = await supabase
    .from('focus_sessions')
    .select('foco_id, duracao_minutos, created_at, focos!inner(titulo, user_id)')
    .eq('focos.user_id', userId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Erro ao buscar as sessões: ${error.message}`)
  }

  return ((data ?? []) as unknown as LinhaSessao[]).map((linha) => ({
    focoId: linha.foco_id,
    tituloFoco: linha.focos.titulo,
    duracaoMinutos: linha.duracao_minutos,
    criadaEm: linha.created_at,
  }))
}