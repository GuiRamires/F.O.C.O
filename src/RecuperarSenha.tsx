import { useEffect, useState, type FormEvent } from 'react'
import BarraForcaSenha from './BarraForcaSenha'
import { handleRedefinirSenha, handleSolicitarRecuperacao } from './controllers/recuperacaoController'
import { segundosParaReenvio } from './services/recuperacaoSenhaService'

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

  return (
    <main className="tela" style={{ maxWidth: '420px' }}>
      <h1 className="tela__titulo">Recuperar senha</h1>

      {etapa === 'concluido' ? (
        <div>
          <p className="mensagem mensagem--sucesso" role="status">
            {mensagem}
          </p>
          <button type="button" className="btn btn-primary" onClick={onConcluir}>
            Entrar na plataforma
          </button>
        </div>
      ) : etapa === 'email' ? (
        <form onSubmit={enviarCodigo} noValidate>
          <p>Informe o e-mail da sua conta. Vamos enviar um código de verificação para redefinir a senha.</p>
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
          <button type="submit" className="btn btn-primary" disabled={carregando}>
            {carregando ? 'Enviando...' : 'Enviar código'}
          </button>
        </form>
      ) : (
        <form onSubmit={redefinir} noValidate>
          <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
          <p className="mensagem" role="status">
            {mensagem}
          </p>
          <div className="campo">
            <label htmlFor="recuperar-codigo">Código de verificação</label>
            <input
              id="recuperar-codigo"
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
            />
            <BarraForcaSenha senha={novaSenha} nome="" email={email} />
            <small className="secao__dica">
              8 a 20 caracteres, com letra maiúscula, letra minúscula e número, sem sequências (como 1234) e sem o seu
              nome ou e-mail.
            </small>
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
          <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
            <input type="checkbox" checked={mostrarSenha} onChange={() => setMostrarSenha(!mostrarSenha)} />
            Mostrar senhas
          </label>
          <p className="mensagem mensagem--erro" role="alert">
            {erro}
          </p>
          <div className="grupo-botoes">
            <button type="submit" className="btn btn-primary" disabled={carregando}>
              {carregando ? 'Salvando...' : 'Redefinir senha'}
            </button>
            <button type="button" className="btn btn-outline-light" disabled={espera > 0 || carregando} onClick={() => enviarCodigo()}>
              {espera > 0 ? `Reenviar código em ${espera}s` : 'Reenviar código'}
            </button>
          </div>
        </form>
      )}

      {etapa !== 'concluido' && (
        <p style={{ marginTop: '1.5rem' }}>
          <button type="button" className="link-texto" onClick={onVoltar}>
            Voltar para o login
          </button>
        </p>
      )}
    </main>
  )
}

export default RecuperarSenha
