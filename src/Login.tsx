import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { supabase } from './supabaseClient'
import { registrarLog } from './services/logService'
import CartaoAcesso from './components/CartaoAcesso'
import CampoSenha from './components/CampoSenha'

interface LoginProps {
  onLoginSuccess: () => void
  onIrParaCadastro: () => void
  onRecuperarSenha: () => void
  onNaoConsigoAcessar: () => void
  onVoltarInicio: () => void
}

const MENSAGEM_CONTA_BLOQUEADA =
  'Esta conta está bloqueada temporariamente. Para resolver, use a opção "Não consigo acessar minha conta" e fale com o suporte.'

function Login({ onLoginSuccess, onIrParaCadastro, onRecuperarSenha, onNaoConsigoAcessar, onVoltarInicio }: LoginProps) {
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
      } else if (error.code === 'user_banned' || error.message.toLowerCase().includes('banned')) {
        setErros([MENSAGEM_CONTA_BLOQUEADA])
      } else if (error.message.includes('Email not confirmed')) {
        setErros(['E-mail ainda não confirmado. Verifique sua caixa de entrada.'])
      } else {
        setErros(['Não foi possível entrar agora. Tente novamente em alguns minutos.'])
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
    <CartaoAcesso titulo="Entrar" subtitulo="Bom te ver de novo. Continue de onde parou.">
      <form className="foco-acesso__formulario" onSubmit={handleLogin}>
        <div className="campo">
          <label htmlFor="login-email">E-mail</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="campo">
          <label htmlFor="login-senha">Senha</label>
          <CampoSenha
            id="login-senha"
            valor={senha}
            onAlterar={setSenha}
            mostrar={mostrarSenha}
            onAlternar={() => setMostrarSenha(!mostrarSenha)}
            autoComplete="current-password"
          />
        </div>

        <AnimatePresence>
          {erros.length > 0 && (
            <motion.ul
              className="foco-erros"
              role="alert"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {erros.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>

        <button type="submit" className="btn btn-primary foco-acesso__enviar" disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>

        <div className="foco-acesso__links">
          <button type="button" className="link-texto" onClick={onRecuperarSenha}>
            Esqueci minha senha
          </button>
          <button type="button" className="link-texto" onClick={onNaoConsigoAcessar}>
            Não consigo acessar minha conta
          </button>
        </div>

        <p className="foco-acesso__troca">
          Não tem conta?{' '}
          <button type="button" className="link-texto" onClick={onIrParaCadastro}>
            Cadastre-se
          </button>
        </p>
        <button type="button" className="foco-acesso__voltar" onClick={onVoltarInicio}>
          ← Voltar à página inicial
        </button>
      </form>
    </CartaoAcesso>
  )
}

export default Login
