import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../repositories/contaRepository', () => ({
  buscarEmailAtual: vi.fn(),
  buscarPerfil: vi.fn(),
}))

vi.mock('../services/contaService', () => ({
  alterarEmail: vi.fn(),
  alterarNome: vi.fn(),
  alterarSenha: vi.fn(),
  confirmarTrocaSenhaComCodigo: vi.fn(),
  excluirConta: vi.fn(),
  reenviarCodigoReautenticacao: vi.fn(),
}))

vi.mock('../services/exportacaoService', () => ({
  exportarDados: vi.fn(),
}))

vi.mock('../services/recuperacaoSenhaService', () => ({
  redefinirSenha: vi.fn(),
  solicitarRecuperacao: vi.fn(),
}))

vi.mock('../services/suporteService', () => ({
  abrirChamado: vi.fn(),
  abrirChamadoSemLogin: vi.fn(),
  listarMeusChamados: vi.fn(),
}))

vi.mock('../services/adminService', () => ({
  alterarBloqueio: vi.fn(),
  alterarSituacao: vi.fn(),
  carregarChamados: vi.fn(),
  carregarIndicadores: vi.fn(),
  carregarUsuarios: vi.fn(),
  conferirTitulos: vi.fn(),
  registrarAlteracaoEmail: vi.fn(),
  responderChamado: vi.fn(),
}))

import { buscarEmailAtual, buscarPerfil } from '../repositories/contaRepository'
import type { UsuarioAdmin } from '../repositories/adminRepository'
import * as adminService from '../services/adminService'
import * as contaService from '../services/contaService'
import { exportarDados } from '../services/exportacaoService'
import * as recuperacao from '../services/recuperacaoSenhaService'
import * as suporte from '../services/suporteService'
import * as admin from './adminController'
import * as conta from './contaController'
import { handleRedefinirSenha, handleSolicitarRecuperacao } from './recuperacaoController'
import { handleAbrirChamado, handleAbrirChamadoSemLogin, handleListarMeusChamados } from './suporteController'

const OK = { sucesso: true, mensagem: 'ok' }
const USUARIO = { id: 'u1' } as UsuarioAdmin
const FALHA = new Error('sem rede')

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('contaController', () => {
  it('carrega perfil e e-mail juntos', async () => {
    vi.mocked(buscarPerfil).mockResolvedValue({ nome: 'Maria', papel: 'aluno', criadoEm: '2026-11-01' })
    vi.mocked(buscarEmailAtual).mockResolvedValueOnce('maria@exemplo.com')

    expect(await conta.handleCarregarConta('u1')).toEqual({
      nome: 'Maria',
      papel: 'aluno',
      criadoEm: '2026-11-01',
      email: 'maria@exemplo.com',
    })
    expect(await conta.handleCarregarPerfil('u1')).toMatchObject({ papel: 'aluno' })
  })

  it('devolve nulo quando não consegue carregar', async () => {
    vi.mocked(buscarPerfil).mockRejectedValue(FALHA)

    expect(await conta.handleCarregarConta('u1')).toBeNull()
    expect(await conta.handleCarregarPerfil('u1')).toBeNull()
  })

  it('repassa o resultado dos serviços', async () => {
    vi.mocked(contaService.alterarNome).mockResolvedValueOnce(OK)
    vi.mocked(contaService.alterarEmail).mockResolvedValueOnce(OK)
    vi.mocked(contaService.alterarSenha).mockResolvedValueOnce(OK)
    vi.mocked(contaService.confirmarTrocaSenhaComCodigo).mockResolvedValueOnce(OK)
    vi.mocked(contaService.reenviarCodigoReautenticacao).mockResolvedValueOnce(OK)
    vi.mocked(contaService.excluirConta).mockResolvedValueOnce(OK)

    expect(await conta.handleAlterarNome('u1', 'Maria')).toBe(OK)
    expect(await conta.handleAlterarEmail('u1', 'a@exemplo.com', 'b@exemplo.com')).toBe(OK)
    expect(await conta.handleAlterarSenha('u1', {} as never)).toBe(OK)
    expect(await conta.handleConfirmarSenhaComCodigo('u1', 'Senha', '123456')).toBe(OK)
    expect(await conta.handleReenviarCodigo()).toBe(OK)
    expect(await conta.handleExcluirConta('EXCLUIR')).toBe(OK)
  })

  it('transforma falhas de rede em mensagens', async () => {
    vi.mocked(contaService.alterarNome).mockRejectedValueOnce(FALHA)
    vi.mocked(contaService.excluirConta).mockRejectedValueOnce(FALHA)

    expect((await conta.handleAlterarNome('u1', 'Maria')).mensagem).toContain('Confira sua conexão')
    expect((await conta.handleExcluirConta('EXCLUIR')).sucesso).toBe(false)
  })

  it('exporta os dados ou informa a falha', async () => {
    const arquivo = { nome: 'foco.json', conteudo: '{}', tipo: 'application/json' }
    vi.mocked(exportarDados).mockResolvedValueOnce(arquivo).mockRejectedValueOnce(FALHA)

    expect(await conta.handleExportarDados('u1', 'json')).toEqual({ sucesso: true, arquivo })
    expect(await conta.handleExportarDados('u1', 'csv')).toMatchObject({ sucesso: false })
  })
})

