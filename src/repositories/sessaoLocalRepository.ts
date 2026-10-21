import type { SessaoEmAndamento } from '../services/sessaoService'

const CHAVE = 'foco:sessao-em-andamento'

export interface SessaoGuardada extends SessaoEmAndamento {
  ultimoSinal: number
}

export function salvarSessaoLocal(emAndamento: SessaoEmAndamento): void {
  const dados: SessaoGuardada = { ...emAndamento, ultimoSinal: Date.now() }
  try {
    localStorage.setItem(CHAVE, JSON.stringify(dados))
  } catch (erro) {
    console.warn('Não foi possível guardar a sessão no navegador.', erro)
  }
}

export function lerSessaoLocal(): SessaoGuardada | null {
  try {
    const texto = localStorage.getItem(CHAVE)
    if (!texto) return null
    const dados: unknown = JSON.parse(texto)
    return ehSessaoGuardadaValida(dados) ? dados : null
  } catch {
    return null
  }
}

export function apagarSessaoLocal(): void {
  try {
    localStorage.removeItem(CHAVE)
  } catch (erro) {
    console.warn('Não foi possível apagar a sessão do navegador.', erro)
  }
}

export function ehSessaoGuardadaValida(valor: unknown): valor is SessaoGuardada {
  if (typeof valor !== 'object' || valor === null) return false
  const dados = valor as Record<string, unknown>
  const sessao = dados.sessao as Record<string, unknown> | null | undefined

  return (
    typeof dados.usuarioId === 'string' &&
    typeof dados.tituloFoco === 'string' &&
    typeof dados.porcentagemFoco === 'number' &&
    typeof dados.ultimoSinal === 'number' &&
    typeof sessao === 'object' &&
    sessao !== null &&
    typeof sessao.focoId === 'string' &&
    typeof sessao.duracaoMs === 'number' &&
    typeof sessao.inicioEm === 'number' &&
    typeof sessao.tempoPausadoMs === 'number' &&
    (sessao.pausadaEm === null || typeof sessao.pausadaEm === 'number')
  )
}