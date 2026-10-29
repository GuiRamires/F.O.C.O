import { describe, expect, it } from 'vitest'
import { opcaoJanelaFlutuante, suportaJanelaFlutuante } from './janelaFlutuanteService'

describe('janela flutuante', () => {
  it('reconhece o navegador que tem a Document Picture-in-Picture API', () => {
    expect(suportaJanelaFlutuante({ documentPictureInPicture: {} })).toBe(true)
  })

  it('reconhece o navegador sem a API, como Firefox e Safari', () => {
    expect(suportaJanelaFlutuante({})).toBe(false)
  })

  it('com suporte e sessão em andamento, oferece a janela flutuante', () => {
    expect(opcaoJanelaFlutuante(true, false)).toBe('disponivel')
  })

  it('sem suporte, troca a opção pelo aviso e mantém o timer na aba (CA21.3)', () => {
    expect(opcaoJanelaFlutuante(false, false)).toBe('sem-suporte')
  })

  it('com a sessão concluída, esconde a opção em qualquer navegador', () => {
    expect(opcaoJanelaFlutuante(true, true)).toBe('oculta')
    expect(opcaoJanelaFlutuante(false, true)).toBe('oculta')
  })
})