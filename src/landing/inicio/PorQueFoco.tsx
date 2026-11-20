import { motion } from 'motion/react'
import BlurText from '../../efeitos/BlurText'
import CountUp from '../../efeitos/CountUp'
import Reveal from '../../efeitos/Reveal'
import { CORES_DOS_FOCOS } from '../../conteudo/site'
import { CardFocoExemplo } from '../Visuais'

const LEQUE = [
  { nome: 'Inglês para TI', horas: 31, meta: 168, cor: CORES_DOS_FOCOS.roxo, giro: -10, x: -150 },
  { nome: 'React + TypeScript', horas: 52, meta: 168, cor: CORES_DOS_FOCOS.dourado, giro: 0, x: 0, estrela: true },
  { nome: 'Banco de Dados', horas: 9, meta: 168, cor: CORES_DOS_FOCOS.verde, giro: 10, x: 150 },
]

function PorQueFoco() {
  return (
    <section className="foco-porque">
      <div className="foco-container foco-porque__conteudo">
        <p className="foco-rotulo">Por que usar o F.O.C.O</p>
        <BlurText como="h2" className="foco-titulo-secao foco-porque__titulo" texto="Muitos interesses. Um foco por vez." />

        <Reveal atraso={0.1}>
          <p className="foco-lead foco-porque__texto">
            O F.O.C.O é uma <strong>plataforma de gestão de estudos</strong> para quem quer aprender muita coisa e acaba não
            avançando em nenhuma. Baseado em <span className="foco-gradiente-1">psicologia cognitiva e metacognição</span>, ele
            ajuda você a<span className="foco-gradiente-2"> escolher o que estudar agora</span>, registrar cada sessão e
            <span className="foco-gradiente-3"> enxergar o próprio progresso</span>. Sem ícones vermelhos nem avisos de "não
            concluído":
            <strong> um Foco deixado de lado vai para o Laboratório de Sonhos, com todas as horas guardadas.</strong>
          </p>
        </Reveal>

        <div className="foco-porque__divisor" />

        <div className="foco-porque__numeros">
          <div>
            <small>Método com</small>
            <strong>
              <CountUp ate={4} /> pilares
            </strong>
            <small>Filtrar, Organizar, Concentrar, Observar</small>
          </div>
          <div>
            <small>Destaque para</small>
            <strong>
              <CountUp ate={3} /> Focos
            </strong>
            <small>no Top 3 da sua pilha</small>
          </div>
          <div>
            <small>Liberada com</small>
            <strong>
              <CountUp ate={10} /> h de estudo
            </strong>
            <small>a Estrela só vai para quem tem constância</small>
          </div>
        </div>

        <div className="foco-porque__leque">
          {LEQUE.map((card, i) => (
            <motion.div
              key={card.nome}
              className="foco-porque__card"
              initial={{ opacity: 0, x: 0, rotate: 0, y: 60 }}
              whileInView={{ opacity: 1, x: card.x, rotate: card.giro, y: i === 1 ? -20 : 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.1 * i }}
              style={{ zIndex: i === 1 ? 2 : 1 }}
            >
              <CardFocoExemplo nome={card.nome} horas={card.horas} meta={card.meta} cor={card.cor} estrela={card.estrela} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PorQueFoco
