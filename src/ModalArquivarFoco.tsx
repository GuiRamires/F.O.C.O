import { useState } from 'react'
import type { ResultadoLaboratorio } from './services/laboratorioService'
import { descreverMinutos } from './utils/formatarHoras'
import './styles/timer.css'
import './styles/laboratorio.css'

interface ModalArquivarFocoProps {
  tituloFoco: string
  minutosAcumulados: number
  onArquivar: () => Promise<ResultadoLaboratorio>
  onConcluido: () => void
  onFechar: () => void
}

function ModalArquivarFoco({ tituloFoco, minutosAcumulados, onArquivar, onConcluido, onFechar }: ModalArquivarFocoProps) {
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  async function arquivar() {
    setSalvando(true)
    setErro('')
    const resultado = await onArquivar()
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
        className="retomada laboratorio-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="arquivar-foco-titulo"
      >
        <div className="retomada__conteudo">
          <p id="arquivar-foco-titulo" className="retomada__titulo">
            Laboratório de Sonhos
          </p>
          <p>
            <strong>{tituloFoco}</strong> sai da sua pilha e vai para o Laboratório de Sonhos.
          </p>
          <p>
            {minutosAcumulados > 0
              ? `As ${descreverMinutos(minutosAcumulados)} acumuladas e o histórico de sessões ficam guardados.`
              : 'O histórico do Foco fica guardado.'}{' '}
            Você pode resgatá-lo quando quiser.
          </p>
          <p className="aprendizado__erro" role="alert">
            {erro}
          </p>
          <button type="button" className="laboratorio-modal__botao" onClick={arquivar} disabled={salvando}>
            {salvando ? 'Arquivando...' : 'Arquivar'}
          </button>
          <button type="button" className="retomada__link" onClick={onFechar} disabled={salvando}>
            Agora não
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalArquivarFoco
