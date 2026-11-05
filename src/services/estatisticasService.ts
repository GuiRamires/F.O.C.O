import { getSessoesComFocoDoUsuario, type SessaoComFoco } from '../repositories/estatisticasRepository'

export const SEMANAS_NO_GRAFICO = 6

export interface MinutosPorFoco {
  focoId: string
  titulo: string
  minutos: number
}

export interface MinutosPorSemana {
  inicio: string
  rotulo: string
  minutos: number
}

export interface Estatisticas {
  totalMinutos: number
  totalSessoes: number
  mediaMinutosPorSessao: number
  minutosNaSemanaAtual: number
  porFoco: MinutosPorFoco[]
  porSemana: MinutosPorSemana[]
}

function inicioDaSemana(data: Date): Date {
  const inicio = new Date(data.getFullYear(), data.getMonth(), data.getDate())
  const diasDesdeSegunda = (inicio.getDay() + 6) % 7
  inicio.setDate(inicio.getDate() - diasDesdeSegunda)
  return inicio
}

function chaveDoDia(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${data.getFullYear()}-${mes}-${dia}`
}

function rotuloDoDia(data: Date): string {
  const dia = String(data.getDate()).padStart(2, '0')
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  return `${dia}/${mes}`
}

function somarPorFoco(sessoes: SessaoComFoco[]): MinutosPorFoco[] {
  const porFoco = new Map<string, MinutosPorFoco>()

  for (const sessao of sessoes) {
    const atual = porFoco.get(sessao.focoId) ?? { focoId: sessao.focoId, titulo: sessao.tituloFoco, minutos: 0 }
    atual.minutos += sessao.duracaoMinutos
    porFoco.set(sessao.focoId, atual)
  }

  return [...porFoco.values()].sort((a, b) => b.minutos - a.minutos)
}

function somarPorSemana(sessoes: SessaoComFoco[], agora: Date, semanas: number): MinutosPorSemana[] {
  const semanaAtual = inicioDaSemana(agora)
  const porSemana: MinutosPorSemana[] = []
  const indicePorInicio = new Map<string, number>()

  for (let atras = semanas - 1; atras >= 0; atras--) {
    const inicio = new Date(semanaAtual)
    inicio.setDate(inicio.getDate() - atras * 7)
    indicePorInicio.set(chaveDoDia(inicio), porSemana.length)
    porSemana.push({ inicio: chaveDoDia(inicio), rotulo: rotuloDoDia(inicio), minutos: 0 })
  }

  for (const sessao of sessoes) {
    const indice = indicePorInicio.get(chaveDoDia(inicioDaSemana(new Date(sessao.criadaEm))))
    if (indice !== undefined) {
      porSemana[indice].minutos += sessao.duracaoMinutos
    }
  }

  return porSemana
}

export function calcularEstatisticas(
  sessoes: SessaoComFoco[],
  agora: Date,
  semanas: number = SEMANAS_NO_GRAFICO
): Estatisticas {
  const totalMinutos = sessoes.reduce((soma, sessao) => soma + sessao.duracaoMinutos, 0)
  const totalSessoes = sessoes.length
  const porSemana = somarPorSemana(sessoes, agora, semanas)

  return {
    totalMinutos,
    totalSessoes,
    mediaMinutosPorSessao: totalSessoes > 0 ? Math.floor(totalMinutos / totalSessoes) : 0,
    minutosNaSemanaAtual: porSemana[porSemana.length - 1]?.minutos ?? 0,
    porFoco: somarPorFoco(sessoes),
    porSemana,
  }
}

export async function carregarEstatisticas(userId: string, agora: Date): Promise<Estatisticas> {
  const sessoes = await getSessoesComFocoDoUsuario(userId)
  return calcularEstatisticas(sessoes, agora)
}