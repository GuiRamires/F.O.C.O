import { useEffect, useState, type FormEvent } from 'react'
import BarraForcaSenha from './BarraForcaSenha'
import ExportarDados from './ExportarDados'
import ListaChamados from './ListaChamados'
import ModalExcluirConta from './ModalExcluirConta'
import TermosModal from './TermosModal'
import {
  handleAlterarEmail,
  handleAlterarNome,
  handleAlterarSenha,
  handleCarregarConta,
  handleConfirmarSenhaComCodigo,
  handleReenviarCodigo,
  type DadosDaConta,
} from './controllers/contaController'
import { handleListarMeusChamados } from './controllers/suporteController'
import { handleConsultarAceite } from './controllers/termoController'
import type { AceiteDoTermo } from './repositories/termoRepository'
import type { Chamado } from './repositories/suporteRepository'
import { LIMITE_NOME, type ResultadoConta } from './services/contaService'
import { formatarData } from './utils/formatarData'

interface MinhaContaProps {
  userId: string
  onVoltar: () => void
  onNomeAlterado: (nome: string) => void
  onContaExcluida: () => void
}

type Aviso = { tipo: 'erro' | 'sucesso'; texto: string } | null

function avisoDe(resultado: ResultadoConta): Aviso {
  return { tipo: resultado.sucesso ? 'sucesso' : 'erro', texto: resultado.mensagem }
}

function Mensagem({ aviso }: { aviso: Aviso }) {
  if (!aviso) return null
  return (
    <p className={`mensagem mensagem--${aviso.tipo}`} role={aviso.tipo === 'erro' ? 'alert' : 'status'}>
      {aviso.texto}
    </p>
  )
}

