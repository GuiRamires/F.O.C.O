import { beforeEach, describe, expect, it, vi } from 'vitest'

const estado = vi.hoisted(() => ({
  resultado: { data: null as unknown, error: null as { message: string } | null },
  chamadas: [] as [string, unknown[]][],
}))

const supabaseFalso = vi.hoisted(() => {
  const consulta: Record<string, unknown> = {}
  for (const metodo of ['select', 'eq', 'in', 'order', 'insert', 'update', 'single']) {
    consulta[metodo] = (...args: unknown[]) => {
      estado.chamadas.push([metodo, args])
      return consulta
    }
  }
  consulta.then = (resolver: (valor: unknown) => unknown) => resolver(estado.resultado)
  return {
    from: vi.fn((tabela: string) => {
      estado.chamadas.push(['from', [tabela]])
      return consulta
    }),
    rpc: vi.fn(),
    functions: { invoke: vi.fn() },
    auth: {
      getUser: vi.fn(),
      updateUser: vi.fn(),
      reauthenticate: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      verifyOtp: vi.fn(),
      signOut: vi.fn(),
    },
  }
})

vi.mock('../supabaseClient', () => ({ supabase: supabaseFalso }))

import {
  alterarBloqueioNoServidor,
  atualizarSituacaoChamado,
  buscarIndicadoresAdmin,
  buscarUsuariosAdmin,
  conferirTitulosDaConta,
  enviarAvisoDeResposta,
  registrarAlteracaoEmailNoLog,
  registrarRespostaChamado,
} from './adminRepository'
import {
  atualizarNome,
  atualizarSenha,
  buscarEmailAtual,
  buscarPerfil,
  confirmarCodigoRecuperacao,
  encerrarSessao,
  excluirContaNoServidor,
  FalhaAutenticacao,
  solicitarCodigoReautenticacao,
  solicitarCodigoRecuperacao,
} from './contaRepository'
import { buscarFocosParaExportar, buscarSessoesParaExportar } from './exportacaoRepository'
import { enviarChamadoSemLogin, inserirChamado, listarChamadosDoUsuario, listarTodosOsChamados } from './suporteRepository'

const ERRO = { message: 'falhou' }

function responder(data: unknown, error: { message: string } | null = null) {
  estado.resultado = { data, error }
}

function chamou(metodo: string, ...args: unknown[]) {
  expect(estado.chamadas).toContainEqual([metodo, args])
}

beforeEach(() => {
  vi.clearAllMocks()
  estado.chamadas = []
  responder(null)
})

describe('suporteRepository', () => {
  it('lista os chamados do usuário com as respostas em ordem cronológica', async () => {
    responder([
      {
        id: 'c1',
        respostas_chamado: [
          { texto: 'segunda', created_at: '2026-11-16T12:00:00Z' },
          { texto: 'primeira', created_at: '2026-11-15T12:00:00Z' },
        ],
      },
    ])

    const chamados = await listarChamadosDoUsuario('u1')

    chamou('from', 'chamados')
    chamou('eq', 'user_id', 'u1')
    expect(chamados[0].respostas_chamado.map((resposta) => resposta.texto)).toEqual(['primeira', 'segunda'])
  })

  it('lista todos os chamados para o Administrador', async () => {
    responder([{ id: 'c1', respostas_chamado: null }])

    expect(await listarTodosOsChamados()).toEqual([{ id: 'c1', respostas_chamado: [] }])
  })

  it('insere o chamado só com categoria e descrição', async () => {
    responder({ id: 'c9', numero: 9 })

    expect(await inserirChamado('duvida', 'Pergunta qualquer')).toEqual({ id: 'c9', numero: 9 })
    chamou('insert', { categoria: 'duvida', descricao: 'Pergunta qualquer' })
    chamou('select', 'id, numero')
  })

  it('propaga os erros do banco', async () => {
    responder(null, ERRO)

    await expect(listarChamadosDoUsuario('u1')).rejects.toThrow('falhou')
    await expect(listarTodosOsChamados()).rejects.toThrow('falhou')
    await expect(inserirChamado('duvida', 'x')).rejects.toThrow('falhou')
  })

  it('identifica o limite de envios do chamado sem login', async () => {
    const dados = {
      emailCadastrado: 'a@exemplo.com',
      emailContato: 'b@exemplo.com',
      nome: 'Maria',
      dataCadastro: '',
      ultimoAcesso: '',
      titulos: 'Inglês',
      descricao: 'Perdi o acesso',
    }
    vi.mocked(supabaseFalso.functions.invoke)
      .mockResolvedValueOnce({ data: { sucesso: true, numero: 3 }, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'limite', context: { status: 429 } } })
      .mockResolvedValueOnce({ data: null, error: { message: 'erro', context: { status: 500 } } })

    expect(await enviarChamadoSemLogin(dados)).toEqual({ situacao: 'enviado', numero: 3 })
    expect(await enviarChamadoSemLogin(dados)).toEqual({ situacao: 'limite' })
    await expect(enviarChamadoSemLogin(dados)).rejects.toThrow('erro')
    expect(supabaseFalso.functions.invoke).toHaveBeenCalledWith('abrir-chamado-sem-login', { body: dados })
  })
})

describe('adminRepository', () => {
  it('converte os indicadores e os usuários', async () => {
    vi.mocked(supabaseFalso.rpc)
      .mockResolvedValueOnce({ data: [{ total_usuarios: '3', chamados_abertos: 2 }], error: null } as never)
      .mockResolvedValueOnce({
        data: [{ id: 'u1', nome: 'Maria', email: 'm@exemplo.com', papel: 'aluno', cadastrado_em: 'd', ultimo_acesso: null, bloqueado: false, total_focos: '4' }],
        error: null,
      } as never)

    const indicadores = await buscarIndicadoresAdmin()
    const usuarios = await buscarUsuariosAdmin()

    expect(indicadores).toMatchObject({ totalUsuarios: 3, chamadosAbertos: 2, totalFocos: 0 })
    expect(usuarios[0]).toMatchObject({ cadastradoEm: 'd', totalFocos: 4 })
  })

  it('chama as funções do banco com os parâmetros certos', async () => {
    vi.mocked(supabaseFalso.rpc).mockResolvedValue({ data: 1, error: null } as never)
    vi.mocked(supabaseFalso.functions.invoke).mockResolvedValue({ data: {}, error: null })

    await registrarRespostaChamado('c1', 'Resposta')
    await atualizarSituacaoChamado('c1', 'encerrado')
    await registrarAlteracaoEmailNoLog('c1')
    expect(await conferirTitulosDaConta('a@exemplo.com', ['Inglês'])).toBe(1)
    await enviarAvisoDeResposta('c1')
    await alterarBloqueioNoServidor('u1', true, 'Motivo')

    expect(supabaseFalso.rpc).toHaveBeenCalledWith('responder_chamado', { p_chamado_id: 'c1', p_texto: 'Resposta' })
    expect(supabaseFalso.rpc).toHaveBeenCalledWith('alterar_situacao_chamado', { p_chamado_id: 'c1', p_status: 'encerrado' })
    expect(supabaseFalso.rpc).toHaveBeenCalledWith('registrar_alteracao_email', { p_chamado_id: 'c1' })
    expect(supabaseFalso.rpc).toHaveBeenCalledWith('conferir_titulos', { p_email: 'a@exemplo.com', p_titulos: ['Inglês'] })
    expect(supabaseFalso.functions.invoke).toHaveBeenCalledWith('bloquear-usuario', {
      body: { usuarioId: 'u1', bloquear: true, motivo: 'Motivo' },
    })
  })

  it('propaga os erros', async () => {
    vi.mocked(supabaseFalso.rpc).mockResolvedValue({ data: null, error: ERRO } as never)
    vi.mocked(supabaseFalso.functions.invoke).mockResolvedValue({ data: null, error: ERRO })

    await expect(buscarIndicadoresAdmin()).rejects.toThrow('falhou')
    await expect(buscarUsuariosAdmin()).rejects.toThrow('falhou')
    await expect(registrarRespostaChamado('c1', 'x')).rejects.toThrow('falhou')
    await expect(atualizarSituacaoChamado('c1', 'encerrado')).rejects.toThrow('falhou')
    await expect(registrarAlteracaoEmailNoLog('c1')).rejects.toThrow('falhou')
    await expect(conferirTitulosDaConta('a@exemplo.com', [])).rejects.toThrow('falhou')
    await expect(enviarAvisoDeResposta('c1')).rejects.toThrow('falhou')
    await expect(alterarBloqueioNoServidor('u1', false, 'x')).rejects.toThrow('falhou')
  })
})

describe('contaRepository', () => {
  it('busca o perfil e atualiza o nome do próprio usuário', async () => {
    responder({ nome: 'Maria', papel: 'aluno', created_at: '2026-11-01' })

    expect(await buscarPerfil('u1')).toEqual({ nome: 'Maria', papel: 'aluno', criadoEm: '2026-11-01' })

    responder(null)
    await atualizarNome('u1', 'Maria Souza')
    chamou('update', { nome: 'Maria Souza' })
  })

  it('lê o e-mail da sessão', async () => {
    vi.mocked(supabaseFalso.auth.getUser)
      .mockResolvedValueOnce({ data: { user: { email: 'm@exemplo.com' } }, error: null } as never)
      .mockResolvedValueOnce({ data: { user: null }, error: null } as never)

    expect(await buscarEmailAtual()).toBe('m@exemplo.com')
    await expect(buscarEmailAtual()).rejects.toThrow()
  })

  it('envia o código de verificação como nonce na troca de senha', async () => {
    vi.mocked(supabaseFalso.auth.updateUser).mockResolvedValue({ data: {}, error: null } as never)

    await atualizarSenha('NovaSenha7x')
    await atualizarSenha('NovaSenha7x', '123456')

    expect(supabaseFalso.auth.updateUser).toHaveBeenNthCalledWith(1, { password: 'NovaSenha7x' })
    expect(supabaseFalso.auth.updateUser).toHaveBeenNthCalledWith(2, { password: 'NovaSenha7x', nonce: '123456' })
  })

  it('converte as falhas de autenticação com o código do erro', async () => {
    vi.mocked(supabaseFalso.auth.reauthenticate).mockResolvedValueOnce({
      data: {},
      error: { code: 'over_email_send_rate_limit', message: 'after 30 seconds', status: 429 },
    } as never)

    const erro = await solicitarCodigoReautenticacao().catch((falha) => falha)

    expect(erro).toBeInstanceOf(FalhaAutenticacao)
    expect(erro).toMatchObject({ codigo: 'over_email_send_rate_limit', status: 429 })
  })

  it('pede e confirma o código de recuperação', async () => {
    vi.mocked(supabaseFalso.auth.resetPasswordForEmail).mockResolvedValueOnce({ data: {}, error: null } as never)
    vi.mocked(supabaseFalso.auth.verifyOtp)
      .mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null } as never)
      .mockResolvedValueOnce({ data: { user: null }, error: { code: 'otp_expired', message: 'expirou', status: 403 } } as never)

    await solicitarCodigoRecuperacao('m@exemplo.com')
    expect(await confirmarCodigoRecuperacao('m@exemplo.com', '123456')).toBe('u1')
    await expect(confirmarCodigoRecuperacao('m@exemplo.com', '000000')).rejects.toMatchObject({ codigo: 'otp_expired' })
    expect(supabaseFalso.auth.verifyOtp).toHaveBeenCalledWith({ email: 'm@exemplo.com', token: '123456', type: 'recovery' })
  })

  it('exclui a conta pelo servidor e encerra a sessão local', async () => {
    vi.mocked(supabaseFalso.functions.invoke)
      .mockResolvedValueOnce({ data: {}, error: null })
      .mockResolvedValueOnce({ data: null, error: ERRO })

    await excluirContaNoServidor('EXCLUIR')
    await expect(excluirContaNoServidor('EXCLUIR')).rejects.toThrow('falhou')
    await encerrarSessao()

    expect(supabaseFalso.functions.invoke).toHaveBeenCalledWith('excluir-conta', { body: { confirmacao: 'EXCLUIR' } })
    expect(supabaseFalso.auth.signOut).toHaveBeenCalledWith({ scope: 'local' })
  })
})

describe('exportacaoRepository', () => {
  it('busca os Focos do usuário e as sessões desses Focos', async () => {
    responder([{ id: 'f1' }])

    expect(await buscarFocosParaExportar('u1')).toEqual([{ id: 'f1' }])
    chamou('eq', 'user_id', 'u1')

    expect(await buscarSessoesParaExportar(['f1'])).toEqual([{ id: 'f1' }])
    chamou('in', 'foco_id', ['f1'])
  })

  it('não consulta sessões quando não há Focos', async () => {
    expect(await buscarSessoesParaExportar([])).toEqual([])
    expect(supabaseFalso.from).not.toHaveBeenCalled()
  })

  it('propaga os erros', async () => {
    responder(null, ERRO)

    await expect(buscarFocosParaExportar('u1')).rejects.toThrow('falhou')
    await expect(buscarSessoesParaExportar(['f1'])).rejects.toThrow('falhou')
  })
})
