import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { FocoComProgresso } from './services/focoService'
import { montarPainel, type Aprendizado, type SessaoComFoco } from './services/estatisticasService'
import { handleCarregarSessoes } from './controllers/estatisticasController'
import { descreverMinutos } from './utils/formatarHoras'
import { GraficoSemanas, MapaConstancia, RankingFocos } from './GraficosEstatisticas'
import './styles/estatisticas.css'

export interface SessaoConcluida {
  focoId: string
  tituloFoco: string
  minutos: number
}

interface TelaEstatisticasProps {
  userId: string
  focos: FocoComProgresso[]
  sessaoConcluida?: SessaoConcluida | null
  onVoltar: () => void
}

function TelaEstatisticas({ userId, focos, sessaoConcluida = null, onVoltar }: TelaEstatisticasProps) {
  const [sessoes, setSessoes] = useState<SessaoComFoco[] | null>(null)
  const [erro, setErro] = useState('')
  const [tentativa, setTentativa] = useState(0)
  const [focoId, setFocoId] = useState(sessaoConcluida?.focoId ?? '')
  const [agora] = useState(() => new Date())

  useEffect(() => {
    let ativo = true
    handleCarregarSessoes(userId).then((resultado) => {
      if (!ativo) return
      if (resultado.sucesso) {
        setSessoes(resultado.sessoes)
        setErro('')
      } else {
        setErro(resultado.mensagem)
      }
    })
    return () => {
      ativo = false
    }
  }, [userId, tentativa])

  return (
    <main className="observar">
      <header className="observar__topo">
        <button type="button" className="observar__voltar" onClick={onVoltar}>
          <span aria-hidden="true">←</span> Voltar
        </button>
        <span className="observar__marca">F.O.C.O.</span>
      </header>

      <div className="observar__cabecalho">
        <h1 className="observar__titulo">Observar</h1>
        <p className="observar__subtitulo">O retrato do seu tempo de foco</p>
      </div>

      {sessaoConcluida && <AvisoSessaoConcluida sessao={sessaoConcluida} />}

      {erro ? (
        <div className="observar__erro" role="alert">
          <p>{erro}</p>
          <button type="button" className="observar__botao" onClick={() => setTentativa((valor) => valor + 1)}>
            Tentar de novo
          </button>
        </div>
      ) : sessoes === null ? (
        <p className="observar__carregando">Carregando suas estatísticas...</p>
      ) : (
        <PainelEstatisticas sessoes={sessoes} focos={focos} focoId={focoId} onTrocarFoco={setFocoId} agora={agora} />
      )}

      <div className="observar__rodape">
        <button type="button" className="observar__botao" onClick={onVoltar}>
          Voltar aos Focos
        </button>
      </div>
    </main>
  )
}

export function AvisoSessaoConcluida({ sessao }: { sessao: SessaoConcluida }) {
  return (
    <p className="observar__concluida" role="status">
      <span className="observar__concluida-marca" aria-hidden="true">
        ✓
      </span>
      <span>
        Sessão concluída: <strong>{descreverMinutos(sessao.minutos)}</strong> de foco em{' '}
        <strong>{sessao.tituloFoco}</strong>. Veja abaixo como ela entrou no seu histórico.
      </span>
    </p>
  )
}

interface PainelEstatisticasProps {
  sessoes: SessaoComFoco[]
  focos: FocoComProgresso[]
  focoId: string
  onTrocarFoco: (focoId: string) => void
  agora: Date
}

export function PainelEstatisticas({ sessoes, focos, focoId, onTrocarFoco, agora }: PainelEstatisticasProps) {
  const painel = useMemo(() => montarPainel(sessoes, focoId || null, agora), [sessoes, focoId, agora])
  const focoSelecionado = focos.find((foco) => foco.id === focoId) ?? null
  const { estatisticas, constancia, aprendizados } = painel
  const semSessoes = estatisticas.totalSessoes === 0

  return (
    <>
      <div className="observar__filtros">
        <label className="observar__filtro">
          <span>Mostrar</span>
          <select value={focoId} onChange={(evento) => onTrocarFoco(evento.target.value)}>
            <option value="">Todos os Focos</option>
            {focos.map((foco) => (
              <option key={foco.id} value={foco.id}>
                {foco.tem_estrela ? '★ ' : ''}
                {foco.titulo}
                {foco.status === 'laboratorio_sonhos' ? ' (Laboratório)' : ''}
              </option>
            ))}
          </select>
        </label>
      </div>

      {focoSelecionado && <CartaoFoco foco={focoSelecionado} />}

      <section className="observar__numeros" aria-label="Resumo">
        <div className="observar__destaque">
          <span className="observar__rotulo">Tempo total de foco</span>
          <TempoEmDestaque minutos={estatisticas.totalMinutos} />
          <span className="observar__detalhe">
            {estatisticas.totalSessoes > 0
              ? `média de ${descreverMinutos(estatisticas.mediaMinutosPorSessao)} por sessão`
              : 'nenhuma sessão concluída ainda'}
          </span>
        </div>
        <Numero rotulo="Sessões concluídas" valor={String(estatisticas.totalSessoes)} variante="concluido" />
        <Numero rotulo="Nesta semana" valor={descreverMinutos(estatisticas.minutosNaSemanaAtual)} />
        <Numero
          rotulo="Sequência atual"
          valor={`${constancia.sequenciaAtual} ${constancia.sequenciaAtual === 1 ? 'dia' : 'dias'}`}
          detalhe={`recorde: ${constancia.maiorSequencia} ${constancia.maiorSequencia === 1 ? 'dia' : 'dias'}`}
        />
      </section>

      {semSessoes && (
        <p className="observar__orientacao">
          {focoSelecionado
            ? 'Este Foco ainda não tem sessões concluídas. Abra o menu do card e toque em Concentrar para começar.'
            : 'Você ainda não concluiu nenhuma sessão. Escolha um Foco, toque em Concentrar e seus números aparecem aqui.'}
        </p>
      )}

      <div className="observar__grade">
        <Cartao titulo="Tempo por semana" subtitulo="Soma das sessões de cada semana, de segunda a domingo">
          <GraficoSemanas dados={estatisticas.porSemana} />
        </Cartao>

        <Cartao titulo="Constância" subtitulo="Cada coluna é uma semana, e cada quadrado, um dia">
          <MapaConstancia constancia={constancia} />
        </Cartao>

        {!focoSelecionado && (
          <Cartao titulo="Tempo por Foco" subtitulo="Do que você mais praticou para o que menos praticou" largo>
            <RankingFocos dados={estatisticas.porFoco} focos={focos} />
          </Cartao>
        )}

        <Cartao titulo="O que você aprendeu" subtitulo="Seus registros mais recentes" largo>
          <ListaAprendizados itens={aprendizados} />
        </Cartao>
      </div>
    </>
  )
}

