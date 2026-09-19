import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Login from './Login'
import Cadastro from './Cadastro'
import ListaFocos from './ListaFocos'
import NovoFoco from './NovoFoco'
import { handleListarFocos } from './controllers/focoController'
import type { FocoComProgresso } from './services/focoService'

function App() {
  const [logado, setLogado] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [verificandoSessao, setVerificandoSessao] = useState(true)
  const [telaAuth, setTelaAuth] = useState<'login' | 'cadastro'>('login')

  const [focos, setFocos] = useState<FocoComProgresso[]>([])
  const [carregandoFocos, setCarregandoFocos] = useState(false)
  const [telaAtual, setTelaAtual] = useState<'lista' | 'novoFoco'>('lista')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLogado(!!session)
      setUserId(session?.user.id ?? null)
      setVerificandoSessao(false)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLogado(!!session)
      setUserId(session?.user.id ?? null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (logado && userId) {
      carregarFocos(userId)
    }
  }, [logado, userId])

  async function carregarFocos(uid: string) {
    setCarregandoFocos(true)
    const resultado = await handleListarFocos(uid)
    if (resultado.sucesso) {
      setFocos(resultado.focos)
    }
    setCarregandoFocos(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setTelaAtual('lista')
  }

  if (verificandoSessao) {
    return <p style={{ padding: '2rem' }}>Carregando...</p>
  }

  if (!logado) {
    if (telaAuth === 'cadastro') {
      return (
        <Cadastro
          onCadastroSuccess={() => setLogado(true)}
          onVoltarParaLogin={() => setTelaAuth('login')}
        />
      )
    }
    return (
      <Login
        onLoginSuccess={() => setLogado(true)}
        onIrParaCadastro={() => setTelaAuth('cadastro')}
      />
    )
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem' }}>F.O.C.O.</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {telaAtual === 'lista' && (
            <button className="btn btn-primary" onClick={() => setTelaAtual('novoFoco')}>
              +
            </button>
          )}
          <button className="btn btn-outline-light" onClick={handleLogout}>Sair</button>
        </div>
      </div>

      {carregandoFocos ? (
        <p>Carregando seus Focos...</p>
      ) : telaAtual === 'novoFoco' ? (
        <NovoFoco
          userId={userId!}
          onFocoCriado={() => {
            setTelaAtual('lista')
            carregarFocos(userId!)
          }}
          onCancelar={() => setTelaAtual('lista')}
        />
      ) : (
        <ListaFocos focos={focos} onNovoFoco={() => setTelaAtual('novoFoco')} />
      )}
    </div>
  )
}

export default App