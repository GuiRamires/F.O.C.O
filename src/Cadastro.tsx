import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { supabase } from './supabaseClient'
import { validarSenha } from './services/validarSenha'
import BarraForcaSenha from './BarraForcaSenha'
import TermosModal from './TermosModal'
import { VERSAO_DO_TERMO } from './services/termoService'
import { registrarLog } from './services/logService'
import CartaoAcesso from './components/CartaoAcesso'
import CampoSenha from './components/CampoSenha'

interface CadastroProps {
  onCadastroSuccess: () => void
  onVoltarParaLogin: () => void
  onVoltarInicio?: () => void
}

const MENSAGEM_CADASTRO_RECUSADO =
  'Não foi possível concluir o cadastro com esses dados. Se você já tem uma conta, faça login.'
const MENSAGEM_ERRO_INESPERADO = 'Não foi possível concluir o cadastro agora. Tente novamente em alguns minutos.'

function Cadastro({ onCadastroSuccess, onVoltarParaLogin, onVoltarInicio }: CadastroProps) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [confirmarEmail, setConfirmarEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erros, setErros] = useState<string[]>([])
  const [carregando, setCarregando] = useState(false)
  const [termosAceitos, setTermosAceitos] = useState(false)
  const [modalTermosAberto, setModalTermosAberto] = useState(false)

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault()
    setErros([])

    const nomeLimpo = nome.trim()
    const emailLimpo = email.trim()
    const confirmarEmailLimpo = confirmarEmail.trim()

    const errosValidacao: string[] = []
    if (!nomeLimpo) errosValidacao.push('O nome é obrigatório.')
    if (!emailLimpo) errosValidacao.push('O e-mail é obrigatório.')
    if (!confirmarEmailLimpo) errosValidacao.push('A confirmação de e-mail é obrigatória.')
    if (!senha) errosValidacao.push('A senha é obrigatória.')
    if (!confirmarSenha) errosValidacao.push('A confirmação de senha é obrigatória.')
    if (!termosAceitos) errosValidacao.push('Você precisa aceitar os Termos de Uso para criar sua conta.')

    if (emailLimpo && confirmarEmailLimpo && emailLimpo.toLowerCase() !== confirmarEmailLimpo.toLowerCase()) {
      errosValidacao.push('Os e-mails não coincidem.')
    }

    if (senha && confirmarSenha && senha !== confirmarSenha) {
      errosValidacao.push('As senhas não coincidem.')
    }

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
          termo_versao: VERSAO_DO_TERMO,
        },
      },
    })

    setCarregando(false)

    if (error) {
      if (error.message.includes('User already registered')) {
        setErros([MENSAGEM_CADASTRO_RECUSADO])
      } else if (error.message.includes('Password should be at least')) {
        setErros(['A senha não atende aos requisitos mínimos do sistema.'])
      } else {
        setErros([MENSAGEM_ERRO_INESPERADO])
      }
      return
    }

    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setErros([MENSAGEM_CADASTRO_RECUSADO])
      return
    }

    supabase.functions
      .invoke('enviar-email-cadastro')
      .catch((err) => {
        console.error('Erro ao enviar e-mail de boas-vindas:', err)
      })

    if (data.user) {
      registrarLog(data.user.id, 'cadastro')
    }

    onCadastroSuccess()
  }

  return (
    <CartaoAcesso titulo="Criar conta" subtitulo="Leva menos de um minuto. Depois é só escolher o seu primeiro Foco.">
      <form className="foco-acesso__formulario" onSubmit={handleCadastro}>
        <div className="campo">
          <label htmlFor="cadastro-nome">Nome</label>
          <input
            id="cadastro-nome"
            type="text"
            autoComplete="name"
            maxLength={80}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div className="campo">
          <label htmlFor="cadastro-email">E-mail</label>
          <input
            id="cadastro-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="campo">
          <label htmlFor="cadastro-confirmar-email">Confirmar e-mail</label>
          <input
            id="cadastro-confirmar-email"
            type="email"
            autoComplete="email"
            value={confirmarEmail}
            onChange={(e) => setConfirmarEmail(e.target.value)}
          />
        </div>

        <div className="campo">
          <label htmlFor="cadastro-senha">Senha</label>
          <CampoSenha
            id="cadastro-senha"
            valor={senha}
            onAlterar={setSenha}
            mostrar={mostrarSenha}
            onAlternar={() => setMostrarSenha(!mostrarSenha)}
            autoComplete="new-password"
            descritoPor="cadastro-senha-dica cadastro-senha-requisitos"
          />
          <small id="cadastro-senha-dica" className="foco-dica">
            8 a 20 caracteres, com letra maiúscula, letra minúscula e número, sem sequências (como 1234) e sem o seu
            nome ou e-mail.
          </small>
          <BarraForcaSenha senha={senha} nome={nome} email={email} id="cadastro-senha-requisitos" />
        </div>

        <div className="campo">
          <label htmlFor="cadastro-confirmar-senha">Confirmar senha</label>
          <CampoSenha
            id="cadastro-confirmar-senha"
            valor={confirmarSenha}
            onAlterar={setConfirmarSenha}
            mostrar={mostrarSenha}
            onAlternar={() => setMostrarSenha(!mostrarSenha)}
            autoComplete="new-password"
          />
        </div>

        <div className="foco-aceite">
          <input
            type="checkbox"
            id="aceite-termos"
            checked={termosAceitos}
            onChange={() => {
              if (!termosAceitos) {
                setModalTermosAberto(true)
              } else {
                setTermosAceitos(false)
              }
            }}
          />
          <label htmlFor="aceite-termos">
            Li e aceito os{' '}
            <button type="button" className="link-texto" onClick={() => setModalTermosAberto(true)}>
              Termos de Uso e Política de Privacidade
            </button>
          </label>
        </div>

        <TermosModal
          aberto={modalTermosAberto}
          onAceitar={() => {
            setTermosAceitos(true)
            setModalTermosAberto(false)
          }}
          onFechar={() => setModalTermosAberto(false)}
        />

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
          {carregando ? 'Criando conta...' : 'Criar conta'}
        </button>

        <p className="foco-acesso__troca">
          Já tem conta?{' '}
          <button type="button" className="link-texto" onClick={onVoltarParaLogin}>
            Entrar
          </button>
        </p>
        {onVoltarInicio && (
          <button type="button" className="foco-acesso__voltar" onClick={onVoltarInicio}>
            ← Voltar à página inicial
          </button>
        )}
      </form>
    </CartaoAcesso>
  )
}

export default Cadastro
