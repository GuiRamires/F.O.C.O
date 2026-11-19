import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../repositories/adminRepository', () => ({
  alterarBloqueioNoServidor: vi.fn(),
  atualizarSituacaoChamado: vi.fn(),
  buscarIndicadoresAdmin: vi.fn(),
  buscarUsuariosAdmin: vi.fn(),
  conferirTitulosDaConta: vi.fn(),
  enviarAvisoDeResposta: vi.fn(),
  registrarAlteracaoEmailNoLog: vi.fn(),
  registrarRespostaChamado: vi.fn(),
}))

vi.mock('../repositories/suporteRepository', () => ({
  listarTodosOsChamados: vi.fn(),
}))

import {
  alterarBloqueioNoServidor,
  atualizarSituacaoChamado,
  buscarIndicadoresAdmin,
  buscarUsuariosAdmin,
  conferirTitulosDaConta,
  enviarAvisoDeResposta,
  registrarAlteracaoEmailNoLog,
  registrarRespostaChamado,
  type UsuarioAdmin,
} from '../repositories/adminRepository'
import { listarTodosOsChamados, type Chamado } from '../repositories/suporteRepository'
import {
  alterarBloqueio,
  alterarSituacao,
  carregarChamados,
  carregarIndicadores,
  carregarUsuarios,
  conferirTitulos,
  contarPorSituacao,
  descreverConferencia,
  filtrarChamados,
  filtrarUsuarios,
  podeAlterarBloqueio,
  registrarAlteracaoEmail,
  responderChamado,
  separarTitulos,
  usuarioDoChamado,
  validarMotivo,
  validarResposta,
} from './adminService'

const ADMIN = 'admin-1'

const USUARIOS: UsuarioAdmin[] = [
  { id: 'u1', nome: 'Maria Souza', email: 'maria@exemplo.com', papel: 'aluno', cadastradoEm: '', ultimoAcesso: null, bloqueado: false, totalFocos: 3 },
  { id: 'u2', nome: 'João Lima', email: 'joao@exemplo.com', papel: 'aluno', cadastradoEm: '', ultimoAcesso: null, bloqueado: true, totalFocos: 1 },
  { id: ADMIN, nome: 'Admin', email: 'admin@exemplo.com', papel: 'admin', cadastradoEm: '', ultimoAcesso: null, bloqueado: false, totalFocos: 0 },
]

function chamado(dados: Partial<Chamado>): Chamado {
  return {
    id: 'c1',
    numero: 1,
    user_id: 'u1',
    categoria: 'duvida',
    descricao: 'Pergunta qualquer aqui',
    status: 'aberto',
    email_informado: null,
    email_contato: null,
    nome_informado: null,
    cadastro_informado: null,
    ultimo_acesso_informado: null,
    titulos_informados: null,
    created_at: '',
    atualizado_em: '',
    respostas_chamado: [],
    ...dados,
  }
}

describe('atendimento de chamados (RF30)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('a resposta tem até 2.000 caracteres (RN30.2)', () => {
    expect(validarResposta(' ')).toBe('Escreva a resposta.')
    expect(validarResposta('a'.repeat(2001))).toContain('2000')
    expect(validarResposta('Resposta.')).toBeNull()
  })

  it('registra a resposta e avisa o usuário por e-mail (CA30.1)', async () => {
    const resultado = await responderChamado('c1', '  Veja o Laboratório de Sonhos.  ')

    expect(registrarRespostaChamado).toHaveBeenCalledWith('c1', 'Veja o Laboratório de Sonhos.')
    expect(enviarAvisoDeResposta).toHaveBeenCalledWith('c1')
    expect(resultado.mensagem).toContain('avisado por e-mail')
  })

  it('mantém a resposta mesmo se o aviso por e-mail falhar', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(enviarAvisoDeResposta).mockRejectedValueOnce(new Error('falha'))

    const resultado = await responderChamado('c1', 'Resposta.')

    expect(resultado).toEqual({ sucesso: true, mensagem: 'Resposta registrada, mas o aviso por e-mail não pôde ser enviado agora.' })
  })

  it('não registra resposta vazia', async () => {
    const resultado = await responderChamado('c1', ' ')

    expect(resultado.sucesso).toBe(false)
    expect(registrarRespostaChamado).not.toHaveBeenCalled()
  })

  it('altera a situação do chamado', async () => {
    expect((await alterarSituacao('c1', 'encerrado')).mensagem).toBe('Chamado encerrado.')
    expect((await alterarSituacao('c1', 'em_andamento')).mensagem).toContain('em andamento')
    expect(atualizarSituacaoChamado).toHaveBeenCalledTimes(2)
  })

  it('filtra por situação e categoria e conta por situação', () => {
    const chamados = [chamado({ id: 'a' }), chamado({ id: 'b', status: 'respondido' }), chamado({ id: 'c', categoria: 'sugestao' })]

    expect(filtrarChamados(chamados, 'aberto', '').map((item) => item.id)).toEqual(['a', 'c'])
    expect(filtrarChamados(chamados, '', 'sugestao').map((item) => item.id)).toEqual(['c'])
    expect(filtrarChamados(chamados, '', '')).toHaveLength(3)
    const numerados = [chamado({ id: 'x', numero: 12 }), chamado({ id: 'y', numero: 120, status: 'encerrado' })]
    expect(filtrarChamados(numerados, 'aberto', 'duvida', ' 120 ').map((item) => item.id)).toEqual(['y'])
    expect(contarPorSituacao(chamados)).toEqual({ aberto: 2, respondido: 1 })
  })

  it('encontra o usuário do chamado pelo id ou pelo e-mail informado', () => {
    expect(usuarioDoChamado(chamado({ user_id: 'u2' }), USUARIOS)?.nome).toBe('João Lima')
    expect(usuarioDoChamado(chamado({ user_id: null, email_informado: 'MARIA@exemplo.com' }), USUARIOS)?.id).toBe('u1')
    expect(usuarioDoChamado(chamado({ user_id: null, email_informado: 'ninguem@exemplo.com' }), USUARIOS)).toBeNull()
    expect(usuarioDoChamado(chamado({ user_id: 'u9' }), USUARIOS)).toBeNull()
  })
})

