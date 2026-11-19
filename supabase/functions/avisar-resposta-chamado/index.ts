import '@supabase/functions-js/edge-runtime.d.ts'
import { enderecoDoSite, enviarEmail, escaparHtml, montarHtml } from '../_shared/email.ts'
import { lerCorpo, preflight, responder, texto } from '../_shared/http.ts'
import { clienteAdministrativo, papelDoUsuario, usuarioDaRequisicao } from '../_shared/supabase.ts'

Deno.serve(async (req) => {
  const recusa = preflight(req)
  if (recusa) return recusa

  const cliente = clienteAdministrativo()
  const admin = await usuarioDaRequisicao(req, cliente)
  if (!admin) return responder({ erro: 'Sessão inválida.' }, 401)
  if ((await papelDoUsuario(cliente, admin.id)) !== 'admin') return responder({ erro: 'Acesso restrito.' }, 403)

  const chamadoId = texto((await lerCorpo(req)).chamadoId)
  if (!chamadoId) return responder({ erro: 'Chamado não informado.' }, 400)

  const { data: chamado } = await cliente
    .from('chamados')
    .select('id, numero, user_id, email_contato')
    .eq('id', chamadoId)
    .maybeSingle()
  if (!chamado) return responder({ erro: 'Chamado não encontrado.' }, 404)

  if (chamado.user_id) {
    const { data } = await cliente.auth.admin.getUserById(chamado.user_id)
    const email = data.user?.email
    if (!email) return responder({ erro: 'Usuário sem e-mail.' }, 404)

    const enviado = await enviarEmail(
      email,
      `Seu chamado nº ${chamado.numero} no F.O.C.O. foi respondido`,
      montarHtml('Há uma nova resposta para você', [
        `O suporte do F.O.C.O. respondeu ao seu chamado nº ${chamado.numero}.`,
        'Por segurança, o conteúdo da resposta não é enviado por e-mail. Entre na plataforma e abra a aba Suporte para ler.',
        `<a href="${enderecoDoSite()}">Acessar a plataforma</a>`,
        'Não consegue entrar? Na tela de login, use "Não consigo acessar minha conta" e informe um e-mail de contato. A resposta chega por lá.',
      ]),
    )
    return responder({ sucesso: enviado }, enviado ? 200 : 502)
  }

  const { data: resposta } = await cliente
    .from('respostas_chamado')
    .select('texto')
    .eq('chamado_id', chamado.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!resposta || !chamado.email_contato) return responder({ erro: 'Resposta não encontrada.' }, 404)

  const enviado = await enviarEmail(
    chamado.email_contato,
    `Resposta ao seu pedido de acesso ao F.O.C.O. (chamado nº ${chamado.numero})`,
    montarHtml('Resposta do suporte', [
      'Você abriu um pedido de ajuda porque não conseguia acessar a sua conta. Esta é a resposta do suporte:',
      escaparHtml(resposta.texto).replaceAll('\n', '<br>'),
      'O suporte nunca pede a sua senha. Se você não fez esse pedido, ignore esta mensagem.',
    ]),
  )
  return responder({ sucesso: enviado }, enviado ? 200 : 502)
})
