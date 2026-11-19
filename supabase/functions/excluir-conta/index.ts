import '@supabase/functions-js/edge-runtime.d.ts'
import { lerCorpo, preflight, responder, texto } from '../_shared/http.ts'
import { clienteAdministrativo, papelDoUsuario, usuarioDaRequisicao } from '../_shared/supabase.ts'

Deno.serve(async (req) => {
  const recusa = preflight(req)
  if (recusa) return recusa

  const cliente = clienteAdministrativo()
  const usuario = await usuarioDaRequisicao(req, cliente)
  if (!usuario) return responder({ erro: 'Sessão inválida.' }, 401)

  const corpo = await lerCorpo(req)
  if (texto(corpo.confirmacao) !== 'EXCLUIR') return responder({ erro: 'Confirmação inválida.' }, 400)

  if ((await papelDoUsuario(cliente, usuario.id)) === 'admin') {
    return responder({ erro: 'A conta do Administrador não pode ser excluída por aqui.' }, 403)
  }

  const { error } = await cliente.auth.admin.deleteUser(usuario.id)
  if (error) {
    console.error('Falha ao excluir a conta:', error.message)
    return responder({ erro: 'Não foi possível excluir a conta.' }, 500)
  }

  return responder({ sucesso: true })
})
