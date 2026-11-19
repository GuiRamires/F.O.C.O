interface BotaoSuporteProps {
  onAbrir: () => void
}

function BotaoSuporte({ onAbrir }: BotaoSuporteProps) {
  return (
    <button type="button" className="botao-suporte" onClick={onAbrir} aria-label="Abrir o suporte" title="Suporte">
      ?
    </button>
  )
}

export default BotaoSuporte
