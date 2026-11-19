import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../repositories/exportacaoRepository', () => ({
  buscarFocosParaExportar: vi.fn(),
  buscarSessoesParaExportar: vi.fn(),
}))

vi.mock('./logService', () => ({
  registrarLog: vi.fn(),
}))

import { buscarFocosParaExportar, buscarSessoesParaExportar } from '../repositories/exportacaoRepository'
import { registrarLog } from './logService'
import { exportarDados, gerarCsv, gerarJson, montarExportacao, nomeDoArquivo } from './exportacaoService'

const FOCOS = [
  { id: 'f1', titulo: 'Inglês', meta_horas: 10, cor_hex: '#1E88E5', observacoes: 'Vocabulário; leitura', status: 'ativo', created_at: '2026-10-01T10:00:00Z' },
  { id: 'f2', titulo: 'Redação', meta_horas: 5, cor_hex: null, observacoes: null, status: 'ativo', created_at: '2026-10-02T10:00:00Z' },
  { id: 'f3', titulo: 'Cálculo', meta_horas: 20, cor_hex: null, observacoes: null, status: 'ativo', created_at: '2026-10-03T10:00:00Z' },
  { id: 'f4', titulo: 'Violão', meta_horas: 8, cor_hex: null, observacoes: null, status: 'laboratorio_sonhos', created_at: '2026-10-04T10:00:00Z' },
]

const SESSOES = [
  { foco_id: 'f1', created_at: '2026-11-01T10:00:00Z', duracao_minutos: 30, aprendizado: 'Aprendi "phrasal verbs"' },
  { foco_id: 'f1', created_at: '2026-11-02T10:00:00Z', duracao_minutos: 60, aprendizado: null },
  { foco_id: 'f4', created_at: '2026-11-03T10:00:00Z', duracao_minutos: 45, aprendizado: 'Acordes' },
]

const DATA = new Date(2026, 10, 16, 9, 30)

describe('exportação dos dados (RF28)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('inclui os Focos ativos e arquivados com as sessões (CA28.1 e RN28.2)', () => {
    const exportacao = montarExportacao(FOCOS, SESSOES, DATA)

    expect(exportacao.focos).toHaveLength(4)
    expect(exportacao.focos[0]).toMatchObject({
      titulo: 'Inglês',
      metaHoras: 10,
      cor: '#1E88E5',
      situacao: 'ativo',
      horasAcumuladas: 1.5,
    })
    expect(exportacao.focos[0].sessoes).toHaveLength(2)
    expect(exportacao.focos[3]).toMatchObject({ titulo: 'Violão', situacao: 'arquivado', horasAcumuladas: 0.75 })
  })

  it('no CSV, cada sessão ocupa uma linha, com as colunas identificadas (CA28.2)', () => {
    const linhas = gerarCsv(montarExportacao(FOCOS, SESSOES, DATA)).replace('﻿', '').split('\r\n')

    expect(linhas[0]).toBe(
      'foco_titulo;foco_meta_horas;foco_cor;foco_observacoes;foco_situacao;foco_horas_acumuladas;sessao_data;sessao_duracao_minutos;sessao_aprendizado',
    )
    expect(linhas).toHaveLength(1 + 2 + 1 + 1 + 1)
    expect(linhas[1]).toContain('"Vocabulário; leitura"')
    expect(linhas[1]).toContain('"Aprendi ""phrasal verbs"""')
    expect(linhas[3]).toBe('Redação;5;;;ativo;0;;;')
  })

  it('o CSV começa com a marca UTF-8 para abrir com acentos nas planilhas', () => {
    expect(gerarCsv({ geradoEm: '', focos: [] }).startsWith('﻿')).toBe(true)
  })

  it('o JSON é legível e completo', () => {
    const json = JSON.parse(gerarJson(montarExportacao(FOCOS, SESSOES, DATA)))

    expect(json.geradoEm).toBe(DATA.toISOString())
    expect(json.focos[0].sessoes[0]).toEqual({ data: '2026-11-01T10:00:00Z', duracaoMinutos: 30, aprendizado: 'Aprendi "phrasal verbs"' })
  })

  it('nomeia o arquivo no padrão foco-exportacao-AAAA-MM-DD (RN28.4)', () => {
    expect(nomeDoArquivo(DATA, 'json')).toBe('foco-exportacao-2026-11-16.json')
    expect(nomeDoArquivo(new Date(2026, 0, 5), 'csv')).toBe('foco-exportacao-2026-01-05.csv')
  })

  it('busca os dados do próprio Aluno e registra a exportação no log', async () => {
    vi.mocked(buscarFocosParaExportar).mockResolvedValue(FOCOS)
    vi.mocked(buscarSessoesParaExportar).mockResolvedValue(SESSOES)

    const arquivo = await exportarDados('usuario-1', 'csv', DATA)

    expect(buscarFocosParaExportar).toHaveBeenCalledWith('usuario-1')
    expect(buscarSessoesParaExportar).toHaveBeenCalledWith(['f1', 'f2', 'f3', 'f4'])
    expect(arquivo).toMatchObject({ nome: 'foco-exportacao-2026-11-16.csv', tipo: 'text/csv;charset=utf-8' })
    expect(registrarLog).toHaveBeenCalledWith('usuario-1', 'exportar_focos', { formato: 'csv', total_focos: 4 })
  })

  it('gera o JSON quando escolhido', async () => {
    vi.mocked(buscarFocosParaExportar).mockResolvedValue([])
    vi.mocked(buscarSessoesParaExportar).mockResolvedValue([])

    const arquivo = await exportarDados('usuario-1', 'json', DATA)

    expect(arquivo.tipo).toBe('application/json;charset=utf-8')
    expect(JSON.parse(arquivo.conteudo).focos).toEqual([])
  })
})
