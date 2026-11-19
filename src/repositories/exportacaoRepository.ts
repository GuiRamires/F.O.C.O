import { supabase } from '../supabaseClient'

export interface FocoExportavel {
  id: string
  titulo: string
  meta_horas: number
  cor_hex: string | null
  observacoes: string | null
  status: string
  created_at: string
}

export interface SessaoExportavel {
  foco_id: string
  created_at: string
  duracao_minutos: number
  aprendizado: string | null
}

export async function buscarFocosParaExportar(userId: string): Promise<FocoExportavel[]> {
  const { data, error } = await supabase
    .from('focos')
    .select('id, titulo, meta_horas, cor_hex, observacoes, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Erro ao buscar os Focos para exportar: ${error.message}`)
  }

  return data
}

export async function buscarSessoesParaExportar(focoIds: string[]): Promise<SessaoExportavel[]> {
  if (focoIds.length === 0) return []

  const { data, error } = await supabase
    .from('focus_sessions')
    .select('foco_id, created_at, duracao_minutos, aprendizado')
    .in('foco_id', focoIds)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Erro ao buscar as sessões para exportar: ${error.message}`)
  }

  return data
}
