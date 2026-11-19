import '@supabase/functions-js/edge-runtime.d.ts'
import { enderecoDoSite, enviarEmail, escaparHtml, montarHtml } from '../_shared/email.ts'
import { iguaisEmTempoConstante, responder } from '../_shared/http.ts'
import { clienteAdministrativo } from '../_shared/supabase.ts'

interface AvisoRegistrado {
  foco_id: string
  user_id: string
  titulo: string
  email: string | null
  dias_restantes: number
}

function descreverDias(dias: number): string {
  return dias === 1 ? '1 dia' : `${dias} dias`
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return responder({ erro: 'Método não permitido.' }, 405)

  const segredo = Deno.env.get('ROTINA_SEGREDO') ?? ''
  const recebido = req.headers.get('x-rotina-segredo') ?? ''
  if (!segredo || !iguaisEmTempoConstante(segredo, recebido)) return responder({ erro: 'Não autorizado.' }, 401)

  const cliente = clienteAdministrativo()
  const { data, error } = await cliente.rpc('registrar_avisos_inatividade')
  if (error) {
    console.error('Falha ao registrar os avisos:', error.message)
    return responder({ erro: 'Falha ao registrar os avisos.' }, 500)
  }

  const porUsuario = new Map<string, AvisoRegistrado[]>()
  for (const aviso of (data ?? []) as AvisoRegistrado[]) {
    if (!aviso.email) continue
    porUsuario.set(aviso.email, [...(porUsuario.get(aviso.email) ?? []), aviso])
  }

  let enviados = 0
  for (const [email, avisos] of porUsuario) {
    const itens = avisos
      .map((aviso) => `<li><strong>${escaparHtml(aviso.titulo)}</strong>: vai para o Laboratório de Sonhos em ${descreverDias(aviso.dias_restantes)}.</li>`)
      .join('')
    const ok = await enviarEmail(
      email,
      avisos.length === 1 ? 'Um Foco seu está parado' : `${avisos.length} Focos seus estão parados`,
      montarHtml(avisos.length === 1 ? 'Seu Foco sente a sua falta' : 'Seus Focos sentem a sua falta', [
        `${avisos.length === 1 ? 'Este Foco está' : 'Estes Focos estão'} sem sessões há pelo menos 14 dias:<ul style="margin:8px 0 0">${itens}</ul>`,
        avisos.length === 1
          ? 'Basta fazer uma sessão para que o prazo recomece. Se preferir, você também pode arquivá-lo agora e resgatá-lo quando quiser.'
          : 'Basta fazer uma sessão para que o prazo recomece. Se preferir, você também pode arquivá-los agora e resgatá-los quando quiser.',
        `<a href="${enderecoDoSite()}">Abrir o F.O.C.O.</a>`,
      ]),
    )
    if (ok) enviados++
  }

  return responder({ avisos: (data ?? []).length, emails: enviados, falhas: porUsuario.size - enviados })
})
