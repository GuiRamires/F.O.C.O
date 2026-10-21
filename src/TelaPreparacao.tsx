import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  ATALHOS_DURACAO_MINUTOS,
  descreverDuracao,
  formatarHorasMinutos,
  mascararHorasMinutos,
  validarTextoDuracao,
} from './services/sessaoService'
import './styles/preparacao.css'

interface TelaPreparacaoProps {
  tituloFoco: string
  onIniciar: (minutos: number) => void
  onVoltar: () => void
}

const DURACAO_INICIAL_MINUTOS = 25

function TelaPreparacao({ tituloFoco, onIniciar, onVoltar }: TelaPreparacaoProps) {
  const [textoDuracao, setTextoDuracao] = useState(formatarHorasMinutos(DURACAO_INICIAL_MINUTOS))
  const [mostrarErro, setMostrarErro] = useState(false)
  const [confirmando, setConfirmando] = useState(false)

  const resultado = validarTextoDuracao(textoDuracao)
  const minutosValidos = resultado.valida ? resultado.minutos : null
  const mensagemErro = mostrarErro && !resultado.valida ? resultado.mensagem : ''
  const confirmacaoAberta = confirmando && minutosValidos !== null

  function escolherAtalho(minutos: number) {
    setTextoDuracao(formatarHorasMinutos(minutos))
    setMostrarErro(false)
  }

  function pedirConfirmacao(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (minutosValidos === null) {
      setMostrarErro(true)
      return
    }
    setConfirmando(true)
  }

  function confirmarInicio() {
    if (minutosValidos !== null) onIniciar(minutosValidos)
  }

  return (
    <main className="preparacao">
      <header className="preparacao__topo">
        <button type="button" className="preparacao__voltar" onClick={onVoltar}>
          ← Voltar
        </button>
        <span className="preparacao__marca">F.O.C.O.</span>
        <h1 className="preparacao__foco">{tituloFoco}</h1>
      </header>

      <form className="preparacao__centro" onSubmit={pedirConfirmacao}>
        <div className="preparacao__circulo">
          {confirmacaoAberta ? (
            <p className="preparacao__rotulo preparacao__rotulo--confirmacao">
              Você vai se concentrar em <strong>{tituloFoco}</strong>
            </p>
          ) : (
            <label className="preparacao__rotulo" htmlFor="duracao">
              Ou digite o tempo (HH:MM)
            </label>
          )}

          <div className={`preparacao__tempo texto-reforcado ${mensagemErro ? 'preparacao__tempo--erro' : ''}`}>
            <span aria-hidden="true">
              <span className="preparacao__editavel">{textoDuracao}</span>:00
            </span>
            <input
              id="duracao"
              className="preparacao__campo"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={textoDuracao}
              readOnly={confirmando}
              onChange={(evento) => setTextoDuracao(mascararHorasMinutos(evento.target.value))}
              onFocus={(evento) => evento.currentTarget.select()}
              onClick={(evento) => evento.currentTarget.select()}
              onBlur={() => setMostrarErro(true)}
              aria-invalid={mensagemErro !== ''}
              aria-describedby="duracao-erro"
            />
          </div>

         <p id="duracao-erro" className="preparacao__erro" role="alert">
              {mensagemErro}
          </p>
        </div>

        {confirmacaoAberta ? (
          <div className="preparacao__acoes">
            <p className="preparacao__bloqueio">O F.O.C.O. ficará bloqueado até o fim da sessão.</p>
            <button type="button" className="preparacao__botao" onClick={confirmarInicio}>
              Sim, começar
            </button>
            <button type="button" className="preparacao__secundario" onClick={() => setConfirmando(false)}>
              Ajustar o tempo
            </button>
          </div>
        ) : (
          <div className="preparacao__acoes">
            <p className="preparacao__pergunta">Quanto tempo você vai se concentrar?</p>
            <div className="preparacao__atalhos">
              {ATALHOS_DURACAO_MINUTOS.map((minutos) => (
                <button
                  key={minutos}
                  type="button"
                  className={`preparacao__atalho ${minutosValidos === minutos ? 'preparacao__atalho--ativo' : ''}`}
                  aria-pressed={minutosValidos === minutos}
                  onClick={() => escolherAtalho(minutos)}
                >
                  {descreverDuracao(minutos)}
                </button>
              ))}
            </div>
            <button type="submit" className="preparacao__botao">
              Iniciar
            </button>
          </div>
        )}
      </form>
    </main>
  )
}

export default TelaPreparacao