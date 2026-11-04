import { useState, type FormEvent } from 'react'
import {
  FRASE_REMOVER_ESTRELA,
  fraseRemoverEstrelaConfere,
  mascararFraseEstrela,
  type ResultadoAcaoEstrela,
} from './services/estrelaService'
import './styles/timer.css'

const COR_ESTRELA = '#ffc107'

interface ModalRemoverEstrelaProps {
  tituloFoco: string
  onRemover: (fraseDigitada: string) => Promise<ResultadoAcaoEstrela>
  onConcluido: () => void
  onFechar: () => void
}

function ModalRemoverEstrela({ tituloFoco, onRemover, onConcluido, onFechar }: ModalRemoverEstrelaProps) {
  const [etapa, setEtapa] = useState<'reflexao' | 'confirmacao'>('reflexao')
  const [frase, setFrase] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const fraseConfere = fraseRemoverEstrelaConfere(frase)

  async function remover(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!fraseConfere || salvando) return
    setSalvando(true)
    setErro('')
    const resultado = await onRemover(frase)
    if (resultado.sucesso) {
      onConcluido()
      return
    }
    setErro(resultado.mensagem)
    setSalvando(false)
  }

  return (
    <div className="retomada-fundo">
      <div className="retomada" role="dialog" aria-modal="true" aria-labelledby="remover-estrela-titulo">
        {etapa === 'reflexao' ? (
          <div className="retomada__conteudo">
            <p id="remover-estrela-titulo" className="retomada__titulo" style={{ color: COR_ESTRELA }}>
              Antes de mudar
            </p>
            <p>
              Você escolheu <strong>{tituloFoco}</strong> como a sua prioridade. Cada hora que você dedicou a ele
              continua valendo.
            </p>
            <p>Mudar de prioridade faz parte, desde que seja uma escolha consciente.</p>
            <button type="button" className="retomada__continuar" onClick={onFechar}>
              Manter a Estrela
            </button>
            <button type="button" className="retomada__link" onClick={() => setEtapa('confirmacao')}>
              Quero mudar minha prioridade
            </button>
          </div>
        ) : (
          <form className="retomada__conteudo" onSubmit={remover}>
            <p id="remover-estrela-titulo" className="retomada__titulo" style={{ color: COR_ESTRELA }}>
              Retirar a Estrela
            </p>
            <p>Para confirmar, digite a frase:</p>
            <p>
              <strong>{FRASE_REMOVER_ESTRELA}</strong>
            </p>
            <input
              className="retomada__campo"
              style={{ fontSize: '1rem' }}
              value={frase}
              onChange={(evento) => setFrase(mascararFraseEstrela(evento.target.value))}
              onPaste={(evento) => evento.preventDefault()}
              onDrop={(evento) => evento.preventDefault()}
              maxLength={FRASE_REMOVER_ESTRELA.length}
              autoFocus
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              aria-label="Frase de confirmação"
            />
            <p className="aprendizado__dica">O Foco continua na sua pilha, logo abaixo dos três primeiros.</p>
            <p className="aprendizado__erro" role="alert">
              {erro}
            </p>
            <button type="submit" className="retomada__descartar" disabled={!fraseConfere || salvando}>
              {salvando ? 'Retirando...' : 'Retirar a Estrela'}
            </button>
            <button type="button" className="retomada__link" onClick={onFechar} disabled={salvando}>
              Voltar e manter a Estrela
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ModalRemoverEstrela