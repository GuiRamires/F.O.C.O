import { supabase } from '../supabaseClient'

export interface NovaSessao {
  focoId: string
  duracaoMinutos: number
  aprendizado: string | null
}

export async function inserirSessao(nova: NovaSessao): Promise<void> {
  const { error } = await supabase.from('focus_sessions').insert({
    foco_id: nova.focoId,
    duracao_minutos: nova.duracaoMinutos,
    aprendizado: nova.aprendizado,
  })
  if (error) throw error
}