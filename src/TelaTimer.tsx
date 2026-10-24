import { useEffect, useState } from 'react'
import {
  estadoDaSessao,
  formatarTempo,
  progressoSessao,
  tempoRestanteMs,
  type Sessao,
} from './services/sessaoService'
import { pararAlerta, tocarAlerta } from './utils/alertaSonoro'
import PainelRetomada from './PainelRetomada'
import './styles/timer.css'
import ModalAprendizado from './ModalAprendizado'
import type { ResultadoSalvar } from './controllers/sessaoController'

interface TelaTimerProps {
  sessao: Sessao
  tituloFoco: string
  porcentagemFoco: number
  retomada: boolean
  onPausar: (instante: number) => void
  onRetomar: (instante: number) => void
  onDescartar: (textoDigitado: string) => void
  onRegistrar: (textoAprendizado: string) => Promise<ResultadoSalvar>
}

const INTERVALO_ATUALIZACAO_MS = 250

function TelaTimer({
  sessao,
  tituloFoco,
  porcentagemFoco,
  retomada,
  onPausar,
  onRetomar,
  onDescartar,
  onRegistrar,
}: TelaTimerProps) {
  const [agora, setAgora] = useState(() => Date.now())

  const [registrando, setRegistrando] = useState(false)

  useEffect(() => {
    const intervalo = setInterval(() => setAgora(Date.now()), INTERVALO_ATUALIZACAO_MS)
    return () => clearInterval(intervalo)
  }, [])

  useEffect(() => {
    if (sessao.pausadaEm !== null) return
    const restante = tempoRestanteMs(sessao, Date.now())
    if (restante === 0) return
    const alarme = setTimeout(tocarAlerta, restante)
    return () => {
      clearTimeout(alarme)
      pararAlerta()
    }
  }, [sessao])

  const estado = estadoDaSessao(sessao, agora)
  const progresso = progressoSessao(sessao, agora)
  const pausada = estado === 'pausada'
  const mostrarRetomada = retomada && pausada
  const porcentagem = Math.round(Math.min(100, porcentagemFoco))

  function alternarPausa() {
    const instante = Date.now()
    setAgora(instante)
    if (pausada) {
      onRetomar(instante)
    } else {
      onPausar(instante)
    }
  }

  return (
    <main className={`timer timer--${estado}`}>
      <header className="timer__topo">
        {estado !== 'concluida' && !mostrarRetomada && (
          <button
            type="button"
            className="timer__controle"
            onClick={alternarPausa}
            aria-label={pausada ? 'Continuar a sessão' : 'Pausar a sessão'}
          >
            {pausada ? <IconeContinuar /> : <IconePausar />}
          </button>
        )}
      </header>

      <section className="timer__centro">
        <div className="timer__circulo">
          <svg className="timer__anel" viewBox="0 0 100 100" aria-hidden="true">
            <circle className="timer__anel-fundo" cx="50" cy="50" r="48" />
            <circle
              className="timer__anel-progresso"
              cx="50"
              cy="50"
              r="48"
              pathLength="100"
              strokeDasharray="100"
              strokeDashoffset={100 * (1 - progresso)}
            />
          </svg>
          <span className="timer__tempo texto-reforcado" role="timer">
            {formatarTempo(tempoRestanteMs(sessao, agora))}
          </span>
        </div>

<p className="timer__mensagem" aria-live="polite">
  {pausada && (
    <>
      Ocorreu um imprevisto? Sem problemas.
      <br />
      O aplicativo está bloqueado até que você volte.
    </>
  )}
</p>
      </section>

      <footer className="timer__rodape">
        <span className="timer__marca">F.O.C.O.</span>

        {estado === 'concluida' ? (
          <>
            <span className="timer__foco">Timer finalizado</span>
            <button type="button" className="timer__botao" onClick={() => setRegistrando(true)}>
              Continuar
            </button>
          </>
        ) : (
          <>
            <span className="timer__foco">{tituloFoco}</span>
            <div
              className="timer__barra"
              role="progressbar"
              aria-label={`Progresso do Foco ${tituloFoco}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={porcentagem}
            >
              <div className="timer__barra-preenchida" style={{ width: `${porcentagem}%` }} />
            </div>
            <span className="timer__porcentagem">{porcentagem}%</span>
          </>
        )}
      </footer>

      {mostrarRetomada && <PainelRetomada onContinuar={alternarPausa} onDescartar={onDescartar} />}
      {estado === 'concluida' && registrando && <ModalAprendizado onSalvar={onRegistrar} />}
    </main>
  )
}

function IconePausar() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="4" width="4" height="16" rx="1.5" />
      <rect x="14" y="4" width="4" height="16" rx="1.5" />
    </svg>
  )
}

function IconeContinuar() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14z" />
    </svg>
  )
}

export default TelaTimer