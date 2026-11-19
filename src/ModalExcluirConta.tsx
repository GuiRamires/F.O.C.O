import { useState, type FormEvent } from 'react'
import ExportarDados from './ExportarDados'
import { handleExcluirConta } from './controllers/contaController'
import {
  mascararPalavraExcluirConta,
  PALAVRA_EXCLUIR_CONTA,
  palavraExcluirContaConfere,
} from './services/contaService'
import './styles/timer.css'
import './styles/laboratorio.css'

interface ModalExcluirContaProps {
  userId: string
  onExcluida: () => void
  onFechar: () => void
}

function ModalExcluirConta({ userId, onExcluida, onFechar }: ModalExcluirContaProps) {
  const [etapa, setEtapa] = useState<'consequencias' | 'confirmacao'>('consequencias')
  const [palavra, setPalavra] = useState('')
  const [excluindo, setExcluindo] = useState(false)
  const [erro, setErro] = useState('')

  const palavraConfere = palavraExcluirContaConfere(palavra)

  async function excluir(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!palavraConfere || excluindo) return
    setExcluindo(true)
    setErro('')
    const resultado = await handleExcluirConta(palavra)
    if (resultado.sucesso) {
      onExcluida()
      return
    }
    setErro(resultado.mensagem)
    setExcluindo(false)
  }

  return (
    <div className="retomada-fundo">
      <div
        className={`retomada laboratorio-modal${etapa === 'confirmacao' ? ' laboratorio-modal--exclusao' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="excluir-conta-titulo"
      >
        {etapa === 'consequencias' ? (
          <div className="retomada__conteudo">
            <p id="excluir-conta-titulo" className="retomada__titulo">
              Excluir a sua conta
            </p>
            <p>
              A exclusão apaga para sempre o seu perfil, todos os seus Focos, as sessões de foco, os registros de
              aprendizado, os chamados de suporte e os registros de atividade da conta. Não dá para desfazer.
            </p>
            <p>Antes, se quiser, baixe uma cópia dos seus dados:</p>
            <ExportarDados userId={userId} />
            <button type="button" className="retomada__continuar" onClick={onFechar}>
              Manter minha conta
            </button>
            <button type="button" className="retomada__link" onClick={() => setEtapa('confirmacao')}>
              Continuar com a exclusão
            </button>
          </div>
        ) : (
          <form className="retomada__conteudo" onSubmit={excluir}>
            <p id="excluir-conta-titulo" className="retomada__titulo">
              Confirmar exclusão
            </p>
            <p>Para confirmar, digite a palavra:</p>
            <p className="laboratorio-modal__palavra">{PALAVRA_EXCLUIR_CONTA}</p>
            <input
              className="retomada__campo"
              value={palavra}
              onChange={(evento) => setPalavra(mascararPalavraExcluirConta(evento.target.value))}
              onPaste={(evento) => evento.preventDefault()}
              onDrop={(evento) => evento.preventDefault()}
              maxLength={PALAVRA_EXCLUIR_CONTA.length}
              autoFocus
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              aria-label="Palavra de confirmação"
            />
            <p className="aprendizado__erro" role="alert">
              {erro}
            </p>
            <button type="submit" className="retomada__descartar" disabled={!palavraConfere || excluindo}>
              {excluindo ? 'Excluindo...' : 'Excluir minha conta'}
            </button>
            <button type="button" className="retomada__link" onClick={onFechar} disabled={excluindo}>
              Cancelar
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ModalExcluirConta
