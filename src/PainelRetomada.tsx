import { useState } from 'react'
import { confirmacaoConfere } from './services/confirmacaoReflexiva'
import { PALAVRA_DESCARTAR } from './services/sessaoService'

interface PainelRetomadaProps {
  onContinuar: () => void
  onDescartar: (textoDigitado: string) => void
}

function somenteLetras(texto: string): string {
  return texto.replace(/[^\p{L}]/gu, '')
}

function PainelRetomada({ onContinuar, onDescartar }: PainelRetomadaProps) {
  const [descartando, setDescartando] = useState(false)
  const [texto, setTexto] = useState('')
  const podeDescartar = confirmacaoConfere(texto, PALAVRA_DESCARTAR)

  return (
    <div className="retomada-fundo">
      <div className="retomada" role="dialog" aria-modal="true" aria-labelledby="retomada-titulo">
        {descartando ? (
          <form
            className="retomada__conteudo"
            onSubmit={(evento) => {
              evento.preventDefault()
              if (podeDescartar) onDescartar(texto)
            }}
          >
            <p id="retomada-titulo" className="retomada__titulo">
              Você já começou. Que tal terminar?
            </p>
            <p>
              Se descartar, o tempo desta sessão não será somado ao seu Foco. Para confirmar, digite{' '}
              <strong>{PALAVRA_DESCARTAR}</strong>.
            </p>
            <input
                className="retomada__campo"
                value={texto}
                onChange={(evento) => setTexto(somenteLetras(evento.target.value))}
                maxLength={PALAVRA_DESCARTAR.length}
                autoCapitalize="characters"
                spellCheck={false}
                aria-label={`Digite ${PALAVRA_DESCARTAR} para confirmar`}
                autoComplete="off"
                autoFocus
            />
            <button type="submit" className="retomada__descartar" disabled={!podeDescartar}>
              Descartar sessão
            </button>
            <button
              type="button"
              className="retomada__link"
              onClick={() => {
                setDescartando(false)
                setTexto('')
              }}
            >
              Voltar e continuar estudando
            </button>
          </form>
        ) : (
          <div className="retomada__conteudo">
            <p id="retomada-titulo" className="retomada__titulo">
              Você saiu no meio da sessão
            </p>
            <p>O tempo em que o F.O.C.O. ficou fechado não foi contado.</p>
            <button type="button" className="retomada__continuar" onClick={onContinuar}>
              Continuar
            </button>
            <button type="button" className="retomada__link" onClick={() => setDescartando(true)}>
              Descartar sessão
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PainelRetomada