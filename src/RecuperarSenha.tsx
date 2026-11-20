import { useEffect, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import BarraForcaSenha from './BarraForcaSenha'
import { handleRedefinirSenha, handleSolicitarRecuperacao } from './controllers/recuperacaoController'
import { segundosParaReenvio } from './services/recuperacaoSenhaService'
import CartaoAcesso from './components/CartaoAcesso'
import MensagemSucesso from './components/MensagemSucesso'

interface RecuperarSenhaProps {
  onConcluir: () => void
  onVoltar: () => void
}

function RecuperarSenha({ onConcluir, onVoltar }: RecuperarSenhaProps) {
  const [etapa, setEtapa] = useState<'email' | 'codigo' | 'concluido'>('email')
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [ultimoEnvio, setUltimoEnvio] = useState<number | null>(null)
  const [agora, setAgora] = useState(() => Date.now())

  const espera = segundosParaReenvio(ultimoEnvio, agora)

  useEffect(() => {
    if (espera === 0) return
    const intervalo = window.setInterval(() => setAgora(Date.now()), 1000)
    return () => window.clearInterval(intervalo)
  }, [espera])

  async function enviarCodigo(evento?: FormEvent<HTMLFormElement>) {
    evento?.preventDefault()
    if (carregando || espera > 0) return
    setCarregando(true)
    setErro('')
    const resultado = await handleSolicitarRecuperacao(email)
    setCarregando(false)
    if (!resultado.sucesso) {
      setErro(resultado.mensagem)
      return
    }
    const instante = Date.now()
    setUltimoEnvio(instante)
    setAgora(instante)
    setMensagem(resultado.mensagem)
    setEtapa('codigo')
  }

  async function redefinir(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (carregando) return
    setCarregando(true)
    setErro('')
    const resultado = await handleRedefinirSenha({ email, codigo, novaSenha, confirmacao })
    setCarregando(false)
    if (resultado.sucesso) {
      setMensagem(resultado.mensagem)
      setEtapa('concluido')
      return
    }
    setErro(resultado.mensagem)
  }

  const subtitulo =
    etapa === 'email' ? (
      'Informe o e-mail da sua conta. Vamos enviar um código de verificação para redefinir a senha.'
    ) : etapa === 'codigo' ? (
      <p role="status">{mensagem}</p>
    ) : undefined

  return (
    <CartaoAcesso titulo="Recuperar senha" subtitulo={subtitulo}>
      <AnimatePresence mode="wait">
        {etapa === 'concluido' ? (
          <motion.div key="concluido" {...TRANSICAO_ETAPA}>
            <MensagemSucesso>
              <p className="foco-sucesso__titulo" role="status">
                {mensagem}
              </p>
              <button type="button" className="btn btn-primary" onClick={onConcluir}>
                Entrar na plataforma
              </button>
            </MensagemSucesso>
          </motion.div>
        ) : etapa === 'email' ? (
          <motion.form key="email" className="foco-acesso__formulario" onSubmit={enviarCodigo} noValidate {...TRANSICAO_ETAPA}>
            <div className="campo">
              <label htmlFor="recuperar-email">E-mail</label>
              <input
                id="recuperar-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(evento) => setEmail(evento.target.value)}
              />
            </div>
            <p className="mensagem mensagem--erro" role="alert">
              {erro}
            </p>
            <button type="submit" className="btn btn-primary foco-acesso__enviar" disabled={carregando}>
              {carregando ? 'Enviando...' : 'Enviar código'}
            </button>
            <button type="button" className="foco-acesso__voltar" onClick={onVoltar}>
              ← Voltar para o login
            </button>
          </motion.form>
        ) : (
          <motion.form key="codigo" className="foco-acesso__formulario" onSubmit={redefinir} noValidate {...TRANSICAO_ETAPA}>
            <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
            <div className="campo">
              <label htmlFor="recuperar-codigo">Código de verificação</label>
              <input
                id="recuperar-codigo"
                className="foco-acesso__codigo"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={10}
                value={codigo}
                onChange={(evento) => setCodigo(evento.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div className="campo">
              <label htmlFor="recuperar-nova-senha">Nova senha</label>
              <input
                id="recuperar-nova-senha"
                type={mostrarSenha ? 'text' : 'password'}
                autoComplete="new-password"
                value={novaSenha}
                onChange={(evento) => setNovaSenha(evento.target.value)}
                aria-describedby="recuperar-senha-dica recuperar-senha-requisitos"
              />
              <small id="recuperar-senha-dica" className="foco-dica">
                8 a 20 caracteres, com letra maiúscula, letra minúscula e número, sem sequências (como 1234) e sem o seu
                nome ou e-mail.
              </small>
              <BarraForcaSenha senha={novaSenha} nome="" email={email} id="recuperar-senha-requisitos" />
            </div>
            <div className="campo">
              <label htmlFor="recuperar-confirmacao">Confirmar nova senha</label>
              <input
                id="recuperar-confirmacao"
                type={mostrarSenha ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmacao}
                onChange={(evento) => setConfirmacao(evento.target.value)}
              />
            </div>
            <label className="foco-check">
              <input type="checkbox" checked={mostrarSenha} onChange={() => setMostrarSenha(!mostrarSenha)} />
              Mostrar senhas
            </label>
            <p className="mensagem mensagem--erro" role="alert">
              {erro}
            </p>
            <div className="foco-acesso__linha">
              <button type="submit" className="btn btn-primary" disabled={carregando}>
                {carregando ? 'Salvando...' : 'Redefinir senha'}
              </button>
              <button
                type="button"
                className="btn btn-outline-light"
                disabled={espera > 0 || carregando}
                onClick={() => enviarCodigo()}
              >
                {espera > 0 ? `Reenviar código em ${espera}s` : 'Reenviar código'}
              </button>
            </div>
            <button type="button" className="foco-acesso__voltar" onClick={onVoltar}>
              ← Voltar para o login
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </CartaoAcesso>
  )
}

const TRANSICAO_ETAPA = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
  transition: { duration: 0.25 },
}

export default RecuperarSenha