describe('verificação de identidade (RF30, fluxo alternativo)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('separa os títulos informados sem repetir', () => {
    expect(separarTitulos('Inglês, redação;\nINGLÊS\n\n')).toEqual(['Inglês', 'redação'])
  })

  it('descreve o resultado sem exibir títulos (CA30.4)', async () => {
    vi.mocked(conferirTitulosDaConta).mockResolvedValueOnce(1)

    const resultado = await conferirTitulos(' maria@exemplo.com ', 'Inglês, Cálculo')

    expect(conferirTitulosDaConta).toHaveBeenCalledWith('maria@exemplo.com', ['Inglês', 'Cálculo'])
    expect(resultado.mensagem).toBe('1 título corresponde a Focos da conta, de 2 informados.')
    expect(resultado.mensagem).not.toContain('Inglês')
  })

  it('registra a alteração de e-mail feita pelo painel de autenticação (RN30.6)', async () => {
    const resultado = await registrarAlteracaoEmail('c1')

    expect(registrarAlteracaoEmailNoLog).toHaveBeenCalledWith('c1')
    expect(resultado.sucesso).toBe(true)
  })

  it('descreve nenhuma e várias correspondências', () => {
    expect(descreverConferencia(0, 3)).toContain('Nenhum dos 3')
    expect(descreverConferencia(2, 3)).toContain('2 títulos correspondem')
  })

  it('pede ao menos um título e o e-mail', async () => {
    const resultado = await conferirTitulos('maria@exemplo.com', ' , ')

    expect(resultado).toEqual({ sucesso: false, mensagem: 'Informe ao menos um título.' })
    expect(conferirTitulosDaConta).not.toHaveBeenCalled()
  })
})

describe('consulta e bloqueio de usuários (RF33)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('busca por nome ou e-mail', () => {
    expect(filtrarUsuarios(USUARIOS, 'maria').map((usuario) => usuario.id)).toEqual(['u1'])
    expect(filtrarUsuarios(USUARIOS, 'JOAO@').map((usuario) => usuario.id)).toEqual(['u2'])
    expect(filtrarUsuarios(USUARIOS, '  ')).toHaveLength(3)
  })

  it('o motivo é obrigatório (RN33.5)', () => {
    expect(validarMotivo('abc')).toBe('Escreva pelo menos 5 caracteres no motivo.')
    expect(validarMotivo('a'.repeat(201))).toContain('200')
    expect(validarMotivo('Análise de perda de acesso')).toBeNull()
  })

  it('o Administrador não bloqueia a própria conta (RN33.4)', async () => {
    expect(podeAlterarBloqueio(USUARIOS[2], ADMIN)).toBe(false)

    const resultado = await alterarBloqueio(USUARIOS[2], ADMIN, true, 'Teste de bloqueio')

    expect(resultado.sucesso).toBe(false)
    expect(alterarBloqueioNoServidor).not.toHaveBeenCalled()
  })

  it('bloqueia e desbloqueia pelo servidor com o motivo', async () => {
    expect((await alterarBloqueio(USUARIOS[0], ADMIN, true, ' Análise de acesso ')).mensagem).toBe('Conta bloqueada.')
    expect(alterarBloqueioNoServidor).toHaveBeenCalledWith('u1', true, 'Análise de acesso')
    expect((await alterarBloqueio(USUARIOS[1], ADMIN, false, 'Verificação aprovada')).mensagem).toBe('Conta desbloqueada.')
  })

  it('não bloqueia sem motivo', async () => {
    const resultado = await alterarBloqueio(USUARIOS[0], ADMIN, true, '')

    expect(resultado.sucesso).toBe(false)
    expect(alterarBloqueioNoServidor).not.toHaveBeenCalled()
  })

  it('carrega indicadores, usuários e chamados pelos repositórios', async () => {
    vi.mocked(buscarIndicadoresAdmin).mockResolvedValueOnce({} as never)
    vi.mocked(buscarUsuariosAdmin).mockResolvedValueOnce(USUARIOS)
    vi.mocked(listarTodosOsChamados).mockResolvedValueOnce([])

    await carregarIndicadores()
    expect(await carregarUsuarios()).toBe(USUARIOS)
    expect(await carregarChamados()).toEqual([])
  })
})
