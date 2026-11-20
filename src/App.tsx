import { lazy, Suspense, useState, useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { supabase } from './supabaseClient'
import Login from './Login'
import Cadastro from './Cadastro'
import ListaFocos from './ListaFocos'
import NovoFoco from './NovoFoco'
import { handleListarFocos } from './controllers/focoController'
import { handleConfirmarDescarte, handleRestaurarSessao, handleSalvarSessao } from './controllers/sessaoController'
import type { FocoComProgresso } from './services/focoService'
import Sidebar, { type DestinoMenu } from './Sidebar'
import { handleCarregarPerfil } from './controllers/contaController'
import { handleAceitarTermo, handleVerificarTermo } from './controllers/termoController'
import { avisoDeNovaVersao } from './services/termoService'
import LayoutPublico from './landing/LayoutPublico'
import type { PaginaPublica } from './conteudo/site'
import RecuperarSenha from './RecuperarSenha'
import ChamadoSemLogin from './ChamadoSemLogin'
import ContaExcluida from './ContaExcluida'
import TermosModal from './TermosModal'
import BotaoSuporte from './BotaoSuporte'
import TelaPreparacao from './TelaPreparacao'
import TelaTimer from './TelaTimer'
import { iniciarSessao, pausarSessao, retomarSessao, type SessaoEmAndamento } from './services/sessaoService'
import { prepararAlerta } from './utils/alertaSonoro'
import { usePersistirSessao } from './hooks/usePersistirSessao'
import type { SessaoConcluida } from './TelaEstatisticas'
import './styles/conta.css'

const TelaEstatisticas = lazy(() => import('./TelaEstatisticas'))
const PainelAdmin = lazy(() => import('./PainelAdmin'))
const MinhaConta = lazy(() => import('./MinhaConta'))
const TelaSuporte = lazy(() => import('./TelaSuporte'))
const SitePublico = lazy(() => import('./landing/SitePublico'))
const Sobre = lazy(() => import('./landing/paginas/Sobre'))

type TelaAuth = 'inicio' | 'login' | 'cadastro' | 'chamadoSemLogin'
type TelaAtual = 'lista' | 'novoFoco' | 'preparacao' | 'estatisticas' | 'conta' | 'suporte' | 'sobre'

function App() {
  const [logado, setLogado] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [verificandoSessao, setVerificandoSessao] = useState(true)
  const [telaAuth, setTelaAuth] = useState<TelaAuth>('inicio')
  const [paginaPublica, setPaginaPublica] = useState<PaginaPublica>('inicio')
  const [recuperandoSenha, setRecuperandoSenha] = useState(false)
  const [contaFoiExcluida, setContaFoiExcluida] = useState(false)
  const [termoPendente, setTermoPendente] = useState<string | null>(null)
  const [aceitandoTermo, setAceitandoTermo] = useState(false)
  const [erroTermo, setErroTermo] = useState('')

  const [focos, setFocos] = useState<FocoComProgresso[]>([])
  const [carregandoFocos, setCarregandoFocos] = useState(false)
  const [telaAtual, setTelaAtual] = useState<TelaAtual>('lista')
  const [focoSelecionado, setFocoSelecionado] = useState<FocoComProgresso | null>(null)
  const [sidebarAberta, setSidebarAberta] = useState(false)
  const [emAndamento, setEmAndamento] = useState<SessaoEmAndamento | null>(() => handleRestaurarSessao())
  const [retomada, setRetomada] = useState(emAndamento !== null)
  const [sessaoConcluida, setSessaoConcluida] = useState<SessaoConcluida | null>(null)

  const [papel, setPapel] = useState<string | null>(null)
  const [nomeUsuario, setNomeUsuario] = useState('')

  usePersistirSessao(emAndamento)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLogado(!!session)
      setUserId(session?.user.id ?? null)
      setVerificandoSessao(false)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLogado(!!session)
      setUserId(session?.user.id ?? null)
      if (!session) {
        setPapel(null)
        setNomeUsuario('')
        setTermoPendente(null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (logado && userId) {
      carregarFocos(userId)
      handleCarregarPerfil(userId).then((perfil) => {
        setPapel(perfil?.papel ?? null)
        setNomeUsuario(perfil?.nome ?? '')
      })
      handleVerificarTermo().then(setTermoPendente)
    }
  }, [logado, userId])

  async function aceitarTermoPendente() {
    if (aceitandoTermo) return
    setAceitandoTermo(true)
    setErroTermo('')
    const resultado = await handleAceitarTermo()
    setAceitandoTermo(false)
    if (resultado.sucesso) {
      setTermoPendente(null)
      return
    }
    setErroTermo(resultado.mensagem)
  }

  async function carregarFocos(uid: string) {
    setCarregandoFocos(true)
    const resultado = await handleListarFocos(uid)
    if (resultado.sucesso) {
      setFocos(resultado.focos)
    }
    setCarregandoFocos(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setSidebarAberta(false)
    setTelaAtual('lista')
    setTelaAuth('inicio')
  }

  function navegar(destino: DestinoMenu) {
    setSidebarAberta(false)
    setSessaoConcluida(null)
    setTelaAtual(destino)
  }

  function contaExcluida() {
    setContaFoiExcluida(true)
    setTelaAtual('lista')
    setTelaAuth('inicio')
    setFocos([])
  }

  function encerrarSessao() {
    setEmAndamento(null)
    setRetomada(false)
    setTelaAtual('lista')
  }

  function observarSessao(concluida: SessaoConcluida) {
    setEmAndamento(null)
    setRetomada(false)
    setSessaoConcluida(concluida)
    setTelaAtual('estatisticas')
  }

  function voltarParaLista() {
    setSessaoConcluida(null)
    setTelaAtual('lista')
  }

  function abrirPaginaPublica(pagina: PaginaPublica) {
    setPaginaPublica(pagina)
    setTelaAuth('inicio')
  }

  function noSitePublico(chave: string, conteudo: ReactNode, semNavegacao = false) {
    return (
      <LayoutPublico
        chave={chave}
        paginaAtual={telaAuth === 'inicio' ? paginaPublica : null}
        semNavegacao={semNavegacao}
        onNavegar={abrirPaginaPublica}
        onEntrar={() => setTelaAuth('login')}
        onCriarConta={() => setTelaAuth('cadastro')}
      >
        {conteudo}
      </LayoutPublico>
    )
  }

  if (verificandoSessao) {
    return <p style={{ padding: '2rem' }}>Carregando...</p>
  }

  if (recuperandoSenha) {
    return noSitePublico(
      'recuperar-senha',
      <RecuperarSenha
        onConcluir={() => {
          setRecuperandoSenha(false)
          setTelaAuth('inicio')
          setTelaAtual('lista')
        }}
        onVoltar={() => {
          supabase.auth.signOut({ scope: 'local' })
          setRecuperandoSenha(false)
          setTelaAuth('login')
        }}
      />,
      true,
    )
  }

  if (!logado) {
    if (contaFoiExcluida) {
      return noSitePublico(
        'conta-excluida',
        <ContaExcluida
          onIrParaInicio={() => {
            setContaFoiExcluida(false)
            abrirPaginaPublica('inicio')
          }}
        />,
      )
    }

    if (telaAuth === 'inicio') {
      return noSitePublico(
        paginaPublica,
        <Suspense fallback={<div className="foco-carregando" />}>
          <SitePublico
            pagina={paginaPublica}
            onNavegar={abrirPaginaPublica}
            onEntrar={() => setTelaAuth('login')}
            onCriarConta={() => setTelaAuth('cadastro')}
          />
        </Suspense>,
      )
    }

    if (telaAuth === 'cadastro') {
      return noSitePublico(
        'cadastro',
        <Cadastro
          onCadastroSuccess={() => setLogado(true)}
          onVoltarParaLogin={() => setTelaAuth('login')}
          onVoltarInicio={() => abrirPaginaPublica('inicio')}
        />,
      )
    }

    if (telaAuth === 'chamadoSemLogin') {
      return noSitePublico(
        'chamado-sem-login',
        <ChamadoSemLogin
          onVoltar={() => setTelaAuth('login')}
          onRecuperarSenha={() => setRecuperandoSenha(true)}
        />,
      )
    }

    return noSitePublico(
      'login',
      <Login
        onLoginSuccess={() => setLogado(true)}
        onIrParaCadastro={() => setTelaAuth('cadastro')}
        onRecuperarSenha={() => setRecuperandoSenha(true)}
        onNaoConsigoAcessar={() => setTelaAuth('chamadoSemLogin')}
        onVoltarInicio={() => abrirPaginaPublica('inicio')}
      />,
    )
  }

  if (termoPendente) {
    return (
      <TermosModal
        aberto
        aviso={avisoDeNovaVersao(termoPendente)}
        rotuloFechar="Sair"
        erro={erroTermo}
        aceitando={aceitandoTermo}
        onAceitar={aceitarTermoPendente}
        onFechar={handleLogout}
      />
    )
  }

  const sessaoDoUsuario = emAndamento && emAndamento.usuarioId === userId ? emAndamento : null

  if (sessaoDoUsuario) {
    return (
      <TelaTimer
        sessao={sessaoDoUsuario.sessao}
        tituloFoco={sessaoDoUsuario.tituloFoco}
        porcentagemFoco={sessaoDoUsuario.porcentagemFoco}
        retomada={retomada}
        onPausar={(instante) =>
          setEmAndamento((atual) => atual && { ...atual, sessao: pausarSessao(atual.sessao, instante) })
        }
        onRetomar={(instante) => {
          prepararAlerta()
          setRetomada(false)
          setEmAndamento((atual) => atual && { ...atual, sessao: retomarSessao(atual.sessao, instante) })
        }}
        onDescartar={(textoDigitado) => {
          if (handleConfirmarDescarte(textoDigitado)) encerrarSessao()
        }}
        onRegistrar={async (textoAprendizado) => {
          const { sessao, tituloFoco } = sessaoDoUsuario
          const resultado = await handleSalvarSessao(sessao, textoAprendizado)
          if (resultado.sucesso) {
            observarSessao({ focoId: sessao.focoId, tituloFoco, minutos: sessao.duracaoMs / 60000 })
            if (userId) carregarFocos(userId)
          }
          return resultado
        }}
      />
    )
  }

  if (papel === 'admin' && userId) {
    return (
      <Suspense fallback={<p style={{ padding: '2rem' }}>Carregando o painel...</p>}>
        <PainelAdmin adminId={userId} onLogout={handleLogout} />
      </Suspense>
    )
  }

  if (telaAtual === 'conta' && userId) {
    return (
      <Suspense fallback={<p style={{ padding: '2rem' }}>Carregando sua conta...</p>}>
        <MinhaConta
          userId={userId}
          onVoltar={voltarParaLista}
          onNomeAlterado={setNomeUsuario}
          onContaExcluida={contaExcluida}
        />
      </Suspense>
    )
  }

  if (telaAtual === 'suporte' && userId) {
    return (
      <Suspense fallback={<p style={{ padding: '2rem' }}>Carregando o suporte...</p>}>
        <TelaSuporte userId={userId} onVoltar={voltarParaLista} />
      </Suspense>
    )
  }

  if (telaAtual === 'sobre') {
    return (
      <main className="foco-pagina-interna">
        <div className="foco-container foco-pagina-interna__topo">
          <button type="button" className="btn btn-outline-light btn-sm" onClick={voltarParaLista}>
            ← Voltar
          </button>
          <span className="foco-pagina-interna__marca">F.O.C.O.</span>
        </div>
        <Suspense fallback={<p className="foco-container">Carregando...</p>}>
          <Sobre avisoDoPrototipo />
        </Suspense>
        <BotaoSuporte onAbrir={() => navegar('suporte')} />
      </main>
    )
  }

  if (telaAtual === 'preparacao' && focoSelecionado && userId) {
    return (
      <TelaPreparacao
        tituloFoco={focoSelecionado.titulo}
        onVoltar={() => setTelaAtual('lista')}
        onIniciar={(minutos) => {
          prepararAlerta()
          setRetomada(false)
          setEmAndamento({
            usuarioId: userId,
            sessao: iniciarSessao(focoSelecionado.id, minutos, Date.now()),
            tituloFoco: focoSelecionado.titulo,
            porcentagemFoco: focoSelecionado.porcentagem,
          })
        }}
      />
    )
  }

  if (telaAtual === 'estatisticas' && userId) {
    return (
      <Suspense fallback={<p style={{ padding: '2rem' }}>Carregando suas estatísticas...</p>}>
        <TelaEstatisticas
          userId={userId}
          focos={focos}
          sessaoConcluida={sessaoConcluida}
          onVoltar={voltarParaLista}
        />
      </Suspense>
    )
  }

  return (
    <div className="foco-area">
      <header className="foco-topo-app">
        <button
          type="button"
          className="foco-topo-app__botao foco-topo-app__botao--perfil"
          onClick={() => setSidebarAberta(true)}
          aria-label="Abrir o menu"
        >
          <img src="/icone-perfil.png" alt="" />
        </button>
        <h1 className="foco-topo-app__titulo">F.O.C.O.</h1>
        {telaAtual === 'lista' ? (
          <button
            type="button"
            className="foco-topo-app__botao foco-topo-app__botao--novo"
            onClick={() => setTelaAtual('novoFoco')}
            aria-label="Novo Foco"
          >
            +
          </button>
        ) : (
          <span />
        )}
      </header>

      <Sidebar
        aberta={sidebarAberta}
        nomeUsuario={nomeUsuario}
        telaAtual={telaAtual}
        onFechar={() => setSidebarAberta(false)}
        onNavegar={navegar}
        onLogout={handleLogout}
      />

      {carregandoFocos ? (
        <p>Carregando seus Focos...</p>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          {telaAtual === 'novoFoco' ? (
            <motion.div key="novoFoco" {...TRANSICAO_DA_AREA}>
              <NovoFoco
                userId={userId!}
                onFocoCriado={() => {
                  setTelaAtual('lista')
                  carregarFocos(userId!)
                }}
                onCancelar={() => setTelaAtual('lista')}
              />
            </motion.div>
          ) : (
            <motion.div key="lista" {...TRANSICAO_DA_AREA}>
              <ListaFocos
                focos={focos}
                userId={userId!}
                onFocoAtualizado={() => carregarFocos(userId!)}
                onConcentrar={(foco) => {
                  setFocoSelecionado(foco)
                  setTelaAtual('preparacao')
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {telaAtual === 'lista' && <BotaoSuporte onAbrir={() => navegar('suporte')} />}
    </div>
  )
}

const TRANSICAO_DA_AREA = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 24 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
}

export default App
