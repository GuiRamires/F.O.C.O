import { supabase } from '../supabaseClient'

export interface RespostaChamado {
  texto: string
  created_at: string
}

export interface Chamado {
  id: string
  numero: number
  user_id: string | null
  categoria: string
  descricao: string
  status: string
  email_informado: string | null
  email_contato: string | null
  nome_informado: string | null
  cadastro_informado: string | null
  ultimo_acesso_informado: string | null
  titulos_informados: string | null
  created_at: string
  atualizado_em: string
  respostas_chamado: RespostaChamado[]
}

export interface DadosChamadoSemLogin {
  emailCadastrado: string
  emailContato: string
  nome: string
  dataCadastro: string
  ultimoAcesso: string
  titulos: string
  descricao: string
}

const CAMPOS_CHAMADO =
  'id, numero, user_id, categoria, descricao, status, email_informado, email_contato, nome_informado, cadastro_informado, ultimo_acesso_informado, titulos_informados, created_at, atualizado_em, respostas_chamado(texto, created_at)'

function ordenarRespostas(chamado: Chamado): Chamado {
  const respostas = [...(chamado.respostas_chamado ?? [])].sort((a, b) => a.created_at.localeCompare(b.created_at))
  return { ...chamado, respostas_chamado: respostas }
}

export async function listarChamadosDoUsuario(userId: string): Promise<Chamado[]> {
  const { data, error } = await supabase
    .from('chamados')
    .select(CAMPOS_CHAMADO)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Erro ao buscar os chamados: ${error.message}`)
  }

  return (data as Chamado[]).map(ordenarRespostas)
}

export async function listarTodosOsChamados(): Promise<Chamado[]> {
  const { data, error } = await supabase
    .from('chamados')
    .select(CAMPOS_CHAMADO)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Erro ao buscar os chamados: ${error.message}`)
  }

  return (data as Chamado[]).map(ordenarRespostas)
}

export async function inserirChamado(categoria: string, descricao: string): Promise<{ id: string; numero: number }> {
  const { data, error } = await supabase
    .from('chamados')
    .insert({ categoria, descricao })
    .select('id, numero')
    .single()

  if (error) {
    throw new Error(`Erro ao abrir o chamado: ${error.message}`)
  }

  return { id: data.id, numero: data.numero }
}

export type EnvioSemLogin = { situacao: 'enviado'; numero: number | null } | { situacao: 'limite' }

export async function enviarChamadoSemLogin(dados: DadosChamadoSemLogin): Promise<EnvioSemLogin> {
  const { data, error } = await supabase.functions.invoke('abrir-chamado-sem-login', { body: dados })

  if (!error) return { situacao: 'enviado', numero: typeof data?.numero === 'number' ? data.numero : null }

  const status = (error as { context?: { status?: number } }).context?.status
  if (status === 429) return { situacao: 'limite' }

  throw new Error(`Erro ao enviar o chamado: ${error.message}`)
}
