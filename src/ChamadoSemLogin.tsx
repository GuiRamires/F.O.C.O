import { useState, type FormEvent } from 'react'
import { handleAbrirChamadoSemLogin } from './controllers/suporteController'
import {
  LIMITE_DATA_INFORMADA,
  LIMITE_DESCRICAO,
  LIMITE_NOME_INFORMADO,
  LIMITE_TITULOS_INFORMADOS,
  mascararDescricao,
  mascararVerificacao,
  ORIENTACAO_DADOS_SENSIVEIS,
} from './services/suporteService'
import CartaoAcesso from './components/CartaoAcesso'
import MensagemSucesso from './components/MensagemSucesso'

interface ChamadoSemLoginProps {
  onVoltar: () => void
  onRecuperarSenha: () => void
}

function ChamadoSemLogin({ onVoltar, onRecuperarSenha }: ChamadoSemLoginProps) {
  const [emailCadastrado, setEmailCadastrado] = useState('')
  const [emailContato, setEmailContato] = useState('')
  const [nome, setNome] = useState('')
  const [dataCadastro, setDataCadastro] = useState('')
  const [ultimoAcesso, setUltimoAcesso] = useState('')
  const [titulos, setTitulos] = useState('')
  const [descricao, setDescricao] = useState('')
  const [erro, setErro] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (enviando) return
    setEnviando(true)
    setErro('')
    const resultado = await handleAbrirChamadoSemLogin({
      emailCadastrado,
      emailContato,
      nome,
      dataCadastro,
      ultimoAcesso,
      titulos,
      descricao,
    })
    setEnviando(false)
    if (resultado.sucesso) {
      setConfirmacao(resultado.mensagem)
      return
    }
    setErro(resultado.mensagem)
  }

  if (confirmacao) {
    return (
      <CartaoAcesso titulo="Não consigo acessar minha conta">
        <MensagemSucesso>
          <p className="foco-sucesso__titulo" role="status">
            {confirmacao}
          </p>
          <button type="button" className="foco-acesso__voltar" onClick={onVoltar}>
            ← Voltar para o login
          </button>
        </MensagemSucesso>
      </CartaoAcesso>
    )
  }

  return (
    <CartaoAcesso
      titulo="Não consigo acessar minha conta"
      largo
      subtitulo={
        <p>
          Se você esqueceu a senha mas ainda acessa o seu e-mail, use a{' '}
          <button type="button" className="link-texto" onClick={onRecuperarSenha}>
            recuperação de senha
          </button>
          . Se perdeu o acesso ao e-mail cadastrado, preencha o pedido abaixo.
        </p>
      }
    >
      <form className="foco-acesso__formulario" onSubmit={enviar} noValidate>
        <div className="campo">
          <label htmlFor="sem-login-email">E-mail cadastrado no F.O.C.O.</label>
          <input
            id="sem-login-email"
            type="email"
            value={emailCadastrado}
            onChange={(evento) => setEmailCadastrado(evento.target.value)}
          />
        </div>
        <div className="campo">
          <label htmlFor="sem-login-contato">E-mail para receber a resposta</label>
          <input
            id="sem-login-contato"
            type="email"
            autoComplete="email"
            value={emailContato}
            onChange={(evento) => setEmailContato(evento.target.value)}
          />
        </div>

        <fieldset className="foco-acesso__grupo">
          <legend>Confirme que a conta é sua</legend>
          <p className="foco-dica">
            Responda o que lembrar. Comparamos estas respostas com os dados da conta antes de qualquer alteração. Nunca
            pedimos a sua senha.
          </p>
          <div className="campo">
            <label htmlFor="sem-login-nome">Nome usado no cadastro</label>
            <input
              id="sem-login-nome"
              value={nome}
              maxLength={LIMITE_NOME_INFORMADO}
              onChange={(evento) => setNome(mascararVerificacao(evento.target.value, LIMITE_NOME_INFORMADO))}
            />
          </div>
          <div className="campo">
            <label htmlFor="sem-login-cadastro">Quando criou a conta (aproximado)</label>
            <input
              id="sem-login-cadastro"
              placeholder="Ex.: setembro de 2026"
              value={dataCadastro}
              maxLength={LIMITE_DATA_INFORMADA}
              onChange={(evento) => setDataCadastro(mascararVerificacao(evento.target.value, LIMITE_DATA_INFORMADA))}
            />
          </div>
          <div className="campo">
            <label htmlFor="sem-login-acesso">Quando entrou pela última vez (aproximado)</label>
            <input
              id="sem-login-acesso"
              placeholder="Ex.: semana passada, 10/11/2026"
              value={ultimoAcesso}
              maxLength={LIMITE_DATA_INFORMADA}
              onChange={(evento) => setUltimoAcesso(mascararVerificacao(evento.target.value, LIMITE_DATA_INFORMADA))}
            />
          </div>
          <div className="campo">
            <label htmlFor="sem-login-titulos">Títulos de alguns dos seus Focos</label>
            <input
              id="sem-login-titulos"
              placeholder="Separe por vírgula. Ex.: Inglês, Cálculo"
              value={titulos}
              maxLength={LIMITE_TITULOS_INFORMADOS}
              onChange={(evento) => setTitulos(mascararVerificacao(evento.target.value, LIMITE_TITULOS_INFORMADOS))}
            />
          </div>
        </fieldset>

        <div className="campo">
          <label htmlFor="sem-login-descricao">O que aconteceu?</label>
          <textarea
            id="sem-login-descricao"
            rows={5}
            value={descricao}
            maxLength={LIMITE_DESCRICAO}
            onChange={(evento) => setDescricao(mascararDescricao(evento.target.value))}
            aria-describedby="sem-login-orientacao"
          />
          <span className="campo__contador">
            {descricao.length}/{LIMITE_DESCRICAO}
          </span>
          <small id="sem-login-orientacao" className="foco-dica">
            {ORIENTACAO_DADOS_SENSIVEIS}
          </small>
        </div>
        <p className="mensagem mensagem--erro" role="alert">
          {erro}
        </p>
        <button type="submit" className="btn btn-primary foco-acesso__enviar" disabled={enviando}>
          {enviando ? 'Enviando...' : 'Enviar solicitação'}
        </button>
        <button type="button" className="foco-acesso__voltar" onClick={onVoltar}>
          ← Voltar para o login
        </button>
      </form>
    </CartaoAcesso>
  )
}

export default ChamadoSemLogin
