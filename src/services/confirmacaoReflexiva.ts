export function normalizarConfirmacao(texto: string): string {
  return texto.trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR')
}

export function confirmacaoConfere(digitado: string, esperado: string): boolean {
  return normalizarConfirmacao(digitado) === normalizarConfirmacao(esperado)
}