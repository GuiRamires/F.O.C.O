export const LIMITE_TITULO = 40
export const LIMITE_OBSERVACOES = 200

const LETRAS = 'A-Za-záàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ'
const PERMITIDOS_NO_TITULO = `${LETRAS}0-9 -`
const PERMITIDOS_NAS_OBSERVACOES = `${LETRAS}0-9 \\n.,!?():;-`

const FORA_DO_TITULO = new RegExp(`[^${PERMITIDOS_NO_TITULO}]`, 'g')
const FORA_DAS_OBSERVACOES = new RegExp(`[^${PERMITIDOS_NAS_OBSERVACOES}]`, 'g')

export function mascararTitulo(texto: string): string {
  return texto.replace(FORA_DO_TITULO, '').replace(/ {2,}/g, ' ').slice(0, LIMITE_TITULO)
}

export function mascararObservacoes(texto: string): string {
  return texto.replace(FORA_DAS_OBSERVACOES, '').slice(0, LIMITE_OBSERVACOES)
}

export function validarTitulo(titulo: string): string | null {
  const limpo = titulo.trim()

  if (!limpo) return 'O nome do F.O.C.O é obrigatório.'
  if (limpo.length > LIMITE_TITULO) return `O nome pode ter até ${LIMITE_TITULO} caracteres.`
  if (mascararTitulo(limpo) !== limpo) return 'Use só letras, números, espaços e hífen no nome.'

  return null
}

export function validarObservacoes(observacoes: string): string | null {
  const limpo = observacoes.trim()

  if (limpo.length > LIMITE_OBSERVACOES) return `As observações podem ter até ${LIMITE_OBSERVACOES} caracteres.`
  if (mascararObservacoes(limpo) !== limpo) {
    return 'Nas observações, use só letras, números, espaços e a pontuação . , ! ? ( ) : ; -'
  }

  return null
}

export function validarTextosDoFoco(titulo: string, observacoes: string): string | null {
  return validarTitulo(titulo) ?? validarObservacoes(observacoes)
}
