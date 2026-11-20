import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { CORES_DOS_FOCOS, type VisualDoDestaque } from '../conteudo/site'

interface FocoDeExemplo {
  nome: string
  horas: number
  meta: number
  cor: string
  estrela?: boolean
}

const FOCOS_DE_EXEMPLO: FocoDeExemplo[] = [
  { nome: 'React + TypeScript', horas: 52, meta: 168, cor: CORES_DOS_FOCOS.dourado, estrela: true },
  { nome: 'Inglês para TI', horas: 31, meta: 168, cor: CORES_DOS_FOCOS.roxo },
  { nome: 'Banco de Dados', horas: 9, meta: 168, cor: CORES_DOS_FOCOS.verde },
  { nome: 'Figma', horas: 4, meta: 168, cor: CORES_DOS_FOCOS.neutro },
  { nome: 'Japonês', horas: 2, meta: 336, cor: CORES_DOS_FOCOS.neutro },
]

function progressoDe(foco: { horas: number; meta: number }): number {
  return Math.min(100, Math.floor((foco.horas / foco.meta) * 100))
}

export function CardFocoExemplo({ nome, horas, meta, cor, estrela, compacto }: FocoDeExemplo & { compacto?: boolean }) {
  const progresso = progressoDe({ horas, meta })
  return (
    <div
      className={`foco-exemplo ${estrela ? 'foco-exemplo--estrela' : ''} ${compacto ? 'foco-exemplo--compacto' : ''}`}
      style={{ ['--cor-exemplo' as string]: estrela ? CORES_DOS_FOCOS.dourado : cor }}
    >
      <div className="foco-exemplo__topo">
        <strong>{nome}</strong>
        {estrela && (
          <span className="foco-exemplo__estrela" title="Estrela Dourada">
            ★
          </span>
        )}
      </div>
      <div className="foco-exemplo__barra">
        <span style={{ width: `${Math.max(progresso, 2)}%` }} />
      </div>
      <small>
        {horas} h de {meta} h · {progresso}%
      </small>
    </div>
  )
}

export function VisualFocos() {
  return (
    <div className="foco-v-pilha">
      {FOCOS_DE_EXEMPLO.slice(0, 3).map((foco, i) => (
        <motion.div
          key={foco.nome}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 * i, duration: 0.6 }}
        >
          <CardFocoExemplo {...foco} />
        </motion.div>
      ))}
    </div>
  )
}

export function VisualTop3() {
  return (
    <div className="foco-v-top3">
      {FOCOS_DE_EXEMPLO.slice(0, 4).map((foco, i) => (
        <motion.div
          key={foco.nome}
          className={`foco-v-top3__item ${i === 3 ? 'foco-v-top3__item--neutro' : ''}`}
          style={{ ['--cor-exemplo' as string]: foco.cor }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.12 * i, type: 'spring' }}
        >
          <span className="foco-v-top3__numero">{i + 1}</span>
          <span>{foco.nome}</span>
          {foco.estrela && <span className="foco-exemplo__estrela">★</span>}
        </motion.div>
      ))}
      <div className="foco-v-top3__resto">Do 4º Foco em diante: cor neutra</div>
    </div>
  )
}

