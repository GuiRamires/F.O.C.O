import { supabase } from '../supabaseClient'

export interface IndicadoresAdmin {
  totalUsuarios: number
  totalFocos: number
  usuariosAtivos30Dias: number
  sessoes30Dias: number
  chamadosAbertos: number
  chamadosEmAndamento: number
  chamadosRespondidos: number
  chamadosEncerrados: number
}

export interface UsuarioAdmin {
  id: string
  nome: string
  email: string
  papel: string
  cadastradoEm: string
  ultimoAcesso: string | null
  bloqueado: boolean
  totalFocos: number
}

interface LinhaIndicadores {
  total_usuarios: number
  total_focos: number
  usuarios_ativos_30_dias: number
  sessoes_30_dias: number
  chamados_abertos: number
  chamados_em_andamento: number
  chamados_respondidos: number
  chamados_encerrados: number
}

interface LinhaUsuario {
  id: string
  nome: string
  email: string
  papel: string
  cadastrado_em: string
  ultimo_acesso: string | null
  bloqueado: boolean
  total_focos: number
}

export async function buscarIndicadoresAdmin(): Promise<IndicadoresAdmin> {
  const { data, error } = await supabase.rpc('indicadores_admin')

  if (error) {
    throw new Error(`Erro ao buscar os indicadores: ${error.message}`)
  }

  const linha = ((data ?? []) as LinhaIndicadores[])[0]

  return {
    totalUsuarios: Number(linha?.total_usuarios ?? 0),
    totalFocos: Number(linha?.total_focos ?? 0),
    usuariosAtivos30Dias: Number(linha?.usuarios_ativos_30_dias ?? 0),
    sessoes30Dias: Number(linha?.sessoes_30_dias ?? 0),
    chamadosAbertos: Number(linha?.chamados_abertos ?? 0),
    chamadosEmAndamento: Number(linha?.chamados_em_andamento ?? 0),
    chamadosRespondidos: Number(linha?.chamados_respondidos ?? 0),
    chamadosEncerrados: Number(linha?.chamados_encerrados ?? 0),
  }
}

export async function buscarUsuariosAdmin(): Promise<UsuarioAdmin[]> {
  const { data, error } = await supabase.rpc('listar_usuarios_admin')

  if (error) {
    throw new Error(`Erro ao buscar os usuários: ${error.message}`)
  }

  return ((data ?? []) as LinhaUsuario[]).map((linha) => ({
    id: linha.id,
    nome: linha.nome,
    email: linha.email,
    papel: linha.papel,
    cadastradoEm: linha.cadastrado_em,
    ultimoAcesso: linha.ultimo_acesso,
    bloqueado: linha.bloqueado,
    totalFocos: Number(linha.total_focos),
  }))
}

export async function registrarRespostaChamado(chamadoId: string, texto: string): Promise<void> {
  const { error } = await supabase.rpc('responder_chamado', { p_chamado_id: chamadoId, p_texto: texto })

  if (error) {
    throw new Error(`Erro ao responder o chamado: ${error.message}`)
  }
}

export async function enviarAvisoDeResposta(chamadoId: string): Promise<void> {
  const { error } = await supabase.functions.invoke('avisar-resposta-chamado', { body: { chamadoId } })

  if (error) {
    throw new Error(`Erro ao enviar o aviso de resposta: ${error.message}`)
  }
}

export async function atualizarSituacaoChamado(chamadoId: string, status: string): Promise<void> {
  const { error } = await supabase.rpc('alterar_situacao_chamado', { p_chamado_id: chamadoId, p_status: status })

  if (error) {
    throw new Error(`Erro ao alterar a situação do chamado: ${error.message}`)
  }
}

export async function registrarAlteracaoEmailNoLog(chamadoId: string): Promise<void> {
  const { error } = await supabase.rpc('registrar_alteracao_email', { p_chamado_id: chamadoId })

  if (error) {
    throw new Error(`Erro ao registrar a alteração de e-mail: ${error.message}`)
  }
}

export async function conferirTitulosDaConta(email: string, titulos: string[]): Promise<number> {
  const { data, error } = await supabase.rpc('conferir_titulos', { p_email: email, p_titulos: titulos })

  if (error) {
    throw new Error(`Erro ao conferir os títulos: ${error.message}`)
  }

  return Number(data ?? 0)
}

export async function alterarBloqueioNoServidor(usuarioId: string, bloquear: boolean, motivo: string): Promise<void> {
  const { error } = await supabase.functions.invoke('bloquear-usuario', { body: { usuarioId, bloquear, motivo } })

  if (error) {
    throw new Error(`Erro ao alterar o bloqueio: ${error.message}`)
  }
}