function TempoEmDestaque({ minutos }: { minutos: number }) {
  const horas = Math.floor(minutos / 60)
  const resto = Math.floor(minutos % 60)

  return (
    <strong className="observar__valor-destaque">
      {horas}
      <span className="observar__unidade">h</span>
      {resto > 0 && (
        <>
          {' '}
          {resto}
          <span className="observar__unidade">min</span>
        </>
      )}
    </strong>
  )
}

function Numero({
  rotulo,
  valor,
  detalhe,
  variante,
}: {
  rotulo: string
  valor: string
  detalhe?: string
  variante?: 'concluido'
}) {
  return (
    <div className={`observar__numero${variante ? ` observar__numero--${variante}` : ''}`}>
      <span className="observar__rotulo">{rotulo}</span>
      <strong className="observar__valor">{valor}</strong>
      {detalhe && <span className="observar__detalhe">{detalhe}</span>}
    </div>
  )
}

function Cartao({
  titulo,
  subtitulo,
  largo = false,
  children,
}: {
  titulo: string
  subtitulo: string
  largo?: boolean
  children: ReactNode
}) {
  return (
    <section className={`observar__cartao${largo ? ' observar__cartao--largo' : ''}`}>
      <h2 className="observar__cartao-titulo">{titulo}</h2>
      <p className="observar__cartao-subtitulo">{subtitulo}</p>
      {children}
    </section>
  )
}

function CartaoFoco({ foco }: { foco: FocoComProgresso }) {
  const porcentagem = Math.floor(foco.porcentagem)
  const minutos = Math.round(foco.horasAcumuladas * 60)

  return (
    <section className={`observar__foco${foco.tem_estrela ? ' observar__foco--estrela' : ''}`} aria-label="Foco escolhido">
      <div className="observar__foco-topo">
        <h2 className="observar__foco-titulo">{foco.titulo}</h2>
        {foco.tem_estrela && <span className="observar__selo observar__selo--estrela">★ Estrela Dourada</span>}
        {foco.status === 'laboratorio_sonhos' && <span className="observar__selo">Laboratório de Sonhos</span>}
      </div>
      <div
        className="observar__progresso"
        role="progressbar"
        aria-label={`Progresso da meta de ${foco.titulo}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={porcentagem}
      >
        <div className="observar__progresso-preenchido" style={{ width: `${porcentagem}%` }} />
      </div>
      <div className="observar__foco-base">
        <span>
          {descreverMinutos(minutos)}
          {foco.meta_horas > 0 ? ` de ${foco.meta_horas} h` : ''}
        </span>
        <strong>{foco.meta_horas > 0 ? `${porcentagem}% da meta` : 'Sem meta definida'}</strong>
      </div>
    </section>
  )
}

function ListaAprendizados({ itens }: { itens: Aprendizado[] }) {
  if (itens.length === 0) {
    return (
      <p className="observar__nada">
        Os seus registros aparecem aqui quando você responde "O que você aprendeu?" ao fim de uma sessão.
      </p>
    )
  }

  return (
    <ul className="aprendizados">
      {itens.map((item) => (
        <li key={item.id} className="aprendizados__item">
          <p className="aprendizados__meta">
            <span>{item.rotuloData}</span>
            <span>{item.tituloFoco}</span>
            <span>{descreverMinutos(item.minutos)}</span>
          </p>
          <p className="aprendizados__texto">{item.texto}</p>
        </li>
      ))}
    </ul>
  )
}

export default TelaEstatisticas
