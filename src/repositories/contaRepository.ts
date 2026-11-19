import { createClient } from '@supabase/supabase-js'
import { supabase } from '../supabaseClient'

export interface PerfilConta {
  nome: string
  papel: string
  criadoEm: string
}

export interface ErroAutenticacao {
  codigo: string | null
  mensagem: string
  status: number | null
}

export class FalhaAutenticacao extends Error {
  readonly codigo: string | null
  readonly status: number | null

  constructor({ codigo, mensagem, status }: ErroAutenticacao) {
    super(mensagem)
    this.codigo = codigo
    this.status = status
  }
}

function falha(erro: { code?: string; message: string; status?: number }): FalhaAutenticacao {
  return new FalhaAutenticacao({ codigo: erro.code ?? null, mensagem: erro.message, status: erro.status ?? null })
}

export async function buscarPerfil(userId: string): Promise<PerfilConta> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('nome, papel, created_at')
    .eq('id', userId)
    .single()

  if (error) {
    throw new Error(`Erro ao buscar o perfil: ${error.message}`)
  }

  return { nome: data.nome, papel: data.papel, criadoEm: data.created_at }
}

export async function buscarEmailAtual(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user?.email) {
    throw new Error('Não foi possível identificar o e-mail da conta.')
  }

  return data.user.email
}

export async function atualizarNome(userId: string, nome: string): Promise<void> {
  const { error } = await supabase.from('user_profiles').update({ nome }).eq('id', userId)

  if (error) {
    throw new Error(`Erro ao atualizar o nome: ${error.message}`)
  }
}

export async function solicitarTrocaEmail(novoEmail: string): Promise<void> {
  const { error } = await supabase.auth.updateUser(
    { email: novoEmail },
    { emailRedirectTo: window.location.origin },
  )

  if (error) {
    throw falha(error)
  }
}

export async function conferirSenhaAtual(email: string, senha: string): Promise<boolean> {
  const verificador = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: 'foco-verificacao' },
  })

  const { error } = await verificador.auth.signInWithPassword({ email, password: senha })

  if (!error) {
    await verificador.auth.signOut({ scope: 'local' })
  }

  return !error
}

export async function atualizarSenha(novaSenha: string, codigo?: string): Promise<void> {
  const { error } = await supabase.auth.updateUser(codigo ? { password: novaSenha, nonce: codigo } : { password: novaSenha })

  if (error) {
    throw falha(error)
  }
}

export async function solicitarCodigoReautenticacao(): Promise<void> {
  const { error } = await supabase.auth.reauthenticate()

  if (error) {
    throw falha(error)
  }
}

export async function solicitarCodigoRecuperacao(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email)

  if (error) {
    throw falha(error)
  }
}

export async function confirmarCodigoRecuperacao(email: string, codigo: string): Promise<string> {
  const { data, error } = await supabase.auth.verifyOtp({ email, token: codigo, type: 'recovery' })

  if (error || !data.user) {
    throw falha(error ?? { message: 'Código inválido.' })
  }

  return data.user.id
}

export async function excluirContaNoServidor(confirmacao: string): Promise<void> {
  const { error } = await supabase.functions.invoke('excluir-conta', { body: { confirmacao } })

  if (error) {
    throw new Error(`Erro ao excluir a conta: ${error.message}`)
  }
}

export async function encerrarSessao(): Promise<void> {
  await supabase.auth.signOut({ scope: 'local' })
}
