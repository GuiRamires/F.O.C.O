interface CampoSenhaProps {
  id: string
  valor: string
  onAlterar: (valor: string) => void
  mostrar: boolean
  onAlternar: () => void
  autoComplete: string
  descritoPor?: string
}

function CampoSenha({ id, valor, onAlterar, mostrar, onAlternar, autoComplete, descritoPor }: CampoSenhaProps) {
  return (
    <div className="foco-senha">
      <input
        id={id}
        type={mostrar ? 'text' : 'password'}
        value={valor}
        onChange={(evento) => onAlterar(evento.target.value)}
        autoComplete={autoComplete}
        aria-describedby={descritoPor}
      />
      <button
        type="button"
        className="foco-senha__olho"
        onClick={onAlternar}
        aria-label={mostrar ? 'Ocultar senha' : 'Mostrar senha'}
        aria-pressed={mostrar}
        title={mostrar ? 'Ocultar senha' : 'Mostrar senha'}
      >
        {mostrar ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A9.8 9.8 0 0112 5c5 0 9 4.5 10 7-.4 1-1.3 2.4-2.6 3.7M6.2 6.2C4 7.6 2.6 9.7 2 12c1 2.5 5 7 10 7 1.7 0 3.3-.5 4.6-1.2" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2 12c1-2.5 5-7 10-7s9 4.5 10 7c-1 2.5-5 7-10 7S3 14.5 2 12z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  )
}

export default CampoSenha