export function VisualEstrela() {
  const reduzirMovimento = useReducedMotion()
  const condicoes = ['Está no Top 3', '12 h de estudo (mínimo de 10 h)', 'Nenhuma outra Estrela em uso']
  return (
    <div className="foco-v-estrela">
      <motion.div
        className="foco-v-estrela__brilho"
        animate={reduzirMovimento ? undefined : { scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <span className="foco-v-estrela__icone">★</span>
      <ul className="foco-v-estrela__condicoes">
        {condicoes.map((condicao, i) => (
          <motion.li
            key={condicao}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.15 }}
          >
            <span>✓</span> {condicao}
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

export function VisualTimer({ aoVivo = false, tamanho = 260 }: { aoVivo?: boolean; tamanho?: number }) {
  const reduzirMovimento = useReducedMotion()
  const total = 25 * 60
  const [restante, setRestante] = useState(total - 7 * 60 - 18)

  useEffect(() => {
    if (!aoVivo || reduzirMovimento) return
    const id = setInterval(() => setRestante((s) => (s <= 0 ? total : s - 1)), 1000)
    return () => clearInterval(id)
  }, [aoVivo, reduzirMovimento, total])

  const raio = 46
  const circunferencia = 2 * Math.PI * raio
  const minutos = String(Math.floor(restante / 60)).padStart(2, '0')
  const segundos = String(restante % 60).padStart(2, '0')

  return (
    <div className="foco-v-timer" style={{ width: tamanho, height: tamanho }}>
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={raio} className="foco-v-timer__trilha" />
        <circle
          cx="50"
          cy="50"
          r={raio}
          className="foco-v-timer__barra"
          strokeDasharray={circunferencia}
          strokeDashoffset={circunferencia * (1 - restante / total)}
        />
      </svg>
      <div className="foco-v-timer__centro">
        <span className="foco-v-timer__tempo">
          {minutos}:{segundos}
        </span>
        <span className="foco-v-timer__rotulo">React + TypeScript</span>
      </div>
    </div>
  )
}

export function VisualLaboratorio() {
  const arquivados = [
    { nome: 'Aprender piano', horas: 14, data: '02/11' },
    { nome: 'Fotografia', horas: 6, data: '18/10' },
    { nome: 'Three.js', horas: 3, data: '27/09' },
  ]
  return (
    <div className="foco-v-lab">
      {arquivados.map((foco, i) => (
        <motion.div
          key={foco.nome}
          className="foco-v-lab__card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.12 }}
        >
          <div>
            <strong>{foco.nome}</strong>
            <small>
              {foco.horas} h preservadas · arquivado em {foco.data}
            </small>
          </div>
          {i === 0 && <span className="foco-v-lab__botao">Resgatar e praticar</span>}
        </motion.div>
      ))}
    </div>
  )
}

export function VisualObservar() {
  const semanas = [35, 60, 45, 80, 55, 90]
  const dias = Array.from({ length: 84 }, (_, i) => ((i * 37) % 11) % 4)
  return (
    <div className="foco-v-obs">
      <div className="foco-v-obs__numeros">
        <div>
          <strong>12 h 40</strong>
          <small>esta semana</small>
        </div>
        <div>
          <strong>18</strong>
          <small>sessões</small>
        </div>
        <div>
          <strong>5 dias</strong>
          <small>sequência atual</small>
        </div>
      </div>
      <div className="foco-v-obs__linha">
        <div className="foco-v-obs__barras" aria-label="Tempo por semana">
          {semanas.map((altura, i) => (
            <motion.span
              key={i}
              initial={{ height: 0 }}
              whileInView={{ height: `${altura}%` }}
              transition={{ delay: i * 0.06, duration: 0.7 }}
            />
          ))}
        </div>
        <div className="foco-v-obs__mapa" aria-label="Mapa de constância">
          {dias.map((nivel, i) => (
            <span key={i} className={`foco-v-obs__dia--${nivel}`} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function PreviaDoApp({ destaque, foco }: { destaque: string; foco: string }) {
  const pilha = FOCOS_DE_EXEMPLO.map((item, i) => (i === 1 ? { ...item, cor: destaque } : item))
  const realcar = (i: number) =>
    (foco === 'estrela' && i === 0) || (foco === 'cores' && i === 1) || (foco === 'top3' && i < 3) || foco === 'posicao'

  return (
    <div className="foco-previa" style={{ ['--cor-destaque' as string]: destaque }}>
      <div className="foco-previa__barra">
        <span className="foco-previa__ponto" />
        <span className="foco-previa__ponto" />
        <span className="foco-previa__ponto" />
        <span className="foco-previa__url">seufoco.com.br</span>
      </div>
      <div className="foco-previa__corpo">
        <aside className="foco-previa__lateral">
          <strong className="foco-previa__logo">F.O.C.O</strong>
          {['Organizar', 'Concentrar', 'Observar'].map((item, n) => (
            <span key={item} className={n === 0 ? 'foco-previa__menu--ativo' : ''}>
              {item}
            </span>
          ))}
        </aside>
        <main className="foco-previa__principal">
          <span className="foco-previa__rotulo">Sua pilha de Focos</span>
          <ol className="foco-previa__pilha">
            {pilha.map((item, i) => (
              <motion.li
                key={item.nome}
                layout
                className={`foco-previa__item ${realcar(i) ? 'foco-previa__item--destaque' : ''} ${
                  i === 0 && foco === 'posicao' ? 'foco-previa__item--travado' : ''
                }`}
              >
                <span className="foco-previa__posicao">{i + 1}º</span>
                <CardFocoExemplo {...item} compacto />
              </motion.li>
            ))}
          </ol>
          <div className={`foco-previa__secao ${foco === 'laboratorio' ? 'foco-previa__secao--destaque' : ''}`}>
            <span className="foco-previa__rotulo">Laboratório de Sonhos</span>
            <p className="foco-previa__lab">Aprender piano · 14 h · arquivado em 02/11</p>
          </div>
        </main>
      </div>
    </div>
  )
}

export function VisualDeDestaque({ id, tamanhoDoTimer }: { id: VisualDoDestaque; tamanhoDoTimer?: number }) {
  if (id === 'focos') return <VisualFocos />
  if (id === 'top3') return <VisualTop3 />
  if (id === 'estrela') return <VisualEstrela />
  if (id === 'timer') return <VisualTimer tamanho={tamanhoDoTimer} />
  if (id === 'laboratorio') return <VisualLaboratorio />
  return <VisualObservar />
}
