import { getSessoesComFocoDoUsuario, type SessaoComFoco } from '../repositories/estatisticasRepository'

export type { SessaoComFoco }

export const SEMANAS_NO_GRAFICO = 6
export const SEMANAS_NA_CONSTANCIA = 12
export const LIMITE_APRENDIZADOS = 6
export const LIMITES_NIVEL_CONSTANCIA = [30, 60, 120]

const DIAS_DA_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

export interface MinutosPorFoco {
  focoId: string
  titulo: string
  minutos: number
}

export interface MinutosPorSemana {
  inicio: string
  rotulo: string
  minutos: number
  sessoes: number
}

export interface Estatisticas {
  totalMinutos: number
  totalSessoes: number
  mediaMinutosPorSessao: number
  minutosNaSemanaAtual: number
  porFoco: MinutosPorFoco[]
  porSemana: MinutosPorSemana[]
}

export interface DiaConstancia {
  chave: string
  rotulo: string
  minutos: number
  nivel: number
  futuro: boolean
}

export interface Constancia {
  semanas: DiaConstancia[][]
  sequenciaAtual: number
  maiorSequencia: number
  diasEstudados: number
}

export interface Aprendizado {
  id: string
  tituloFoco: string
  texto: string
  rotuloData: string
  minutos: number
}

export interface Painel {
  estatisticas: Estatisticas
  constancia: Constancia
  aprendizados: Aprendizado[]
}

function inicioDoDia(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate())
}

function somarDias(data: Date, dias: number): Date {
  const resultado = new Date(data)
  resultado.setDate(resultado.getDate() + dias)
  return resultado
}

function inicioDaSemana(data: Date): Date {
  const inicio = inicioDoDia(data)
  return somarDias(inicio, -((inicio.getDay() + 6) % 7))
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

function diaDaSessao(sessao: SessaoComFoco): Date {
  return inicioDoDia(new Date(sessao.criadaEm))
}

function minutosPorDia(sessoes: SessaoComFoco[]): Map<string, number> {
  const porDia = new Map<string, number>()
  for (const sessao of sessoes) {
    const chave = chaveDoDia(diaDaSessao(sessao))
    porDia.set(chave, (porDia.get(chave) ?? 0) + sessao.duracaoMinutos)
  }
  return porDia
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
    const inicio = somarDias(semanaAtual, -atras * 7)
    indicePorInicio.set(chaveDoDia(inicio), porSemana.length)
    porSemana.push({ inicio: chaveDoDia(inicio), rotulo: rotuloDoDia(inicio), minutos: 0, sessoes: 0 })
  }

  for (const sessao of sessoes) {
    const indice = indicePorInicio.get(chaveDoDia(inicioDaSemana(diaDaSessao(sessao))))
    if (indice !== undefined) {
      porSemana[indice].minutos += sessao.duracaoMinutos
      porSemana[indice].sessoes += 1
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

export function nivelDeConstancia(minutos: number): number {
  if (minutos <= 0) return 0
  const acima = LIMITES_NIVEL_CONSTANCIA.filter((limite) => minutos >= limite).length
  return acima + 1
}

function calcularSequencias(diasComEstudo: Set<string>, agora: Date): { atual: number; maior: number } {
  let dia = inicioDoDia(agora)
  if (!diasComEstudo.has(chaveDoDia(dia))) {
    dia = somarDias(dia, -1)
  }

  let atual = 0
  while (diasComEstudo.has(chaveDoDia(dia))) {
    atual++
    dia = somarDias(dia, -1)
  }

  let maior = 0
  let corrida = 0
  let anterior: string | null = null
  for (const chave of [...diasComEstudo].sort()) {
    const [ano, mes, numero] = chave.split('-').map(Number)
    const diaAnterior = chaveDoDia(somarDias(new Date(ano, mes - 1, numero), -1))
    corrida = anterior === diaAnterior ? corrida + 1 : 1
    maior = Math.max(maior, corrida)
    anterior = chave
  }

  return { atual, maior }
}

export function calcularConstancia(
  sessoes: SessaoComFoco[],
  agora: Date,
  semanas: number = SEMANAS_NA_CONSTANCIA
): Constancia {
  const porDia = minutosPorDia(sessoes)
  const hoje = inicioDoDia(agora)
  const primeiroDia = somarDias(inicioDaSemana(agora), -(semanas - 1) * 7)
  const grade: DiaConstancia[][] = []
  let diasEstudados = 0

  for (let semana = 0; semana < semanas; semana++) {
    const dias: DiaConstancia[] = []
    for (let posicao = 0; posicao < 7; posicao++) {
      const data = somarDias(primeiroDia, semana * 7 + posicao)
      const futuro = data > hoje
      const minutos = futuro ? 0 : porDia.get(chaveDoDia(data)) ?? 0
      if (minutos > 0) diasEstudados++
      dias.push({
        chave: chaveDoDia(data),
        rotulo: `${DIAS_DA_SEMANA[data.getDay()]}, ${rotuloDoDia(data)}`,
        minutos,
        nivel: nivelDeConstancia(minutos),
        futuro,
      })
    }
    grade.push(dias)
  }

  const sequencias = calcularSequencias(new Set(porDia.keys()), agora)

  return {
    semanas: grade,
    sequenciaAtual: sequencias.atual,
    maiorSequencia: sequencias.maior,
    diasEstudados,
  }
}

export function listarAprendizados(sessoes: SessaoComFoco[], limite: number = LIMITE_APRENDIZADOS): Aprendizado[] {
  return sessoes
    .filter((sessao) => sessao.aprendizado !== null && sessao.aprendizado.trim() !== '')
    .sort((a, b) => new Date(b.criadaEm).getTime() - new Date(a.criadaEm).getTime())
    .slice(0, limite)
    .map((sessao) => ({
      id: sessao.id,
      tituloFoco: sessao.tituloFoco,
      texto: (sessao.aprendizado ?? '').trim(),
      rotuloData: rotuloDoDia(diaDaSessao(sessao)),
      minutos: sessao.duracaoMinutos,
    }))
}

export function montarPainel(sessoes: SessaoComFoco[], focoId: string | null, agora: Date): Painel {
  const escolhidas = focoId ? sessoes.filter((sessao) => sessao.focoId === focoId) : sessoes

  return {
    estatisticas: calcularEstatisticas(escolhidas, agora),
    constancia: calcularConstancia(escolhidas, agora),
    aprendizados: listarAprendizados(escolhidas),
  }
}

export async function carregarSessoesDoAluno(userId: string): Promise<SessaoComFoco[]> {
  return getSessoesComFocoDoUsuario(userId)
}
