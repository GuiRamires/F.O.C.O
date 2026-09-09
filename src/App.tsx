import { useState, useEffect } from 'react'
import { handleTentarAtribuirEstrela } from './controllers/estrelaController'
import { supabase } from './supabaseClient'
import Login from './Login'

const FOCOS_TESTE = [
  { id: 'a0000000-0000-0000-0000-000000000001', titulo: 'Inglês' },
  { id: 'b0000000-0000-0000-0000-000000000002', titulo: 'TCC' },
]

interface Toast {
  id: number
  mensagem: string
  permitido: boolean
}

interface AnimacaoCard {
  [focoId: string]: 'liberado' | 'bloqueado' | null
}

function App() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [animacoes, setAnimacoes] = useState<AnimacaoCard>({})
  const [carregando, setCarregando] = useState<string | null>(null)
  const [logado, setLogado] = useState(false)
  const [verificandoSessao, setVerificandoSessao] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLogado(!!session)
      setVerificandoSessao(false)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLogado(!!session)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  function mostrarToast(mensagem: string, permitido: boolean) {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, mensagem, permitido }])

    // Remove o toast sozinho depois de 4 segundos
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  async function testarEstrela(focoId: string) {
    setCarregando(focoId)
    const resultado = await handleTentarAtribuirEstrela(focoId)

    mostrarToast(
      `${resultado.mensagem} (Acumulado: ${resultado.horasAcumuladas.toFixed(1)}h)`,
      resultado.permitido
    )

    // Dispara a animação do card
    setAnimacoes((prev) => ({ ...prev, [focoId]: resultado.permitido ? 'liberado' : 'bloqueado' }))
    setTimeout(() => {
      setAnimacoes((prev) => ({ ...prev, [focoId]: null }))
    }, 1000)

    setCarregando(null)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  if (verificandoSessao) {
    return <p style={{ padding: '2rem' }}>Carregando...</p>
  }

  if (!logado) {
    return <Login onLoginSuccess={() => setLogado(true)} />
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      {/* Container dos Toasts, fixo no canto da tela */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-item alert ${toast.permitido ? 'alert-warning' : 'alert-secondary'}`}
            role="alert"
          >
            {toast.mensagem}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem' }}>F.O.C.O.</h1>
        <button className="btn btn-outline-light" onClick={handleLogout}>Sair</button>
      </div>

      {FOCOS_TESTE.map((foco) => {
        const classeAnimacao =
          animacoes[foco.id] === 'liberado' ? 'card-liberado' :
          animacoes[foco.id] === 'bloqueado' ? 'card-bloqueado' : ''

        return (
          <div
            key={foco.id}
            className={classeAnimacao}
            style={{ border: '1px solid #444', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}
          >
            <h2>{foco.titulo}</h2>
            <button
              className="btn btn-warning"
              onClick={() => testarEstrela(foco.id)}
              disabled={carregando === foco.id}
            >
              {carregando === foco.id ? 'Verificando...' : '⭐ Atribuir Estrela Dourada'}
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default App