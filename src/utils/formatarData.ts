const FORMATO_DATA = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
const FORMATO_DATA_HORA = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatarData(iso: string | null): string {
  if (!iso) return '—'
  return FORMATO_DATA.format(new Date(iso))
}

export function formatarDataHora(iso: string | null): string {
  if (!iso) return '—'
  return FORMATO_DATA_HORA.format(new Date(iso))
}
