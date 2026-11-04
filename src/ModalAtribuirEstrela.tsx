import { useState } from 'react'
import type { AvaliacaoEstrela, ResultadoAcaoEstrela } from './services/estrelaService'
import './styles/timer.css'

const COR_ESTRELA = '#ffc107'

interface ModalAtribuirEstrelaProps {
  tituloFoco: string
  avaliacao: AvaliacaoEstrela
  onConfirmar: () => Promise<ResultadoAcaoEstrela>
  onConcluido: () => void
  onFechar: () => void
}

function ModalAtribuirEstrela({
  tituloFoco,
  avaliacao,
  onConfirmar,
  onConcluido,
  onFechar,
}: ModalAtribuirEstrelaProps) {
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(avaliacao.permitido ? '' : avaliacao.mensagem)

  async function confirmar() {
    setSalvando(true)
    const resultado = await onConfirmar()
    if (resultado.sucesso) {
      onConcluido()
      return
    }
    setErro(resultado.mensagem)
    setSalvando(false)
  }

  return (
    <div className="retomada-fundo">
      <div className="retomada" role="dialog" aria-modal="true" aria-labelledby="atribuir-estrela-titulo">
        <div className="retomada__conteudo">
          <p id="atribuir-estrela-titulo" className="retomada__titulo" style={{ color: COR_ESTRELA }}>
            Estrela Dourada
          </p>

          {erro ? (
            <>
              <p>
                Ainda não é possível dar a Estrela a <strong>{tituloFoco}</strong>.
              </p>
              <p role="alert">{erro}</p>
              <button type="button" className="retomada__continuar" onClick={onFechar}>
                Entendi
              </button>
            </>
          ) : (
            <>
              <p>
                <strong>{tituloFoco}</strong> vai se tornar a sua prioridade e subir para o 1º lugar da pilha.
              </p>
              <button type="button" className="retomada__continuar" onClick={confirmar} disabled={salvando}>
                {salvando ? 'Salvando...' : 'Dar a Estrela'}
              </button>
              <button type="button" className="retomada__link" onClick={onFechar} disabled={salvando}>
                Agora não
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ModalAtribuirEstrela