import {
  buscarFocosParaExportar,
  buscarSessoesParaExportar,
  type FocoExportavel,
  type SessaoExportavel,
} from '../repositories/exportacaoRepository'
import { registrarLog } from './logService'
import { STATUS_ATIVO } from './laboratorioService'

export type FormatoExportacao = 'json' | 'csv'

export interface SessaoExportada {
  data: string
  duracaoMinutos: number
  aprendizado: string | null
}

export interface FocoExportado {
  titulo: string
  metaHoras: number
  cor: string | null
  observacoes: string | null
  situacao: 'ativo' | 'arquivado'
  horasAcumuladas: number
  criadoEm: string
  sessoes: SessaoExportada[]
}

export interface Exportacao {
  geradoEm: string
  focos: FocoExportado[]
}

export interface ArquivoExportado {
  nome: string
  conteudo: string
  tipo: string
}

const COLUNAS_CSV = [
  'foco_titulo',
  'foco_meta_horas',
  'foco_cor',
  'foco_observacoes',
  'foco_situacao',
  'foco_horas_acumuladas',
  'sessao_data',
  'sessao_duracao_minutos',
  'sessao_aprendizado',
]

const SEPARADOR_CSV = ';'
const MARCA_UTF8 = '﻿'

function arredondarHoras(minutos: number): number {
  return Math.round((minutos / 60) * 100) / 100
}

export function montarExportacao(
  focos: FocoExportavel[],
  sessoes: SessaoExportavel[],
  geradoEm: Date,
): Exportacao {
  return {
    geradoEm: geradoEm.toISOString(),
    focos: focos.map((foco) => {
      const sessoesDoFoco = sessoes.filter((sessao) => sessao.foco_id === foco.id)
      const minutos = sessoesDoFoco.reduce((soma, sessao) => soma + sessao.duracao_minutos, 0)
      return {
        titulo: foco.titulo,
        metaHoras: foco.meta_horas,
        cor: foco.cor_hex,
        observacoes: foco.observacoes,
        situacao: foco.status === STATUS_ATIVO ? 'ativo' : 'arquivado',
        horasAcumuladas: arredondarHoras(minutos),
        criadoEm: foco.created_at,
        sessoes: sessoesDoFoco.map((sessao) => ({
          data: sessao.created_at,
          duracaoMinutos: sessao.duracao_minutos,
          aprendizado: sessao.aprendizado,
        })),
      }
    }),
  }
}

function celulaCsv(valor: string | number | null): string {
  if (valor === null) return ''
  const texto = String(valor)
  if (/[";\n\r]/.test(texto)) return `"${texto.replace(/"/g, '""')}"`
  return texto
}

export function gerarCsv(exportacao: Exportacao): string {
  const linhas = [COLUNAS_CSV.join(SEPARADOR_CSV)]

  for (const foco of exportacao.focos) {
    const colunasDoFoco = [
      foco.titulo,
      foco.metaHoras,
      foco.cor,
      foco.observacoes,
      foco.situacao,
      foco.horasAcumuladas,
    ]
    const sessoes = foco.sessoes.length > 0 ? foco.sessoes : [null]

    for (const sessao of sessoes) {
      const colunasDaSessao = sessao ? [sessao.data, sessao.duracaoMinutos, sessao.aprendizado] : [null, null, null]
      linhas.push([...colunasDoFoco, ...colunasDaSessao].map(celulaCsv).join(SEPARADOR_CSV))
    }
  }

  return MARCA_UTF8 + linhas.join('\r\n')
}

export function gerarJson(exportacao: Exportacao): string {
  return JSON.stringify(exportacao, null, 2)
}

export function nomeDoArquivo(data: Date, formato: FormatoExportacao): string {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `foco-exportacao-${ano}-${mes}-${dia}.${formato}`
}

export async function exportarDados(
  userId: string,
  formato: FormatoExportacao,
  agora = new Date(),
): Promise<ArquivoExportado> {
  const focos = await buscarFocosParaExportar(userId)
  const sessoes = await buscarSessoesParaExportar(focos.map((foco) => foco.id))
  const exportacao = montarExportacao(focos, sessoes, agora)

  await registrarLog(userId, 'exportar_focos', { formato, total_focos: focos.length })

  return formato === 'csv'
    ? { nome: nomeDoArquivo(agora, 'csv'), conteudo: gerarCsv(exportacao), tipo: 'text/csv;charset=utf-8' }
    : { nome: nomeDoArquivo(agora, 'json'), conteudo: gerarJson(exportacao), tipo: 'application/json;charset=utf-8' }
}
