import { useState } from 'react'
import { MENSAGEM_PRATICA_PENDENTE, type ResultadoPosicao } from './services/posicaoService'
import { TAMANHO_TOP } from './services/estrelaService'
import './styles/timer.css'
import './styles/posicao.css'

interface ModalMudarPosicaoProps {
  tituloFoco: string
  posicaoAtual: number | null
  posicoes: number[]
  primeiraLivre: number
  aguardandoPratica: boolean
  onMover: (novaPosicao: number) => Promise<ResultadoPosicao>
  onConcluido: () => void
  onFechar: () => void
}

function ModalMudarPosicao({
  tituloFoco,
  posicaoAtual,
  posicoes,
  primeiraLivre,
  aguardandoPratica,
  onMover,
  onConcluido,
  onFechar,
}: ModalMudarPosicaoProps) {
  const [salvando, setSalvando] = useState<number | null>(null)
  const [erro, setErro] = useState('')

  async function mover(novaPosicao: number) {
    setSalvando(novaPosicao)
    setErro('')
    const resultado = await onMover(novaPosicao)
    if (resultado.sucesso) {
      onConcluido()
      return
    }
    setErro(resultado.mensagem)
    setSalvando(null)
  }

  return (
    <div className="retomada-fundo">
      <div className="retomada posicao-modal" role="dialog" aria-modal="true" aria-labelledby="mudar-posicao-titulo">
        <div className="retomada__conteudo">
          <p id="mudar-posicao-titulo" className="retomada__titulo">
            Mudar posição
          </p>

          {aguardandoPratica ? (
            <>
              <p role="alert">{MENSAGEM_PRATICA_PENDENTE}</p>
              <button type="button" className="retomada__continuar" onClick={onFechar}>
                Entendi
              </button>
            </>
          ) : (
            <>
              <p>
                Para qual posição vai <strong>{tituloFoco}</strong>?
              </p>
              <div className="posicao-modal__opcoes" role="group" aria-label="Posições da pilha">
                {posicoes.map((posicao) => {
                  const atual = posicao === posicaoAtual
                  const daEstrela = posicao < primeiraLivre
                  const classes = [
                    'posicao-modal__opcao',
                    posicao <= TAMANHO_TOP ? 'posicao-modal__opcao--top' : '',
                    atual ? 'posicao-modal__opcao--atual' : '',
                    daEstrela ? 'posicao-modal__opcao--estrela' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')

                  return (
                    <button
                      key={posicao}
                      type="button"
                      className={classes}
                      onClick={() => mover(posicao)}
                      disabled={atual || daEstrela || salvando !== null}
                      aria-label={
                        daEstrela
                          ? `${posicao}ª posição, do Foco com a Estrela Dourada`
                          : atual
                            ? `${posicao}ª posição, atual`
                            : `Mover para a ${posicao}ª posição`
                      }
                    >
                      {salvando === posicao ? '...' : `${posicao}º`}
                      {daEstrela && <span className="posicao-modal__marca">★</span>}
                      {atual && <span className="posicao-modal__marca">atual</span>}
                    </button>
                  )
                })}
              </div>
              <p className="posicao-modal__nota">
                As posições 1 a {TAMANHO_TOP} formam o seu Top {TAMANHO_TOP}. Só elas podem receber a Estrela Dourada.
              </p>
              <p className="aprendizado__erro" role="alert">
                {erro}
              </p>
              <button type="button" className="retomada__link" onClick={onFechar} disabled={salvando !== null}>
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ModalMudarPosicao
