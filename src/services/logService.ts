import { supabase } from '../supabaseClient'

export type AcaoLog =
  | 'login'
  | 'cadastro'
  | 'criar_foco'
  | 'atribuir_estrela'

export async function registrarLog(
  userId: string,
  acao: AcaoLog,
  detalhes?: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase
    .from('logs_auditoria')
    .insert({
      user_id: userId,
      acao,
      detalhes: detalhes ?? null,
    })

  if (error) {
    console.error('Erro ao registrar log de auditoria:', error.message)
  }
}