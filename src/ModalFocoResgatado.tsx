import type { ResultadoResgate } from './services/laboratorioService'
import { descreverMinutos } from './utils/formatarHoras'
import './styles/timer.css'
import './styles/laboratorio.css'

interface ModalFocoResgatadoProps {
  tituloFoco: string
  minutosAcumulados: number
  resultado: ResultadoResgate
  onConcentrar: () => void
  onFechar: () => void
}

function ModalFocoResgatado({ tituloFoco, minutosAcumulados, resultado, onConcentrar, onFechar }: ModalFocoResgatadoProps) {
  return (
    <div className="retomada-fundo">
      <div
        className="retomada laboratorio-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="foco-resgatado-titulo"
      >
        <div className="retomada__conteudo">
          <p id="foco-resgatado-titulo" className="retomada__titulo">
            {resultado.sucesso ? 'De volta à pilha' : 'Laboratório de Sonhos'}
          </p>

          {resultado.sucesso ? (
            <>
              <p>
                <strong>{tituloFoco}</strong> voltou para a sua pilha, na <strong>{resultado.posicao}ª posição</strong>
                {minutosAcumulados > 0 ? `, com as ${descreverMinutos(minutosAcumulados)} que você já tinha` : ''}.
              </p>
              <p className="laboratorio-modal__nota">
                Para liberar a Estrela Dourada e a troca de posição, conclua uma sessão com ele.
              </p>
              <button type="button" className="retomada__continuar" onClick={onConcentrar}>
                Concentrar agora
              </button>
              <button type="button" className="retomada__link" onClick={onFechar}>
                Depois
              </button>
            </>
          ) : (
            <>
              <p role="alert">{resultado.mensagem}</p>
              <button type="button" className="retomada__continuar" onClick={onFechar}>
                Entendi
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ModalFocoResgatado
