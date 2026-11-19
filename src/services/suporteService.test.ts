import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../repositories/suporteRepository', () => ({
  enviarChamadoSemLogin: vi.fn(),
  inserirChamado: vi.fn(),
  listarChamadosDoUsuario: vi.fn(),
}))

vi.mock('./logService', () => ({
  registrarLog: vi.fn(),
}))

import { enviarChamadoSemLogin, inserirChamado, listarChamadosDoUsuario } from '../repositories/suporteRepository'
import { registrarLog } from './logService'
import {
  abrirChamado,
  abrirChamadoSemLogin,
  listarMeusChamados,
  mascararDescricao,
  mascararVerificacao,
  MENSAGEM_CHAMADO_SEM_LOGIN,
  mensagemChamadoSemLogin,
  rotuloDaCategoria,
  rotuloDaSituacao,
  temRespostaNova,
  validarCategoria,
  validarChamadoSemLogin,
  validarDescricao,
} from './suporteService'

const SEM_LOGIN = {
  emailCadastrado: ' Maria@Exemplo.com ',
  emailContato: 'contato@exemplo.com',
  nome: ' Maria Souza ',
  dataCadastro: 'setembro de 2026',
  ultimoAcesso: '',
  titulos: 'Inglês, Cálculo ',
  descricao: 'Perdi o acesso ao meu e-mail antigo e não consigo entrar.',
}

describe('chamados de suporte (RF29)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('a descrição tem de 10 a 1.000 caracteres permitidos (RN29.1)', () => {
    expect(validarDescricao('curto')).toContain('pelo menos 10')
    expect(validarDescricao('a'.repeat(1001))).toContain('até 1000')
    expect(validarDescricao('Texto com <b> no meio')).toContain('use só letras')
    expect(validarDescricao('O temporizador parou de tocar.')).toBeNull()
    expect(mascararDescricao('Olá <script>!')).toBe('Olá script!')
  })

  it('aceita apenas as categorias definidas', () => {
    expect(validarCategoria('duvida')).toBeNull()
    expect(validarCategoria('outra')).toBe('Escolha uma categoria.')
    expect(rotuloDaCategoria('privacidade_dados')).toBe('Privacidade e dados')
    expect(rotuloDaCategoria('desconhecida')).toBe('desconhecida')
    expect(rotuloDaSituacao('em_andamento')).toBe('Em andamento')
    expect(rotuloDaSituacao('x')).toBe('x')
  })

  it('abre o chamado e registra o log sem a descrição (CA29.1 e RN08.6)', async () => {
    vi.mocked(inserirChamado).mockResolvedValueOnce({ id: 'chamado-1', numero: 12 })

    const resultado = await abrirChamado('usuario-1', 'problema_tecnico', '  O temporizador parou de tocar.  ')

    expect(inserirChamado).toHaveBeenCalledWith('problema_tecnico', 'O temporizador parou de tocar.')
    expect(registrarLog).toHaveBeenCalledWith('usuario-1', 'abrir_chamado', {
      chamado_id: 'chamado-1',
      categoria: 'problema_tecnico',
    })
    expect(resultado.sucesso).toBe(true)
    expect(resultado.mensagem).toContain('Chamado nº 12 aberto')
  })

  it('não abre chamado inválido', async () => {
    const resultado = await abrirChamado('usuario-1', 'duvida', 'curto')

    expect(resultado.sucesso).toBe(false)
    expect(inserirChamado).not.toHaveBeenCalled()
  })

  it('lista os chamados do próprio usuário', async () => {
    vi.mocked(listarChamadosDoUsuario).mockResolvedValueOnce([])

    await listarMeusChamados('usuario-1')

    expect(listarChamadosDoUsuario).toHaveBeenCalledWith('usuario-1')
  })

  it('identifica o chamado respondido', () => {
    const base = {
      id: 'c1',
      numero: 1,
      user_id: 'u1',
      categoria: 'duvida',
      descricao: 'Pergunta qualquer aqui',
      email_informado: null,
      email_contato: null,
      nome_informado: null,
      cadastro_informado: null,
      ultimo_acesso_informado: null,
      titulos_informados: null,
      created_at: '',
      atualizado_em: '',
      respostas_chamado: [],
    }
    expect(temRespostaNova({ ...base, status: 'respondido' })).toBe(true)
    expect(temRespostaNova({ ...base, status: 'aberto' })).toBe(false)
  })
})

describe('chamado sem login (RF29, fluxo alternativo)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('valida os dois e-mails e a descrição', () => {
    expect(validarChamadoSemLogin({ ...SEM_LOGIN, emailCadastrado: 'x', emailContato: '' })).toEqual([
      'E-mail cadastrado: Informe um e-mail válido.',
      'E-mail de contato: O e-mail é obrigatório.',
    ])
  })

  it('exige o nome e ao menos um título para a verificação de identidade (RF30)', () => {
    expect(validarChamadoSemLogin({ ...SEM_LOGIN, nome: ' ', titulos: '' })).toEqual([
      'Informe o nome usado no cadastro.',
      'Informe o título de pelo menos um Foco.',
    ])
    expect(mascararVerificacao('Inglês <b>, 10/11/2026', 300)).toBe('Inglês b, 10/11/2026')
    expect(mascararVerificacao('a'.repeat(90), 80)).toHaveLength(80)
  })

  it('envia os dados normalizados e mostra sempre a mesma confirmação (CA29.3)', async () => {
    vi.mocked(enviarChamadoSemLogin).mockResolvedValueOnce({ situacao: 'enviado', numero: 7 })

    const resultado = await abrirChamadoSemLogin(SEM_LOGIN)

    expect(enviarChamadoSemLogin).toHaveBeenCalledWith({
      emailCadastrado: 'maria@exemplo.com',
      emailContato: 'contato@exemplo.com',
      nome: 'Maria Souza',
      dataCadastro: 'setembro de 2026',
      ultimoAcesso: '',
      titulos: 'Inglês, Cálculo',
      descricao: 'Perdi o acesso ao meu e-mail antigo e não consigo entrar.',
    })
    expect(resultado).toEqual({
      sucesso: true,
      mensagem: `Pedido registrado como chamado nº 7. ${MENSAGEM_CHAMADO_SEM_LOGIN}`,
    })
    expect(mensagemChamadoSemLogin(null)).toBe(MENSAGEM_CHAMADO_SEM_LOGIN)
  })

  it('informa o limite de envios por hora (RNF12)', async () => {
    vi.mocked(enviarChamadoSemLogin).mockResolvedValueOnce({ situacao: 'limite' })

    const resultado = await abrirChamadoSemLogin(SEM_LOGIN)

    expect(resultado.sucesso).toBe(false)
    expect(resultado.mensagem).toContain('última hora')
  })

  it('não envia dados inválidos', async () => {
    const resultado = await abrirChamadoSemLogin({ ...SEM_LOGIN, descricao: 'curto' })

    expect(resultado.sucesso).toBe(false)
    expect(enviarChamadoSemLogin).not.toHaveBeenCalled()
  })
})
