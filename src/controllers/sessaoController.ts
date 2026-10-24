import { apagarSessaoLocal, lerSessaoLocal, salvarSessaoLocal } from '../repositories/sessaoLocalRepository'
import { confirmacaoConfere } from '../services/confirmacaoReflexiva'
import { PALAVRA_DESCARTAR, sessaoAoReabrir, type SessaoEmAndamento } from '../services/sessaoService'
import { inserirSessao } from '../repositories/sessaoRepository'
import { estadoDaSessao, minutosRegistrados, validarAprendizado, type Sessao } from '../services/sessaoService'

export function handleRestaurarSessao(): SessaoEmAndamento | null {
  const guardada = lerSessaoLocal()
  if (!guardada) return null

  return {
    usuarioId: guardada.usuarioId,
    sessao: sessaoAoReabrir(guardada.sessao, guardada.ultimoSinal),
    tituloFoco: guardada.tituloFoco,
    porcentagemFoco: guardada.porcentagemFoco,
  }
}

export function handleGuardarSessao(emAndamento: SessaoEmAndamento): void {
  salvarSessaoLocal(emAndamento)
}

export function handleApagarSessao(): void {
  apagarSessaoLocal()
}

export function handleConfirmarDescarte(textoDigitado: string): boolean {
  return confirmacaoConfere(textoDigitado, PALAVRA_DESCARTAR)
}
export type ResultadoSalvar = { sucesso: true } | { sucesso: false; mensagem: string }

export async function handleSalvarSessao(sessao: Sessao, textoAprendizado: string): Promise<ResultadoSalvar> {
  if (estadoDaSessao(sessao, Date.now()) !== 'concluida') {
    return { sucesso: false, mensagem: 'Só sessões concluídas podem ser registradas.' }
  }

  const aprendizado = validarAprendizado(textoAprendizado)
  if (!aprendizado.valido) {
    return { sucesso: false, mensagem: aprendizado.mensagem }
  }

  try {
    await inserirSessao({
      focoId: sessao.focoId,
      duracaoMinutos: minutosRegistrados(sessao),
      aprendizado: aprendizado.texto,
    })
    return { sucesso: true }
  } catch {
    return {
      sucesso: false,
      mensagem: 'Não foi possível salvar agora. Confira sua conexão e tente de novo: sua sessão continua guardada.',
    }
  }
}