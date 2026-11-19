const REMETENTE_PADRAO = 'F.O.C.O. <onboarding@resend.dev>'

export function escaparHtml(valor: string): string {
  return valor
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function montarHtml(titulo: string, paragrafos: string[]): string {
  const corpo = paragrafos.map((paragrafo) => `<p style="margin:0 0 16px">${paragrafo}</p>`).join('')
  return `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#111;max-width:560px">` +
    `<h1 style="font-size:20px;margin:0 0 16px">${titulo}</h1>${corpo}` +
    `<p style="margin:24px 0 0;color:#666;font-size:13px">F.O.C.O. — Filtrar, Organizar, Concentrar e Observar</p></div>`
}

export async function enviarEmail(para: string, assunto: string, html: string): Promise<boolean> {
  const chave = Deno.env.get('RESEND_API_KEY')
  if (!chave) {
    console.error('RESEND_API_KEY não configurada.')
    return false
  }

  const resposta = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${chave}` },
    body: JSON.stringify({
      from: Deno.env.get('EMAIL_REMETENTE') || REMETENTE_PADRAO,
      to: [para],
      subject: assunto,
      html,
    }),
  })

  if (!resposta.ok) {
    console.error('Falha no envio do e-mail:', resposta.status, await resposta.text())
  }
  return resposta.ok
}

export function enderecoDoSite(): string {
  return Deno.env.get('SITE_URL') || 'https://seufoco.vercel.app'
}
