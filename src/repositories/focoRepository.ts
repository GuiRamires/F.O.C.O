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

export interface Foco {
  id: string
  titulo: string
  meta_horas: number
  observacoes: string | null
  tem_estrela: boolean
  status: string
  created_at: string
}

export async function getFocosByUserId(userId: string): Promise<Foco[]> {
  const { data, error } = await supabase
    .from('focos')
    .select('id, titulo, meta_horas, observacoes, tem_estrela, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Erro ao buscar Focos: ${error.message}`)
  }

  return data
}

export interface NovoFoco {
  titulo: string
  meta_horas: number
  observacoes: string
}

export async function criarFoco(userId: string, foco: NovoFoco): Promise<void> {
  const { error } = await supabase
    .from('focos')
    .insert({
      user_id: userId,
      titulo: foco.titulo,
      meta_horas: foco.meta_horas,
      observacoes: foco.observacoes || null,
    })

  if (error) {
    throw new Error(`Erro ao criar Foco: ${error.message}`)
  }
}

