import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Login from './Login'
import Cadastro from './Cadastro'
import ListaFocos from './ListaFocos'
import NovoFoco from './NovoFoco'
import { handleListarFocos } from './controllers/focoController'
import { handleConfirmarDescarte, handleRestaurarSessao, handleSalvarSessao } from './controllers/sessaoController'
import type { FocoComProgresso } from './services/focoService'
import Sidebar from './Sidebar'
import { getPapelUsuario } from './repositories/focoRepository'
import PainelAdmin from './PainelAdmin'
import TelaPreparacao from './TelaPreparacao'
import TelaTimer from './TelaTimer'
import { iniciarSessao, pausarSessao, retomarSessao, type SessaoEmAndamento } from './services/sessaoService'
import { prepararAlerta } from './utils/alertaSonoro'
import { usePersistirSessao } from './hooks/usePersistirSessao'

function App() {
  const [logado, setLogado] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [verificandoSessao, setVerificandoSessao] = useState(true)
  const [telaAuth, setTelaAuth] = useState<'login' | 'cadastro'>('login')

  const [focos, setFocos] = useState<FocoComProgresso[]>([])
  const [carregandoFocos, setCarregandoFocos] = useState(false)
  const [telaAtual, setTelaAtual] = useState<'lista' | 'novoFoco' | 'preparacao'>('lista')
  const [focoSelecionado, setFocoSelecionado] = useState<FocoComProgresso | null>(null)
  const [sidebarAberta, setSidebarAberta] = useState(false)
  const [emAndamento, setEmAndamento] = useState<SessaoEmAndamento | null>(() => handleRestaurarSessao())
  const [retomada, setRetomada] = useState(emAndamento !== null)

  const [papel, setPapel] = useState<string | null>(null)

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
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (logado && userId) {
      carregarFocos(userId)
      getPapelUsuario(userId).then(setPapel)
    }
  }, [logado, userId])

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
    setTelaAtual('lista')
  }

  function encerrarSessao() {
    setEmAndamento(null)
    setRetomada(false)
    setTelaAtual('lista')
  }

  if (verificandoSessao) {
    return <p style={{ padding: '2rem' }}>Carregando...</p>
  }

  if (!logado) {
    if (telaAuth === 'cadastro') {
      return (
        <Cadastro
          onCadastroSuccess={() => setLogado(true)}
          onVoltarParaLogin={() => setTelaAuth('login')}
        />
      )
    }

    return (
      <Login
        onLoginSuccess={() => setLogado(true)}
        onIrParaCadastro={() => setTelaAuth('cadastro')}
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
          const resultado = await handleSalvarSessao(sessaoDoUsuario.sessao, textoAprendizado)
          if (resultado.sucesso) {
            encerrarSessao()
            if (userId) carregarFocos(userId)
          }
          return resultado
        }}
      />
    )
  }

  if (papel === 'admin') {
    return <PainelAdmin onLogout={handleLogout} />
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

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setSidebarAberta(true)}
          style={{ background: 'none', border: '1px solid #444', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '1.2rem' }}
        >
          👤
        </button>
        <h1 style={{ fontSize: '1.5rem' }}>F.O.C.O.</h1>
        {telaAtual === 'lista' && (
          <button className="btn btn-primary" onClick={() => setTelaAtual('novoFoco')}>
            +
          </button>
        )}
      </div>

      <Sidebar
        aberta={sidebarAberta}
        onFechar={() => setSidebarAberta(false)}
        onLogout={handleLogout}
      />

      {carregandoFocos ? (
        <p>Carregando seus Focos...</p>
      ) : telaAtual === 'novoFoco' ? (
        <NovoFoco
          userId={userId!}
          onFocoCriado={() => {
            setTelaAtual('lista')
            carregarFocos(userId!)
          }}
          onCancelar={() => setTelaAtual('lista')}
        />
      ) : (
        <ListaFocos
          focos={focos}
          userId={userId!}
          onFocoAtualizado={() => carregarFocos(userId!)}
          onConcentrar={(foco) => {
            setFocoSelecionado(foco)
            setTelaAtual('preparacao')
          }}
        />
      )}
    </div>
  )
}

export default App