describe('recuperacaoController e suporteController', () => {
  it('repassa os resultados', async () => {
    vi.mocked(recuperacao.solicitarRecuperacao).mockResolvedValueOnce(OK)
    vi.mocked(recuperacao.redefinirSenha).mockResolvedValueOnce(OK)
    vi.mocked(suporte.abrirChamado).mockResolvedValueOnce(OK)
    vi.mocked(suporte.abrirChamadoSemLogin).mockResolvedValueOnce(OK)
    vi.mocked(suporte.listarMeusChamados).mockResolvedValueOnce([])

    expect(await handleSolicitarRecuperacao('a@exemplo.com')).toBe(OK)
    expect(await handleRedefinirSenha({} as never)).toBe(OK)
    expect(await handleAbrirChamado('u1', 'duvida', 'Pergunta qualquer')).toBe(OK)
    expect(await handleAbrirChamadoSemLogin({} as never)).toBe(OK)
    expect(await handleListarMeusChamados('u1')).toEqual({ sucesso: true, chamados: [] })
  })

  it('não quebra a tela quando a rede falha', async () => {
    vi.mocked(recuperacao.solicitarRecuperacao).mockRejectedValueOnce(FALHA)
    vi.mocked(recuperacao.redefinirSenha).mockRejectedValueOnce(FALHA)
    vi.mocked(suporte.abrirChamado).mockRejectedValueOnce(FALHA)
    vi.mocked(suporte.abrirChamadoSemLogin).mockRejectedValueOnce(FALHA)
    vi.mocked(suporte.listarMeusChamados).mockRejectedValueOnce(FALHA)

    expect((await handleSolicitarRecuperacao('a@exemplo.com')).sucesso).toBe(false)
    expect((await handleRedefinirSenha({} as never)).sucesso).toBe(false)
    expect((await handleAbrirChamado('u1', 'duvida', 'x')).sucesso).toBe(false)
    expect((await handleAbrirChamadoSemLogin({} as never)).sucesso).toBe(false)
    expect(await handleListarMeusChamados('u1')).toEqual({ sucesso: false, chamados: [] })
  })
})

describe('adminController', () => {
  it('carrega os dados do painel ou devolve nulo', async () => {
    vi.mocked(adminService.carregarIndicadores).mockResolvedValueOnce({} as never)
    vi.mocked(adminService.carregarUsuarios).mockRejectedValueOnce(FALHA)
    vi.mocked(adminService.carregarChamados).mockResolvedValueOnce([])

    expect(await admin.handleCarregarIndicadores()).toEqual({})
    expect(await admin.handleCarregarUsuarios()).toBeNull()
    expect(await admin.handleCarregarChamados()).toEqual([])
  })

  it('repassa as ações e trata as falhas', async () => {
    vi.mocked(adminService.responderChamado).mockResolvedValueOnce(OK)
    vi.mocked(adminService.alterarSituacao).mockResolvedValueOnce(OK)
    vi.mocked(adminService.registrarAlteracaoEmail).mockResolvedValueOnce(OK)
    vi.mocked(adminService.conferirTitulos).mockResolvedValueOnce(OK)
    vi.mocked(adminService.alterarBloqueio).mockRejectedValueOnce(FALHA)

    expect(await admin.handleResponderChamado('c1', 'Resposta')).toBe(OK)
    expect(await admin.handleAlterarSituacao('c1', 'encerrado')).toBe(OK)
    expect(await admin.handleRegistrarAlteracaoEmail('c1')).toBe(OK)
    expect(await admin.handleConferirTitulos('a@exemplo.com', 'Inglês')).toBe(OK)
    expect((await admin.handleAlterarBloqueio(USUARIO, 'admin', true, 'Motivo')).mensagem).toContain('bloqueio')
  })
})
