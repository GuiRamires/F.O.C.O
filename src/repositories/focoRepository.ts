import { supabase } from '../supabaseClient'

export interface Foco {
  id: string
  titulo: string
  meta_horas: number
  observacoes: string | null
  tem_estrela: boolean
  status: string
  posicao: number | null
  cor_hex: string | null
  arquivado_em: string | null
  resgatado_em: string | null
  created_at: string
}

export interface NovoFoco {
  titulo: string
  meta_horas: number
  observacoes: string
}

export async function getFocosByUserId(userId: string): Promise<Foco[]> {
  const { data, error } = await supabase
    .from('focos')
    .select('id, titulo, meta_horas, observacoes, tem_estrela, status, posicao, cor_hex, arquivado_em, resgatado_em, created_at')
    .eq('user_id', userId)
    .order('posicao', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Erro ao buscar Focos: ${error.message}`)
  }

  return data
}

export async function getTotalMinutosByFocoId(focoId: string): Promise<number> {
  const { data, error } = await supabase
    .from('focus_sessions')
    .select('duracao_minutos')
    .eq('foco_id', focoId)

  if (error) {
    throw new Error(`Erro ao buscar sessões do foco: ${error.message}`)
  }

  return data.reduce((soma, sessao) => soma + sessao.duracao_minutos, 0)
}

export async function existeSessaoDesde(focoId: string, desde: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('focus_sessions')
    .select('id')
    .eq('foco_id', focoId)
    .gte('created_at', desde)
    .limit(1)

  if (error) {
    throw new Error(`Erro ao buscar sessões do foco: ${error.message}`)
  }

  return data.length > 0
}

export async function existeFocoComEstrela(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('focos')
    .select('id')
    .eq('user_id', userId)
    .eq('tem_estrela', true)
    .limit(1)

  if (error) {
    throw new Error(`Erro ao verificar a Estrela: ${error.message}`)
  }

  return data.length > 0
}

export async function atribuirEstrelaAoFoco(focoId: string): Promise<void> {
  const { error } = await supabase.rpc('atribuir_estrela', { p_foco_id: focoId })

  if (error) {
    throw new Error(`Erro ao atribuir a Estrela: ${error.message}`)
  }
}

export async function removerEstrelaDoFoco(focoId: string, novaPosicao: number): Promise<void> {
  const { error } = await supabase.rpc('remover_estrela', {
    p_foco_id: focoId,
    p_nova_posicao: novaPosicao,
  })

  if (error) {
    throw new Error(`Erro ao remover a Estrela: ${error.message}`)
  }
}

export async function arquivarFocoNoLaboratorio(focoId: string): Promise<void> {
  const { error } = await supabase.rpc('arquivar_foco', { p_foco_id: focoId })

  if (error) {
    throw new Error(`Erro ao arquivar o Foco: ${error.message}`)
  }
}

export async function resgatarFocoDoLaboratorio(focoId: string): Promise<number> {
  const { data, error } = await supabase.rpc('resgatar_foco', { p_foco_id: focoId })

  if (error) {
    throw new Error(`Erro ao resgatar o Foco: ${error.message}`)
  }

  return data as number
}

export async function excluirFocoDoLaboratorio(focoId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('focos')
    .delete()
    .eq('id', focoId)
    .eq('status', 'laboratorio_sonhos')
    .select('id')

  if (error) {
    throw new Error(`Erro ao excluir o Foco: ${error.message}`)
  }

  return data.length > 0
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

export async function getPapelUsuario(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('papel')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Erro ao buscar papel do usuário:', error.message)
    return null
  }

  return data.papel
}
