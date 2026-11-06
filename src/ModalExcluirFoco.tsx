import { useState, type FormEvent } from 'react'
import {
  PALAVRA_EXCLUIR_FOCO,
  mascararPalavraExcluir,
  palavraExcluirConfere,
  type ResultadoLaboratorio,
} from './services/laboratorioService'
import { descreverMinutos } from './utils/formatarHoras'
import './styles/timer.css'
import './styles/laboratorio.css'

interface ModalExcluirFocoProps {
  tituloFoco: string
  minutosAcumulados: number
  onExcluir: (palavraDigitada: string) => Promise<ResultadoLaboratorio>
  onConcluido: () => void
  onFechar: () => void
}

function ModalExcluirFoco({ tituloFoco, minutosAcumulados, onExcluir, onConcluido, onFechar }: ModalExcluirFocoProps) {
  const [etapa, setEtapa] = useState<'reflexao' | 'confirmacao'>('reflexao')
  const [palavra, setPalavra] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const palavraConfere = palavraExcluirConfere(palavra)

  async function excluir(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!palavraConfere || salvando) return
    setSalvando(true)
    setErro('')
    const resultado = await onExcluir(palavra)
    if (resultado.sucesso) {
      onConcluido()
      return
    }
    setErro(resultado.mensagem)
    setSalvando(false)
  }

  return (
    <div className="retomada-fundo">
      <div
        className={`retomada laboratorio-modal${etapa === 'confirmacao' ? ' laboratorio-modal--exclusao' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="excluir-foco-titulo"
      >
        {etapa === 'reflexao' ? (
          <div className="retomada__conteudo">
            <p id="excluir-foco-titulo" className="retomada__titulo">
              Antes de desistir
            </p>
            <p>
              {minutosAcumulados > 0 ? (
                <>
                  Você já dedicou <strong>{descreverMinutos(minutosAcumulados)}</strong> a <strong>{tituloFoco}</strong>.
                </>
              ) : (
                <>
                  <strong>{tituloFoco}</strong> está guardado aqui.
                </>
              )}
            </p>
            <p>
              No Laboratório de Sonhos ele não ocupa espaço na sua pilha. Um sonho pausado ainda pode voltar quando
              fizer sentido.
            </p>
            <button type="button" className="retomada__continuar" onClick={onFechar}>
              Manter no Laboratório
            </button>
            <button type="button" className="retomada__link" onClick={() => setEtapa('confirmacao')}>
              Quero excluir mesmo assim
            </button>
          </div>
        ) : (
          <form className="retomada__conteudo" onSubmit={excluir}>
            <p id="excluir-foco-titulo" className="retomada__titulo">
              Excluir para sempre
            </p>
            <p>
              Isso apaga <strong>{tituloFoco}</strong> e todo o histórico de sessões dele. Não dá para desfazer.
            </p>
            <p>Para confirmar, digite a palavra:</p>
            <p className="laboratorio-modal__palavra">{PALAVRA_EXCLUIR_FOCO}</p>
            <input
              className="retomada__campo"
              value={palavra}
              onChange={(evento) => setPalavra(mascararPalavraExcluir(evento.target.value))}
              onPaste={(evento) => evento.preventDefault()}
              onDrop={(evento) => evento.preventDefault()}
              maxLength={PALAVRA_EXCLUIR_FOCO.length}
              autoFocus
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              aria-label="Palavra de confirmação"
            />
            <p className="aprendizado__erro" role="alert">
              {erro}
            </p>
            <button type="submit" className="retomada__descartar" disabled={!palavraConfere || salvando}>
              {salvando ? 'Excluindo...' : 'Excluir definitivamente'}
            </button>
            <button type="button" className="retomada__link" onClick={onFechar} disabled={salvando}>
              Voltar e manter no Laboratório
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ModalExcluirFoco
