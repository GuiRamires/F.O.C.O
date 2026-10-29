export type OpcaoJanelaFlutuante = 'disponivel' | 'sem-suporte' | 'oculta'

export const AVISO_SEM_JANELA_FLUTUANTE = 'Janela flutuante indisponível neste navegador. O timer continua aqui na aba.'

export function suportaJanelaFlutuante(ambiente: object): boolean {
  return 'documentPictureInPicture' in ambiente
}

export function opcaoJanelaFlutuante(suportada: boolean, concluida: boolean): OpcaoJanelaFlutuante {
  if (concluida) return 'oculta'
  return suportada ? 'disponivel' : 'sem-suporte'
}