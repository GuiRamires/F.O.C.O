import {
  alterarBloqueioNoServidor,
  atualizarSituacaoChamado,
  buscarIndicadoresAdmin,
  buscarUsuariosAdmin,
  conferirTitulosDaConta,
  enviarAvisoDeResposta,
  registrarAlteracaoEmailNoLog,
  registrarRespostaChamado,
  type IndicadoresAdmin,
  type UsuarioAdmin,
} from '../repositories/adminRepository'
import { listarTodosOsChamados, type Chamado } from '../repositories/suporteRepository'

export const LIMITE_RESPOSTA = 2000
export const LIMITE_MINIMO_MOTIVO = 5
export const LIMITE_MOTIVO = 200

export interface ResultadoAdmin {
  sucesso: boolean
  mensagem: string
}

export function validarResposta(texto: string): string | null {
  const limpo = texto.trim()
  if (!limpo) return 'Escreva a resposta.'
  if (limpo.length > LIMITE_RESPOSTA) return `A resposta pode ter até ${LIMITE_RESPOSTA} caracteres.`
  return null
}

export function validarMotivo(motivo: string): string | null {
  const limpo = motivo.trim()
  if (limpo.length < LIMITE_MINIMO_MOTIVO) return `Escreva pelo menos ${LIMITE_MINIMO_MOTIVO} caracteres no motivo.`
  if (limpo.length > LIMITE_MOTIVO) return `O motivo pode ter até ${LIMITE_MOTIVO} caracteres.`
  return null
}

export function separarTitulos(texto: string): string[] {
  const vistos = new Set<string>()
  return texto
    .split(/[\n,;]/)
    .map((titulo) => titulo.trim())
    .filter((titulo) => {
      const chave = titulo.toLocaleLowerCase('pt-BR')
      if (!titulo || vistos.has(chave)) return false
      vistos.add(chave)
      return true
    })
}

export function filtrarUsuarios(usuarios: UsuarioAdmin[], termo: string): UsuarioAdmin[] {
  const busca = termo.trim().toLocaleLowerCase('pt-BR')
  if (!busca) return usuarios
  return usuarios.filter(
    (usuario) =>
      usuario.nome.toLocaleLowerCase('pt-BR').includes(busca) || usuario.email.toLocaleLowerCase('pt-BR').includes(busca),
  )
}

export function filtrarChamados(chamados: Chamado[], situacao: string, categoria: string, numero = ''): Chamado[] {
  const numeroBuscado = numero.trim()
  if (numeroBuscado) return chamados.filter((chamado) => String(chamado.numero) === numeroBuscado)
  return chamados.filter(
    (chamado) => (!situacao || chamado.status === situacao) && (!categoria || chamado.categoria === categoria),
  )
}

export function contarPorSituacao(chamados: Chamado[]): Record<string, number> {
  return chamados.reduce<Record<string, number>>((contagem, chamado) => {
    contagem[chamado.status] = (contagem[chamado.status] ?? 0) + 1
    return contagem
  }, {})
}

export function usuarioDoChamado(chamado: Chamado, usuarios: UsuarioAdmin[]): UsuarioAdmin | null {
  if (chamado.user_id) return usuarios.find((usuario) => usuario.id === chamado.user_id) ?? null
  const email = chamado.email_informado?.toLowerCase()
  return usuarios.find((usuario) => usuario.email.toLowerCase() === email) ?? null
}

export function podeAlterarBloqueio(usuario: UsuarioAdmin, adminId: string): boolean {
  return usuario.id !== adminId
}

export function descreverConferencia(correspondencias: number, informados: number): string {
  if (informados === 0) return 'Informe ao menos um título.'
  if (correspondencias === 0) return `Nenhum dos ${informados} títulos informados corresponde a um Foco da conta.`
  const titulos = correspondencias === 1 ? '1 título corresponde' : `${correspondencias} títulos correspondem`
  return `${titulos} a Focos da conta, de ${informados} informados.`
}

export async function carregarIndicadores(): Promise<IndicadoresAdmin> {
  return buscarIndicadoresAdmin()
}

export async function carregarUsuarios(): Promise<UsuarioAdmin[]> {
  return buscarUsuariosAdmin()
}

export async function carregarChamados(): Promise<Chamado[]> {
  return listarTodosOsChamados()
}

export async function responderChamado(chamadoId: string, texto: string): Promise<ResultadoAdmin> {
  const erro = validarResposta(texto)
  if (erro) return { sucesso: false, mensagem: erro }

  await registrarRespostaChamado(chamadoId, texto.trim())

  try {
    await enviarAvisoDeResposta(chamadoId)
    return { sucesso: true, mensagem: 'Resposta enviada. O usuário foi avisado por e-mail.' }
  } catch (falha) {
    console.error(falha)
    return { sucesso: true, mensagem: 'Resposta registrada, mas o aviso por e-mail não pôde ser enviado agora.' }
  }
}

export async function alterarSituacao(chamadoId: string, status: 'em_andamento' | 'encerrado'): Promise<ResultadoAdmin> {
  await atualizarSituacaoChamado(chamadoId, status)
  return { sucesso: true, mensagem: status === 'encerrado' ? 'Chamado encerrado.' : 'Chamado marcado como em andamento.' }
}

export async function registrarAlteracaoEmail(chamadoId: string): Promise<ResultadoAdmin> {
  await registrarAlteracaoEmailNoLog(chamadoId)
  return { sucesso: true, mensagem: 'Alteração de e-mail registrada nos logs de auditoria.' }
}

export async function conferirTitulos(email: string, texto: string): Promise<ResultadoAdmin> {
  const titulos = separarTitulos(texto)
  if (!email.trim() || titulos.length === 0) {
    return { sucesso: false, mensagem: descreverConferencia(0, titulos.length) }
  }
  const correspondencias = await conferirTitulosDaConta(email.trim(), titulos)
  return { sucesso: true, mensagem: descreverConferencia(correspondencias, titulos.length) }
}

export async function alterarBloqueio(
  usuario: UsuarioAdmin,
  adminId: string,
  bloquear: boolean,
  motivo: string,
): Promise<ResultadoAdmin> {
  if (!podeAlterarBloqueio(usuario, adminId)) {
    return { sucesso: false, mensagem: 'Você não pode bloquear a própria conta.' }
  }
  const erro = validarMotivo(motivo)
  if (erro) return { sucesso: false, mensagem: erro }

  await alterarBloqueioNoServidor(usuario.id, bloquear, motivo.trim())
  return { sucesso: true, mensagem: bloquear ? 'Conta bloqueada.' : 'Conta desbloqueada.' }
}
