import { useState } from 'react'
import { supabase } from './supabaseClient'
import { registrarLog } from './services/logService'

interface LoginProps {
  onLoginSuccess: () => void
  onIrParaCadastro: () => void
}

function Login({ onLoginSuccess, onIrParaCadastro }: LoginProps) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erros, setErros] = useState<string[]>([])
  const [carregando, setCarregando] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErros([])

    const emailLimpo = email.trim()

    const errosValidacao: string[] = []
    if (!emailLimpo) errosValidacao.push('O e-mail é obrigatório.')
    if (!senha) errosValidacao.push('A senha é obrigatória.')

    if (errosValidacao.length > 0) {
      setErros(errosValidacao)
      return
    }

    setCarregando(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: emailLimpo,
      password: senha,
    })

    setCarregando(false)

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setErros(['E-mail ou senha incorretos.'])
      } else if (error.message.includes('Email not confirmed')) {
        setErros(['E-mail ainda não confirmado. Verifique sua caixa de entrada.'])
      } else {
        setErros([error.message])
      }
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      registrarLog(user.id, 'login')
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
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Senha</label><br />
          <div style={{ position: 'relative' }}>
            <input
              type={mostrarSenha ? 'text' : 'password'}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', paddingRight: '2.5rem' }}
            />
            <button
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              style={{
                position: 'absolute',
                right: '0.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: 0,
              }}
            >
              {mostrarSenha ? '👁' : '👁'}
            </button>
          </div>
        </div>

        {erros.length > 0 && (
          <div className="alert alert-secondary" role="alert">
            <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
              {erros.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <button type="submit" disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        Não tem conta?{' '}
        <button onClick={onIrParaCadastro} style={{ background: 'none', border: 'none', color: '#4dabf7', cursor: 'pointer', textDecoration: 'underline' }}>
          Cadastre-se
        </button>
      </p>
    </div>
  )
}

export default Login