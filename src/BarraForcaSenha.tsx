import { calcularForcaSenha } from './utils/validarSenha'

interface BarraForcaSenhaProps {
  senha: string
  nome: string
  email: string
}

const CONFIG_NIVEL = {
  fraca: { largura: 25, classe: 'bg-danger', label: 'Fraca' },
  media: { largura: 50, classe: 'bg-warning', label: 'Média' },
  boa: { largura: 75, classe: 'bg-primary', label: 'Boa' },
  excelente: { largura: 100, classe: 'bg-success', label: 'Excelente' },
}

function BarraForcaSenha({ senha, nome, email }: BarraForcaSenhaProps) {
  if (!senha) return null

  const nivel = calcularForcaSenha(senha, nome, email)
  const { largura, classe, label } = CONFIG_NIVEL[nivel]

  return (
    <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
      <div className="progress" style={{ height: '8px' }}>
        <div
          className={`progress-bar ${classe}`}
          role="progressbar"
          style={{ width: `${largura}%` }}
          aria-valuenow={largura}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <small className={`text-${classe.replace('bg-', '')}`}>{label}</small>
    </div>
  )
}

export default BarraForcaSenha