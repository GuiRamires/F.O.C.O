import { useState, useEffect } from 'react'
import { handleTentarAtribuirEstrela } from './controllers/estrelaController'
import { supabase } from './supabaseClient'

const FOCOS_TESTE = [
  { id: 'a0000000-0000-0000-0000-000000000001', titulo: 'Inglês' },
  { id: 'b0000000-0000-0000-0000-000000000002', titulo: 'TCC' },
]

function App() {
  const [resultados, setResultados] = useState<Record<string, string>>({})
  const [carregando, setCarregando] = useState<string | null>(null)
  const [logado, setLogado] = useState(false)

  useEffect(() => {
    async function fazerLogin() {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'teste@foco.com',
        password: 'Teste123456',
      })
      if (error) {
        console.error('Erro no login:', error.message)
      } else {
        setLogado(true)
      }
    }
    fazerLogin()
  }, [])

  async function testarEstrela(focoId: string) {
    setCarregando(focoId)
    const resultado = await handleTentarAtribuirEstrela(focoId)
    setResultados((prev) => ({
      ...prev,
      [focoId]: `${resultado.permitido ? '✅' : '🔒'} ${resultado.mensagem} (Acumulado: ${resultado.horasAcumuladas.toFixed(1)}h)`,
    }))
    setCarregando(null)
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>F.O.C.O. — Teste da Trava de 10h (Estrela Dourada)</h1>
      <p>Status login: {logado ? '✅ Autenticado' : '⏳ Autenticando...'}</p>

      {FOCOS_TESTE.map((foco) => (
        <div key={foco.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
          <h2>{foco.titulo}</h2>
          <button onClick={() => testarEstrela(foco.id)} disabled={carregando === foco.id || !logado}>
            {carregando === foco.id ? 'Verificando...' : 'Tentar Atribuir Estrela Dourada'}
          </button>
          {resultados[foco.id] && (
            <p style={{ marginTop: '0.5rem' }}>{resultados[foco.id]}</p>
          )}
        </div>
      ))}
    </div>
  )
}

export default App