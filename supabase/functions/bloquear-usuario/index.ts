import '@supabase/functions-js/edge-runtime.d.ts'
import { lerCorpo, preflight, responder, texto } from '../_shared/http.ts'
import { clienteAdministrativo, papelDoUsuario, registrarLog, usuarioDaRequisicao } from '../_shared/supabase.ts'

Deno.serve(async (req) => {
  const recusa = preflight(req)
  if (recusa) return recusa

  const cliente = clienteAdministrativo()
  const admin = await usuarioDaRequisicao(req, cliente)
  if (!admin) return responder({ erro: 'Sessão inválida.' }, 401)
  if ((await papelDoUsuario(cliente, admin.id)) !== 'admin') return responder({ erro: 'Acesso restrito.' }, 403)

  const corpo = await lerCorpo(req)
  const usuarioId = texto(corpo.usuarioId)
  const motivo = texto(corpo.motivo)
  const bloquear = corpo.bloquear === true

  if (!usuarioId || motivo.length < 5 || motivo.length > 200) return responder({ erro: 'Dados inválidos.' }, 400)
  if (usuarioId === admin.id) return responder({ erro: 'O Administrador não bloqueia a própria conta.' }, 400)

  const { error } = await cliente.auth.admin.updateUserById(usuarioId, {
    ban_duration: bloquear ? '876000h' : 'none',
  })
  if (error) {
    console.error('Falha ao alterar o bloqueio:', error.message)
    return responder({ erro: 'Não foi possível alterar o bloqueio.' }, 500)
  }

  await registrarLog(cliente, admin.id, bloquear ? 'bloquear_usuario' : 'desbloquear_usuario', {
    usuario_id: usuarioId,
    motivo,
  })

  return responder({ sucesso: true })
})
