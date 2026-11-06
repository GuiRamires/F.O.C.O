import { supabase } from '../supabaseClient'

export interface SessaoComFoco {
  id: string
  focoId: string
  tituloFoco: string
  duracaoMinutos: number
  aprendizado: string | null
  criadaEm: string
}

interface LinhaSessao {
  id: string
  foco_id: string
  duracao_minutos: number
  aprendizado: string | null
  created_at: string
  focos: { titulo: string }
}

export async function getSessoesComFocoDoUsuario(userId: string): Promise<SessaoComFoco[]> {
  const { data, error } = await supabase
    .from('focus_sessions')
    .select('id, foco_id, duracao_minutos, aprendizado, created_at, focos!inner(titulo, user_id)')
    .eq('focos.user_id', userId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Erro ao buscar as sessões: ${error.message}`)
  }

  return ((data ?? []) as unknown as LinhaSessao[]).map((linha) => ({
    id: linha.id,
    focoId: linha.foco_id,
    tituloFoco: linha.focos.titulo,
    duracaoMinutos: linha.duracao_minutos,
    aprendizado: linha.aprendizado,
    criadaEm: linha.created_at,
  }))
}
