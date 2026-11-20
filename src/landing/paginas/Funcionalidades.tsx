import { motion } from 'motion/react'
import CabecalhoPagina from '../CabecalhoPagina'
import { DESTAQUES } from '../../conteudo/site'
import { VisualDeDestaque } from '../Visuais'

function moverBrilho(evento: React.MouseEvent<HTMLElement>) {
  const caixa = evento.currentTarget.getBoundingClientRect()
  evento.currentTarget.style.setProperty('--mx', `${evento.clientX - caixa.left}px`)
  evento.currentTarget.style.setProperty('--my', `${evento.clientY - caixa.top}px`)
}

function Funcionalidades() {
  return (
    <>
      <CabecalhoPagina
        rotulo="Funcionalidades"
        titulo="Tudo o que você precisa. Nada que distraia."
        texto="Seis recursos pensados para a jornada do aluno, do primeiro Foco criado até o gráfico da semana."
      />

      <section className="foco-container foco-bento">
        {DESTAQUES.map((destaque, i) => (
          <motion.article
            key={destaque.id}
            className={`foco-bento__card foco-bento__card--${i}`}
            style={{ ['--tom' as string]: destaque.tom }}
            onMouseMove={moverBrilho}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: (i % 3) * 0.08, duration: 0.6 }}
          >
            <div className="foco-bento__texto">
              <h3>{destaque.titulo}</h3>
              <p>{destaque.texto}</p>
            </div>
            <div className="foco-bento__visual">
              <VisualDeDestaque id={destaque.id} tamanhoDoTimer={200} />
            </div>
          </motion.article>
        ))}
      </section>
    </>
  )
}

export default Funcionalidades