function MinhaConta({ userId, onVoltar, onNomeAlterado, onContaExcluida }: MinhaContaProps) {
  const [conta, setConta] = useState<DadosDaConta | null>(null)
  const [erroCarregar, setErroCarregar] = useState(false)
  const [chamados, setChamados] = useState<Chamado[]>([])
  const [carregandoChamados, setCarregandoChamados] = useState(true)

  const [nome, setNome] = useState('')
  const [avisoNome, setAvisoNome] = useState<Aviso>(null)
  const [novoEmail, setNovoEmail] = useState('')
  const [avisoEmail, setAvisoEmail] = useState<Aviso>(null)
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [codigo, setCodigo] = useState('')
  const [aguardandoCodigo, setAguardandoCodigo] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [avisoSenha, setAvisoSenha] = useState<Aviso>(null)
  const [salvando, setSalvando] = useState<'nome' | 'email' | 'senha' | null>(null)
  const [modalExcluir, setModalExcluir] = useState(false)
  const [aceite, setAceite] = useState<AceiteDoTermo | null>(null)
  const [termoAberto, setTermoAberto] = useState(false)

  useEffect(() => {
    let ativo = true
    handleCarregarConta(userId).then((dados) => {
      if (!ativo) return
      if (!dados) {
        setErroCarregar(true)
        return
      }
      setConta(dados)
      setNome(dados.nome)
    })
    handleConsultarAceite(userId).then((resultado) => {
      if (ativo) setAceite(resultado)
    })
    handleListarMeusChamados(userId).then((resultado) => {
      if (!ativo) return
      setChamados(resultado.chamados)
      setCarregandoChamados(false)
    })
    return () => {
      ativo = false
    }
  }, [userId])

  async function salvarNome(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (salvando) return
    setSalvando('nome')
    const resultado = await handleAlterarNome(userId, nome)
    setSalvando(null)
    setAvisoNome(avisoDe(resultado))
    if (resultado.sucesso && conta) {
      const nomeSalvo = nome.trim()
      setConta({ ...conta, nome: nomeSalvo })
      onNomeAlterado(nomeSalvo)
    }
  }

  async function pedirTrocaEmail(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (salvando || !conta) return
    setSalvando('email')
    const resultado = await handleAlterarEmail(userId, conta.email, novoEmail)
    setSalvando(null)
    setAvisoEmail(avisoDe(resultado))
    if (resultado.sucesso) setNovoEmail('')
  }

  function limparSenhas() {
    setSenhaAtual('')
    setNovaSenha('')
    setConfirmacao('')
    setCodigo('')
    setAguardandoCodigo(false)
  }

  async function trocarSenha(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (salvando || !conta) return
    setSalvando('senha')
    const resultado = aguardandoCodigo
      ? await handleConfirmarSenhaComCodigo(userId, novaSenha, codigo)
      : await handleAlterarSenha(userId, { senhaAtual, novaSenha, confirmacao, nome: conta.nome, email: conta.email })
    setSalvando(null)
    setAvisoSenha(avisoDe(resultado))
    if (resultado.precisaCodigo) setAguardandoCodigo(true)
    if (resultado.sucesso) limparSenhas()
  }

  async function reenviarCodigo() {
    setAvisoSenha(avisoDe(await handleReenviarCodigo()))
  }

  if (erroCarregar) {
    return (
      <main className="tela">
        <p className="mensagem mensagem--erro">Não foi possível carregar os dados da conta. Tente de novo.</p>
        <button type="button" className="btn btn-outline-light" onClick={onVoltar}>
          Voltar
        </button>
      </main>
    )
  }

  if (!conta) return <p className="tela">Carregando sua conta...</p>

  return (
    <main className="tela">
      <div className="tela__topo">
        <h1 className="tela__titulo">Minha conta</h1>
        <button type="button" className="btn btn-outline-light" onClick={onVoltar}>
          Voltar
        </button>
      </div>

      <section className="secao" aria-labelledby="dados-titulo">
        <h2 id="dados-titulo" className="secao__titulo">
          Seus dados
        </h2>
        <p>
          E-mail: <strong>{conta.email}</strong>
          <br />
          Conta criada em {formatarData(conta.criadoEm)}
        </p>
        <form onSubmit={salvarNome} noValidate>
          <div className="campo">
            <label htmlFor="conta-nome">Nome</label>
            <input id="conta-nome" value={nome} maxLength={LIMITE_NOME} onChange={(evento) => setNome(evento.target.value)} />
          </div>
          <Mensagem aviso={avisoNome} />
          <button type="submit" className="btn btn-primary" disabled={salvando !== null}>
            {salvando === 'nome' ? 'Salvando...' : 'Salvar nome'}
          </button>
        </form>
      </section>

      <section className="secao" aria-labelledby="email-titulo">
        <h2 id="email-titulo" className="secao__titulo">
          Trocar e-mail
        </h2>
        <p className="secao__dica">
          Enviaremos uma confirmação para o e-mail atual e outra para o novo. A troca só acontece depois das duas.
        </p>
        <form onSubmit={pedirTrocaEmail} noValidate>
          <div className="campo">
            <label htmlFor="conta-novo-email">Novo e-mail</label>
            <input
              id="conta-novo-email"
              type="email"
              autoComplete="email"
              value={novoEmail}
              onChange={(evento) => setNovoEmail(evento.target.value)}
            />
          </div>
          <Mensagem aviso={avisoEmail} />
          <button type="submit" className="btn btn-primary" disabled={salvando !== null}>
            {salvando === 'email' ? 'Enviando...' : 'Pedir troca de e-mail'}
          </button>
        </form>
      </section>

      <section className="secao" aria-labelledby="senha-titulo">
        <h2 id="senha-titulo" className="secao__titulo">
          Trocar senha
        </h2>
        <form onSubmit={trocarSenha} noValidate>
          <input type="email" name="username" autoComplete="username" value={conta.email} readOnly hidden />
          {!aguardandoCodigo ? (
            <>
              <div className="campo">
                <label htmlFor="conta-senha-atual">Senha atual</label>
                <input
                  id="conta-senha-atual"
                  type={mostrarSenha ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={senhaAtual}
                  onChange={(evento) => setSenhaAtual(evento.target.value)}
                />
              </div>
              <div className="campo">
                <label htmlFor="conta-nova-senha">Nova senha</label>
                <input
                  id="conta-nova-senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={novaSenha}
                  onChange={(evento) => setNovaSenha(evento.target.value)}
                />
                <BarraForcaSenha senha={novaSenha} nome={conta.nome} email={conta.email} />
                <small className="secao__dica">
                  8 a 20 caracteres, com letra maiúscula, letra minúscula e número, sem sequências (como 1234) e sem o
                  seu nome ou e-mail.
                </small>
              </div>
              <div className="campo">
                <label htmlFor="conta-confirmacao">Confirmar nova senha</label>
                <input
                  id="conta-confirmacao"
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
            </>
          ) : (
            <div className="campo">
              <label htmlFor="conta-codigo">Código de verificação enviado ao seu e-mail</label>
              <input
                id="conta-codigo"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={10}
                value={codigo}
                onChange={(evento) => setCodigo(evento.target.value.replace(/\D/g, ''))}
              />
            </div>
          )}
          <Mensagem aviso={avisoSenha} />
          <div className="grupo-botoes">
            <button type="submit" className="btn btn-primary" disabled={salvando !== null}>
              {salvando === 'senha' ? 'Salvando...' : aguardandoCodigo ? 'Confirmar código' : 'Trocar senha'}
            </button>
            {aguardandoCodigo && (
              <>
                <button type="button" className="btn btn-outline-light" onClick={reenviarCodigo}>
                  Reenviar código
                </button>
                <button type="button" className="btn btn-outline-light" onClick={limparSenhas}>
                  Cancelar
                </button>
              </>
            )}
          </div>
        </form>
      </section>

      <section className="secao" aria-labelledby="chamados-titulo">
        <h2 id="chamados-titulo" className="secao__titulo">
          Meus chamados
        </h2>
        <ListaChamados chamados={chamados} carregando={carregandoChamados} />
      </section>

      <section className="secao" aria-labelledby="termo-titulo">
        <h2 id="termo-titulo" className="secao__titulo">
          Termo de Uso e Política de Privacidade
        </h2>
        <p>
          {aceite
            ? `Você aceitou a versão ${aceite.versao} em ${formatarData(aceite.aceitoEm)}.`
            : 'Não encontramos o registro do seu aceite.'}
        </p>
        <button type="button" className="btn btn-outline-light" onClick={() => setTermoAberto(true)}>
          Ler o termo
        </button>
        <TermosModal
          aberto={termoAberto}
          somenteLeitura
          onAceitar={() => setTermoAberto(false)}
          onFechar={() => setTermoAberto(false)}
        />
      </section>

      <section className="secao" aria-labelledby="exportar-titulo">
        <h2 id="exportar-titulo" className="secao__titulo">
          Exportar meus dados
        </h2>
        <ExportarDados userId={userId} />
      </section>

      <section className="secao" aria-labelledby="excluir-titulo">
        <h2 id="excluir-titulo" className="secao__titulo">
          Excluir conta
        </h2>
        <p className="secao__dica">Apaga para sempre a sua conta e todos os seus dados.</p>
        <button type="button" className="btn btn-outline-danger" onClick={() => setModalExcluir(true)}>
          Excluir minha conta
        </button>
      </section>

      {modalExcluir && (
        <ModalExcluirConta userId={userId} onExcluida={onContaExcluida} onFechar={() => setModalExcluir(false)} />
      )}
    </main>
  )
}

export default MinhaConta
