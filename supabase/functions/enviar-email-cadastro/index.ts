import '@supabase/functions-js/edge-runtime.d.ts'
import { enderecoDoSite, enviarEmail, escaparHtml, montarHtml } from '../_shared/email.ts'
import { preflight, responder } from '../_shared/http.ts'
import { clienteAdministrativo, usuarioDaRequisicao } from '../_shared/supabase.ts'

Deno.serve(async (req) => {
  const recusa = preflight(req)
  if (recusa) return recusa

  const cliente = clienteAdministrativo()
  const usuario = await usuarioDaRequisicao(req, cliente)
  if (!usuario?.email) return responder({ erro: 'Sessão inválida.' }, 401)

  const criadoHa = Date.now() - new Date(usuario.created_at).getTime()
  if (criadoHa > 10 * 60 * 1000) return responder({ sucesso: false })

  const nome = escaparHtml(String(usuario.user_metadata?.nome ?? '').trim() || 'estudante')
  const enviado = await enviarEmail(
    usuario.email,
    'Bem-vindo ao F.O.C.O.!',
    montarHtml(`Olá, ${nome}!`, [
      'Seu cadastro no F.O.C.O. foi realizado com sucesso.',
      'Crie o seu primeiro Foco, defina a meta de horas e comece a sua primeira sessão de estudo.',
      `<a href="${enderecoDoSite()}">Acessar a plataforma</a>`,
    ]),
  )

  return responder({ sucesso: enviado })
})
