import type { IndicadoresAdmin, UsuarioAdmin } from '../repositories/adminRepository'
import type { Chamado } from '../repositories/suporteRepository'
import {
  alterarBloqueio,
  alterarSituacao,
  carregarChamados,
  carregarIndicadores,
  carregarUsuarios,
  conferirTitulos,
  registrarAlteracaoEmail,
  responderChamado,
  type ResultadoAdmin,
} from '../services/adminService'

const MENSAGEM_SEM_CONEXAO = 'Confira sua conexão e tente de novo.'

async function protegido(acao: () => Promise<ResultadoAdmin>, mensagemErro: string): Promise<ResultadoAdmin> {
  try {
    return await acao()
  } catch (erro) {
    console.error(erro)
    return { sucesso: false, mensagem: `${mensagemErro} ${MENSAGEM_SEM_CONEXAO}` }
  }
}

async function carregar<T>(acao: () => Promise<T>): Promise<T | null> {
  try {
    return await acao()
  } catch (erro) {
    console.error(erro)
    return null
  }
}

export function handleCarregarIndicadores(): Promise<IndicadoresAdmin | null> {
  return carregar(carregarIndicadores)
}

export function handleCarregarUsuarios(): Promise<UsuarioAdmin[] | null> {
  return carregar(carregarUsuarios)
}

export function handleCarregarChamados(): Promise<Chamado[] | null> {
  return carregar(carregarChamados)
}

export function handleResponderChamado(chamadoId: string, texto: string): Promise<ResultadoAdmin> {
  return protegido(() => responderChamado(chamadoId, texto), 'Não foi possível registrar a resposta agora.')
}

export function handleAlterarSituacao(chamadoId: string, status: 'em_andamento' | 'encerrado'): Promise<ResultadoAdmin> {
  return protegido(() => alterarSituacao(chamadoId, status), 'Não foi possível alterar a situação agora.')
}

export function handleRegistrarAlteracaoEmail(chamadoId: string): Promise<ResultadoAdmin> {
  return protegido(() => registrarAlteracaoEmail(chamadoId), 'Não foi possível registrar a alteração agora.')
}

export function handleConferirTitulos(email: string, texto: string): Promise<ResultadoAdmin> {
  return protegido(() => conferirTitulos(email, texto), 'Não foi possível conferir os títulos agora.')
}

export function handleAlterarBloqueio(
  usuario: UsuarioAdmin,
  adminId: string,
  bloquear: boolean,
  motivo: string,
): Promise<ResultadoAdmin> {
  return protegido(() => alterarBloqueio(usuario, adminId, bloquear, motivo), 'Não foi possível alterar o bloqueio agora.')
}
