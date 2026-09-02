import { supabase } from '../supabaseClient'

export async function getTotalMinutosByFocoId(focoId: string): Promise<number> {
  const { data, error } = await supabase
    .from('focus_sessions')
    .select('duracao_minutos')
    .eq('foco_id', focoId)

  if (error) {
    throw new Error(`Erro ao buscar sessões do foco: ${error.message}`)
  }

  const totalMinutos = data.reduce((soma, sessao) => soma + sessao.duracao_minutos, 0)
  return totalMinutos
}