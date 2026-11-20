import { describe, expect, it } from 'vitest'
import { chaveDaTela, deveSubstituir, estadoAoVoltar, type EstadoDaNavegacao } from './navegacao'

const VISITANTE: EstadoDaNavegacao = {
  logado: false,
  emSessao: false,
  recuperandoSenha: false,
  contaFoiExcluida: false,
  telaAuth: 'inicio',
  paginaPublica: 'inicio',
  telaAtual: 'lista',
  temFocoSelecionado: false,
}

const ALUNO: EstadoDaNavegacao = { ...VISITANTE, logado: true }

describe('identificar a tela atual no histórico', () => {
  it('usa a página pública quando ninguém entrou', () => {
    expect(chaveDaTela({ ...VISITANTE, paginaPublica: 'metodo' })).toBe('site:metodo')
  })

  it('usa as telas de acesso quando o visitante sai do site público', () => {
    expect(chaveDaTela({ ...VISITANTE, telaAuth: 'login' })).toBe('acesso:login')
    expect(chaveDaTela({ ...VISITANTE, telaAuth: 'chamadoSemLogin' })).toBe('acesso:chamadoSemLogin')
    expect(chaveDaTela({ ...VISITANTE, contaFoiExcluida: true })).toBe('acesso:contaExcluida')
  })

  it('mantém a recuperação de senha mesmo depois de validar o código', () => {
    expect(chaveDaTela({ ...ALUNO, recuperandoSenha: true })).toBe('acesso:recuperarSenha')
  })

  it('usa a tela do app quando o aluno está logado', () => {
    expect(chaveDaTela({ ...ALUNO, telaAtual: 'estatisticas' })).toBe('app:estatisticas')
  })

  it('trata a sessão de foco como uma tela à parte', () => {
    expect(chaveDaTela({ ...ALUNO, telaAtual: 'preparacao', emSessao: true })).toBe('app:timer')
  })
})

describe('decidir entre empilhar e substituir no histórico', () => {
  it('empilha a navegação comum', () => {
    expect(deveSubstituir('site:inicio', 'site:metodo')).toBe(false)
    expect(deveSubstituir('site:inicio', 'acesso:login')).toBe(false)
    expect(deveSubstituir('app:lista', 'app:conta')).toBe(false)
  })

  it('substitui ao entrar ou sair do app', () => {
    expect(deveSubstituir('acesso:login', 'app:lista')).toBe(true)
    expect(deveSubstituir('app:lista', 'site:inicio')).toBe(true)
  })

  it('substitui ao começar e ao terminar a sessão de foco', () => {
    expect(deveSubstituir('app:preparacao', 'app:timer')).toBe(true)
    expect(deveSubstituir('app:timer', 'app:estatisticas')).toBe(true)
  })
})

describe('voltar e avançar pelo navegador', () => {
  it('não deixa sair da sessão de foco em andamento', () => {
    expect(estadoAoVoltar('app:lista', { ...ALUNO, emSessao: true })).toBeNull()
  })

  it('leva o aluno logado para a tela do app guardada no histórico', () => {
    expect(estadoAoVoltar('app:conta', ALUNO)?.telaAtual).toBe('conta')
  })

  it('leva o aluno logado para os Focos quando o histórico aponta para o site público', () => {
    const novo = estadoAoVoltar('acesso:login', { ...ALUNO, telaAtual: 'estatisticas' })
    expect(novo?.logado).toBe(true)
    expect(novo?.telaAtual).toBe('lista')
  })

  it('não volta para a preparação sem um Foco escolhido', () => {
    expect(estadoAoVoltar('app:preparacao', ALUNO)?.telaAtual).toBe('lista')
    expect(estadoAoVoltar('app:preparacao', { ...ALUNO, temFocoSelecionado: true })?.telaAtual).toBe('preparacao')
  })

  it('leva o visitante para a página pública ou a tela de acesso guardada', () => {
    expect(estadoAoVoltar('site:sobre', { ...VISITANTE, telaAuth: 'login' })).toMatchObject({
      telaAuth: 'inicio',
      paginaPublica: 'sobre',
    })
    expect(estadoAoVoltar('acesso:cadastro', VISITANTE)?.telaAuth).toBe('cadastro')
  })

  it('leva o visitante para o início quando o histórico aponta para dentro do app', () => {
    expect(estadoAoVoltar('app:lista', { ...VISITANTE, paginaPublica: 'metodo' })).toMatchObject({
      telaAuth: 'inicio',
      paginaPublica: 'inicio',
    })
  })

  it('sai da recuperação de senha e desconecta quem já tinha validado o código', () => {
    const novo = estadoAoVoltar('acesso:login', { ...ALUNO, recuperandoSenha: true })
    expect(novo).toMatchObject({ logado: false, recuperandoSenha: false, telaAuth: 'login' })
  })

  it('permanece na recuperação de senha quando o destino é ela mesma', () => {
    const estado = { ...ALUNO, recuperandoSenha: true }
    expect(estadoAoVoltar('acesso:recuperarSenha', estado)).toBe(estado)
  })

  it('não mostra de novo o aviso de conta excluída', () => {
    expect(estadoAoVoltar('acesso:contaExcluida', VISITANTE)).toMatchObject({
      contaFoiExcluida: false,
      telaAuth: 'inicio',
      paginaPublica: 'inicio',
    })
  })

  it('usa o início quando a entrada do histórico não é do F.O.C.O', () => {
    expect(estadoAoVoltar(null, VISITANTE)?.paginaPublica).toBe('inicio')
    expect(estadoAoVoltar(null, ALUNO)?.telaAtual).toBe('lista')
  })
})
