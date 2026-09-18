import { useState } from 'react'
import { supabase } from './supabaseClient'
import { validarSenha } from './utils/validarSenha'
import BarraForcaSenha from './BarraForcaSenha'

interface CadastroProps {
  onCadastroSuccess: () => void
  onVoltarParaLogin: () => void
}

function Cadastro({ onCadastroSuccess, onVoltarParaLogin }: CadastroProps) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erros, setErros] = useState<string[]>([])
  const [carregando, setCarregando] = useState(false)

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault()
    setErros([])

    const nomeLimpo = nome.trim()
    const emailLimpo = email.trim()

    // Validação de campos vazios
    const errosValidacao: string[] = []
    if (!nomeLimpo) errosValidacao.push('O nome é obrigatório.')
    if (!emailLimpo) errosValidacao.push('O e-mail é obrigatório.')
    if (!senha) errosValidacao.push('A senha é obrigatória.')
    if (!confirmarSenha) errosValidacao.push('A confirmação de senha é obrigatória.')

    // Validação de senhas iguais
    if (senha && confirmarSenha && senha !== confirmarSenha) {
      errosValidacao.push('As senhas não coincidem.')
    }

    // Validação de força da senha
    if (senha) {
      const resultadoSenha = validarSenha(senha, nomeLimpo, emailLimpo)
      if (!resultadoSenha.valida) {
        errosValidacao.push(...resultadoSenha.erros)
      }
    }

    if (errosValidacao.length > 0) {
      setErros(errosValidacao)
      return
    }

    setCarregando(true)

    const { data, error } = await supabase.auth.signUp({
      email: emailLimpo,
      password: senha,
      options: {
        data: {
          nome: nomeLimpo,
          papel: 'aluno',
        },
      },
    })

    setCarregando(false)

    if (error) {
  if (error.message.includes('User already registered')) {
    setErros(['Esse e-mail já está cadastrado. Tente fazer login.'])
  } else if (error.message.includes('Password should be at least')) {
    setErros(['A senha não atende aos requisitos mínimos do sistema.'])
  } else {
    setErros([error.message])
  }
  return
}

    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setErros(['Esse e-mail já está cadastrado. Tente fazer login.'])
      return
    }

    onCadastroSuccess()
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1>F.O.C.O. — Criar Conta</h1>
      <form onSubmit={handleCadastro}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Nome</label><br />
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Email</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
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
    {mostrarSenha ? '🙈' : '👁️'}
  </button>
</div>
          <BarraForcaSenha senha={senha} nome={nome} email={email} />
          <small style={{ color: '#aaa' }}>
            8-20 caracteres, com ao menos 1 letra e 1 número.
          </small>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Confirmar Senha</label><br />
          <input
            type={mostrarSenha ? 'text' : 'password'}
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
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
          {carregando ? 'Criando conta...' : 'Criar Conta'}
        </button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        Já tem conta?{' '}
        <button onClick={onVoltarParaLogin} style={{ background: 'none', border: 'none', color: '#4dabf7', cursor: 'pointer', textDecoration: 'underline' }}>
          Entrar
        </button>
      </p>
    </div>
  )
}

export default Cadastro