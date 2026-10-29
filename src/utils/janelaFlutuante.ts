interface ApiJanelaFlutuante {
  requestWindow(opcoes?: { width?: number; height?: number }): Promise<Window>
}

const LARGURA_JANELA = 300
const ALTURA_JANELA = 340

function obterApi(): ApiJanelaFlutuante | undefined {
  return (window as Window & { documentPictureInPicture?: ApiJanelaFlutuante }).documentPictureInPicture
}

function lerRegras(folha: CSSStyleSheet): string | null {
  try {
    return Array.from(folha.cssRules, regra => regra.cssText).join('\n')
  } catch {
    return null
  }
}

function copiarEstilos(destino: Document) {
  const base = destino.createElement('base')
  base.href = document.baseURI
  destino.head.appendChild(base)

  for (const folha of Array.from(document.styleSheets)) {
    const regras = lerRegras(folha)
    if (regras !== null) {
      const estilo = destino.createElement('style')
      estilo.textContent = regras
      destino.head.appendChild(estilo)
    } else if (folha.href) {
      const link = destino.createElement('link')
      link.rel = 'stylesheet'
      link.href = folha.href
      destino.head.appendChild(link)
    }
  }

  const tema = document.documentElement.getAttribute('data-bs-theme')
  if (tema) destino.documentElement.setAttribute('data-bs-theme', tema)
}

export async function abrirJanelaFlutuante(): Promise<Window | null> {
  const api = obterApi()
  if (!api) return null
  try {
    const janela = await api.requestWindow({ width: LARGURA_JANELA, height: ALTURA_JANELA })
    janela.document.title = 'F.O.C.O.'
    copiarEstilos(janela.document)
    return janela
  } catch (erro) {
    console.warn('Não foi possível abrir a janela flutuante.', erro)
    return null
  }
}