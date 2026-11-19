import '@supabase/functions-js/edge-runtime.d.ts'
import { lerCorpo, preflight, responder, texto } from '../_shared/http.ts'
import { clienteAdministrativo } from '../_shared/supabase.ts'

const PADRAO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const LIMITE_POR_HORA = 5

function emailValido(email: string): boolean {
  return email.length <= 254 && PADRAO_EMAIL.test(email)
}

Deno.serve(async (req) => {
  const recusa = preflight(req)
  if (recusa) return recusa

  const corpo = await lerCorpo(req)
  const emailInformado = texto(corpo.emailCadastrado).toLowerCase()
  const emailContato = texto(corpo.emailContato).toLowerCase()
  const descricao = texto(corpo.descricao)
  const nome = texto(corpo.nome)
  const dataCadastro = texto(corpo.dataCadastro)
  const ultimoAcesso = texto(corpo.ultimoAcesso)
  const titulos = texto(corpo.titulos)

  const dadosValidos =
    emailValido(emailInformado) &&
    emailValido(emailContato) &&
    descricao.length >= 10 &&
    descricao.length <= 1000 &&
    nome.length >= 1 &&
    nome.length <= 80 &&
    dataCadastro.length <= 40 &&
    ultimoAcesso.length <= 40 &&
    titulos.length >= 1 &&
    titulos.length <= 300

  if (!dadosValidos) return responder({ erro: 'Dados inválidos.' }, 400)

  const cliente = clienteAdministrativo()
  const umaHoraAtras = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  async function enviadosNaUltimaHora(coluna: 'email_informado' | 'email_contato', email: string): Promise<number | null> {
    const { count, error } = await cliente
      .from('chamados')
      .select('id', { count: 'exact', head: true })
      .is('user_id', null)
      .eq(coluna, email)
      .gte('created_at', umaHoraAtras)
    if (error) {
      console.error('Falha ao conferir o limite:', error.message)
      return null
    }
    return count ?? 0
  }

  const [pelaConta, peloContato] = await Promise.all([
    enviadosNaUltimaHora('email_informado', emailInformado),
    enviadosNaUltimaHora('email_contato', emailContato),
  ])

  if (pelaConta === null || peloContato === null) return responder({ erro: 'Não foi possível registrar agora.' }, 500)
  if (Math.max(pelaConta, peloContato) >= LIMITE_POR_HORA) return responder({ erro: 'Limite de envios atingido.' }, 429)

  const { data, error } = await cliente
    .from('chamados')
    .insert({
      user_id: null,
      categoria: 'acesso_conta',
      descricao,
      email_informado: emailInformado,
      email_contato: emailContato,
      nome_informado: nome,
      cadastro_informado: dataCadastro || null,
      ultimo_acesso_informado: ultimoAcesso || null,
      titulos_informados: titulos,
    })
    .select('numero')
    .single()

  if (error) {
    console.error('Falha ao registrar o chamado:', error.message)
    return responder({ erro: 'Dados inválidos.' }, 400)
  }

  return responder({ sucesso: true, numero: data.numero })
})
