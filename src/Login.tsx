import { useState } from 'react'
import { supabase } from './supabaseClient'

interface LoginProps {
  onLoginSuccess: () => void
}

function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    setCarregando(false)

    if (error) {
      setErro('Email ou senha incorretos.')
      return
    }

    onLoginSuccess()
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '400px', margin: '0 auto' }}>
      <h1>F.O.C.O. — Login</h1>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Email</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Senha</label><br />
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        {erro && <p style={{ color: 'red' }}>{erro}</p>}
        <button type="submit" disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}

export default Login