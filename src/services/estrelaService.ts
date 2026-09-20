import { getTotalMinutosByFocoId } from '../repositories/focoRepository'

const HORAS_MINIMAS = 10
const MINUTOS_MINIMOS = HORAS_MINIMAS * 60 // 600 minutos

export interface ResultadoTentativaEstrela {
  permitido: boolean
  mensagem: string
  horasAcumuladas: number
  horasFaltantes: number
}

export async function tentarAtribuirEstrela(focoId: string): Promise<ResultadoTentativaEstrela> {
  const totalMinutos = await getTotalMinutosByFocoId(focoId)
  const horasAcumuladas = totalMinutos / 60

  if (totalMinutos >= MINUTOS_MINIMOS) {
    return {
      permitido: true,
      mensagem: 'Esse F.O.C.O Agora é Prioridade.',
      horasAcumuladas,
      horasFaltantes: 0,
    }
  }

  const minutosFaltantes = MINUTOS_MINIMOS - totalMinutos
  const horasFaltantes = minutosFaltantes / 60

  return {
    permitido: false,
    mensagem: `Ainda não é possível atribuir a Estrela Dourada. Faltam ${horasFaltantes.toFixed(1)}h de foco registrado para este card.`,
    horasAcumuladas,
    horasFaltantes,
  }
}

import { supabase } from '../supabaseClient'

export interface ResultadoAcaoEstrela {
  sucesso: boolean
  mensagem: string
}

export async function atribuirEstrela(focoId: string): Promise<ResultadoAcaoEstrela> {
  const resultado = await tentarAtribuirEstrela(focoId)

  if (!resultado.permitido) {
    return { sucesso: false, mensagem: resultado.mensagem }
  }

  const { error } = await supabase
    .from('focos')
    .update({ tem_estrela: true })
    .eq('id', focoId)

  if (error) {
    return { sucesso: false, mensagem: `Erro ao atribuir a estrela: ${error.message}` }
  }

  return { sucesso: true, mensagem: 'Esse F.O.C.O agora é sua Prioridade! 🌟' }
}

export async function removerEstrela(focoId: string): Promise<ResultadoAcaoEstrela> {
  const { error } = await supabase
    .from('focos')
    .update({ tem_estrela: false, status: 'laboratorio_sonhos' })
    .eq('id', focoId)

  if (error) {
    return { sucesso: false, mensagem: `Erro ao remover a prioridade: ${error.message}` }
  }

  return { sucesso: true, mensagem: 'Foco movido para o Laboratório de Sonhos.' }
}

export async function existeFocoComEstrela(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('focos')
    .select('id')
    .eq('user_id', userId)
    .eq('tem_estrela', true)
    .limit(1)

  if (error) {
    throw new Error(`Erro ao verificar estrela existente: ${error.message}`)
  }

  return data.length > 0
}