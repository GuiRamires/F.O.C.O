import type { ReactNode } from 'react'

interface TextoTermoProps {
  texto: string
}

function separarCelulas(linha: string): string[] {
  return linha
    .split('|')
    .slice(1, -1)
    .map((celula) => celula.trim())
}

function montarBlocos(texto: string): ReactNode[] {
  const linhas = texto.split('\n').slice(1)
  const blocos: ReactNode[] = []
  let i = 0

  while (i < linhas.length) {
    const linha = linhas[i].trim()

    if (!linha) {
      i++
      continue
    }

    if (linha.startsWith('|')) {
      const tabela: string[][] = []
      while (i < linhas.length && (linhas[i].trim().startsWith('|') || (!linhas[i].trim() && linhas[i + 1]?.trim().startsWith('|')))) {
        if (linhas[i].trim()) tabela.push(separarCelulas(linhas[i].trim()))
        i++
      }
      const [cabecalho, ...corpo] = tabela
      blocos.push(
        <div key={`t${i}`} className="foco-termo__tabela">
          <table>
            <thead>
              <tr>
                {cabecalho.map((celula) => (
                  <th key={celula}>{celula}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {corpo.map((celulas) => (
                <tr key={celulas.join('|')}>
                  {celulas.map((celula, coluna) => (
                    <td key={coluna}>{celula}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
      continue
    }

    if (linha.startsWith('- ')) {
      const itens: string[] = []
      while (i < linhas.length && linhas[i].trim().startsWith('- ')) {
        itens.push(linhas[i].trim().slice(2))
        i++
      }
      blocos.push(
        <ul key={`l${i}`}>
          {itens.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>,
      )
      continue
    }

    if (/^PARTE \d/.test(linha)) {
      blocos.push(<h3 key={`p${i}`}>{linha}</h3>)
    } else if (/^\d+\.\d+ /.test(linha)) {
      blocos.push(<h4 key={`s${i}`}>{linha}</h4>)
    } else if (linha.startsWith('Versão ')) {
      blocos.push(
        <p key={`v${i}`} className="foco-termo__versao">
          {linha}
        </p>,
      )
    } else {
      blocos.push(<p key={`x${i}`}>{linha}</p>)
    }
    i++
  }

  return blocos
}

function TextoTermo({ texto }: TextoTermoProps) {
  return <>{montarBlocos(texto)}</>
}

export default TextoTermo
