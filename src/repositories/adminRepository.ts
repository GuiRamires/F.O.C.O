import { supabase } from '../supabaseClient'

export interface IndicadoresAdmin {
  totalUsuarios: number
  totalFocos: number
  usuariosAtivos30Dias: number
  sessoes30Dias: number
}

interface LinhaIndicadores {
  total_usuarios: number
  total_focos: number
  usuarios_ativos_30_dias: number
  sessoes_30_dias: number
}

export async function buscarIndicadoresAdmin(): Promise<IndicadoresAdmin> {
  const { data, error } = await supabase.rpc('indicadores_admin')

  if (error) {
    throw new Error(`Erro ao buscar os indicadores: ${error.message}`)
  }

  const linha = ((data ?? []) as LinhaIndicadores[])[0]

  return {
    totalUsuarios: Number(linha?.total_usuarios ?? 0),
    totalFocos: Number(linha?.total_focos ?? 0),
    usuariosAtivos30Dias: Number(linha?.usuarios_ativos_30_dias ?? 0),
    sessoes30Dias: Number(linha?.sessoes_30_dias ?? 0),
  }
}
