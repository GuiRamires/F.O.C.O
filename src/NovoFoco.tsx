import { useState } from 'react'
import { handleCriarFoco } from './controllers/focoController'

interface NovoFocoProps {
  userId: string
  onFocoCriado: () => void
  onCancelar: () => void
}

const OPCOES_META = [
  { label: '1 semana (7 dias)', horas: 168 },
  { label: '2 semanas (14 dias)', horas: 336 },
  { label: '1 mês (30 dias)', horas: 720 },
  { label: '3 meses (90 dias)', horas: 2160 },
  { label: '6 meses (180 dias)', horas: 4320 },
  { label: '1 ano (365 dias)', horas: 8760 },
]

function NovoFoco({ userId, onFocoCriado, onCancelar }: NovoFocoProps) {
  const [titulo, setTitulo] = useState('')
  const [metaHoras, setMetaHoras] = useState(OPCOES_META[0].horas)
  const [observacoes, setObservacoes] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (!titulo.trim()) {
      setErro('O nome do F.O.C.O é obrigatório.')
      return
    }

    setCarregando(true)
    const resultado = await handleCriarFoco(userId, {
      titulo: titulo.trim(),
      meta_horas: metaHoras,
      observacoes: observacoes.trim(),
    })
    setCarregando(false)

    if (!resultado.sucesso) {
      setErro(resultado.erro ?? 'Erro ao criar o Foco.')
      return
    }

    onFocoCriado()
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
      <div
        style={{
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '2rem',
        }}
      >
        <h2 style={{ marginBottom: '1.5rem' }}>Crie seu Próximo F.O.C.O</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Nome do F.O.C.O</label><br />
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              style={{ width: '100%', padding: '0.5rem' }}
              placeholder="Ex: TCC - Projeto WEB"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Tempo que Pretende Finalizar</label><br />
            <select
              value={metaHoras}
              onChange={(e) => setMetaHoras(Number(e.target.value))}
              style={{ width: '100%', padding: '0.5rem' }}
            >
              {OPCOES_META.map((opcao) => (
                <option key={opcao.horas} value={opcao.horas}>
                  {opcao.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label>Observações</label><br />
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', minHeight: '80px' }}
              placeholder="Ex: Criar projeto Web com métricas aprendidas em Aula"
            />
          </div>

          {erro && (
            <div className="alert alert-secondary" role="alert">
              {erro}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={carregando}>
              {carregando ? 'Criando...' : 'CRIAR'}
            </button>
            <button type="button" className="btn btn-outline-light" onClick={onCancelar}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NovoFoco