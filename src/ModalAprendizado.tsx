import { useState } from 'react'
import type { FormEvent } from 'react'
import { LIMITE_APRENDIZADO } from './services/sessaoService'
import type { ResultadoSalvar } from './controllers/sessaoController'

interface ModalAprendizadoProps {
  onSalvar: (texto: string) => Promise<ResultadoSalvar>
}

function ModalAprendizado({ onSalvar }: ModalAprendizadoProps) {
  const [texto, setTexto] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (salvando) return
    setSalvando(true)
    setErro('')

    const resultado = await onSalvar(texto)
    if (!resultado.sucesso) {
      setErro(resultado.mensagem)
      setSalvando(false)
    }
  }

  return (
    <div className="retomada-fundo">
      <form
        className="retomada"
        role="dialog"
        aria-modal="true"
        aria-labelledby="aprendizado-titulo"
        onSubmit={salvar}
      >
        <div className="retomada__conteudo">
          <p id="aprendizado-titulo" className="aprendizado__titulo">
            O que você aprendeu?
          </p>
          <p className="aprendizado__dica">Opcional. Um resumo curto ajuda a fixar o conteúdo.</p>
          <textarea
            className="aprendizado__campo"
            value={texto}
            onChange={(evento) => setTexto(evento.target.value)}
            maxLength={LIMITE_APRENDIZADO}
            rows={5}
            aria-label="O que você aprendeu nesta sessão"
            aria-describedby="aprendizado-contador"
            autoFocus
          />
          <p id="aprendizado-contador" className="aprendizado__contador">
            {texto.length}/{LIMITE_APRENDIZADO}
          </p>
          <p className="aprendizado__erro" role="alert">
            {erro}
          </p>
          <button type="submit" className="retomada__continuar" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ModalAprendizado