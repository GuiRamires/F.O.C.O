import type { PaginaPublica } from '../conteudo/site'

export type TelaAuth = 'inicio' | 'login' | 'cadastro' | 'chamadoSemLogin'
export type TelaAtual = 'lista' | 'novoFoco' | 'preparacao' | 'estatisticas' | 'conta' | 'suporte' | 'sobre'

export interface EstadoDaNavegacao {
  logado: boolean
  emSessao: boolean
  recuperandoSenha: boolean
  contaFoiExcluida: boolean
  telaAuth: TelaAuth
  paginaPublica: PaginaPublica
  telaAtual: TelaAtual
  temFocoSelecionado: boolean
}

const PAGINAS_PUBLICAS: readonly string[] = ['inicio', 'metodo', 'funcionalidades', 'sobre', 'comecar', 'termo']
const TELAS_DE_ACESSO: readonly string[] = ['login', 'cadastro', 'chamadoSemLogin']
const TELAS_DO_APP: readonly string[] = ['lista', 'novoFoco', 'preparacao', 'estatisticas', 'conta', 'suporte', 'sobre']

export function chaveDaTela(estado: EstadoDaNavegacao): string {
  if (estado.recuperandoSenha) return 'acesso:recuperarSenha'
  if (!estado.logado) {
    if (estado.contaFoiExcluida) return 'acesso:contaExcluida'
    return estado.telaAuth === 'inicio' ? `site:${estado.paginaPublica}` : `acesso:${estado.telaAuth}`
  }
  return estado.emSessao ? 'app:timer' : `app:${estado.telaAtual}`
}

function dentroDoApp(chave: string): boolean {
  return chave.startsWith('app:')
}

export function deveSubstituir(anterior: string, atual: string): boolean {
  if (dentroDoApp(anterior) !== dentroDoApp(atual)) return true
  return anterior === 'app:timer' || atual === 'app:timer'
}

export function estadoAoVoltar(chave: string | null, estado: EstadoDaNavegacao): EstadoDaNavegacao | null {
  if (estado.emSessao) return null

  const [area = '', tela = ''] = (chave ?? '').split(':')

  if (estado.recuperandoSenha && chave === 'acesso:recuperarSenha') return estado

  if (estado.logado && !estado.recuperandoSenha) {
    const destino = area === 'app' && TELAS_DO_APP.includes(tela) ? (tela as TelaAtual) : 'lista'
    const telaAtual = destino === 'preparacao' && !estado.temFocoSelecionado ? 'lista' : destino
    return { ...estado, telaAtual }
  }

  const foraDoApp: EstadoDaNavegacao = { ...estado, logado: false, recuperandoSenha: false, contaFoiExcluida: false }

  if (area === 'site' && PAGINAS_PUBLICAS.includes(tela)) {
    return { ...foraDoApp, telaAuth: 'inicio', paginaPublica: tela as PaginaPublica }
  }

  if (area === 'acesso' && TELAS_DE_ACESSO.includes(tela)) {
    return { ...foraDoApp, telaAuth: tela as TelaAuth }
  }

  if (area === 'acesso' && tela === 'recuperarSenha') {
    return { ...foraDoApp, recuperandoSenha: true }
  }

  return { ...foraDoApp, telaAuth: 'inicio', paginaPublica: 'inicio' }
}
