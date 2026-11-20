import { useState, useEffect } from 'react'
import JanelaModal from './components/JanelaModal'
import TextoTermo from './components/TextoTermo'
import { TEXTO_TERMOS } from './conteudo/termo'

interface TermosModalProps {
  aberto: boolean
  onAceitar: () => void
  onFechar: () => void
  somenteLeitura?: boolean
  aviso?: string
  rotuloFechar?: string
  erro?: string
  aceitando?: boolean
}

function TermosModal({
  aberto,
  onAceitar,
  onFechar,
  somenteLeitura = false,
  aviso,
  rotuloFechar = 'Fechar',
  erro,
  aceitando = false,
}: TermosModalProps) {
  const [scrollCompleto, setScrollCompleto] = useState(false)

  useEffect(() => {
    if (aberto) {
      setScrollCompleto(false)
    }
  }, [aberto])

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const chegouAoFim = scrollHeight - scrollTop - clientHeight < 10
    if (chegouAoFim) {
      setScrollCompleto(true)
    }
  }

  return (
    <JanelaModal
      aberto={aberto}
      titulo="Termo de Uso e Política de Privacidade"
      onFechar={aviso || aceitando ? undefined : onFechar}
      largura="larga"
    >
      <div className="foco-termo-modal">
        <h2 className="foco-termo-modal__titulo">Termo de Uso e Política de Privacidade</h2>
        {aviso && (
          <p className="foco-termo-modal__aviso" role="status">
            {aviso}
          </p>
        )}

        <div className="foco-termo foco-termo-modal__texto" onScroll={handleScroll} tabIndex={0}>
          <TextoTermo texto={TEXTO_TERMOS} />
        </div>

        {erro && (
          <p className="foco-erro" role="alert">
            {erro}
          </p>
        )}

        <div className="foco-termo-modal__acoes">
          {somenteLeitura ? (
            <>
              <small />
              <button type="button" className="btn btn-outline-light" onClick={onFechar}>
                Fechar
              </button>
            </>
          ) : (
            <>
              <small>{scrollCompleto ? 'Leitura concluída.' : 'Role até o final do texto para habilitar o botão de aceite.'}</small>
              <div className="foco-termo-modal__botoes">
                <button type="button" className="btn btn-outline-light" onClick={onFechar} disabled={aceitando}>
                  {rotuloFechar}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onAceitar}
                  disabled={!scrollCompleto || aceitando}
                >
                  {aceitando ? 'Registrando...' : 'Aceitar'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </JanelaModal>
  )
}

export default TermosModal
