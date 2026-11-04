export function normalizarConfirmacao(texto: string): string {
  return texto.trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR')
}

export function confirmacaoConfere(digitado: string, esperado: string): boolean {
  return normalizarConfirmacao(digitado) === normalizarConfirmacao(esperado)
}

export function mascararFrase(texto: string, limite: number): string {
  return texto
    .toLocaleUpperCase('pt-BR')
    .replace(/[^\p{L} ]/gu, '')
    .replace(/^ +/, '')
    .replace(/ {2,}/g, ' ')
    .slice(0, limite)
}