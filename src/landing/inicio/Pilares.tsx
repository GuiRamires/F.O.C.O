import { motion } from 'motion/react'
import ScrollRevealText from '../../efeitos/ScrollRevealText'
import Reveal from '../../efeitos/Reveal'
import { PILARES } from '../../conteudo/site'

function Pilares() {
  return (
    <section className="foco-pilares">
      {PILARES.map((pilar, i) => (
        <article key={pilar.palavra} className="foco-pilar" style={{ ['--cor-pilar' as string]: pilar.cor }}>
          <div className="foco-container foco-pilar__conteudo">
            <motion.div
              className="foco-pilar__letra"
              initial={{ opacity: 0, scale: 0.7, filter: 'blur(20px)' }}
              whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden="true"
            >
              {pilar.letra}
              <span className="foco-pilar__indice">0{i + 1}</span>
            </motion.div>

            <p className="foco-rotulo">{pilar.rotulo}</p>
            <ScrollRevealText className="foco-titulo-secao foco-pilar__titulo" texto={pilar.titulo} />

            <Reveal>
              <p className="foco-lead foco-pilar__texto">{pilar.texto}</p>
            </Reveal>

            <Reveal className="foco-pilar__grade" atraso={0.1}>
              <div className="foco-pilar__numeros">
                {pilar.numeros.map((numero) => (
                  <div key={numero.legenda}>
                    <strong>{numero.valor}</strong>
                    <small>{numero.legenda}</small>
                  </div>
                ))}
              </div>
              <div className="foco-pilar__detalhes">
                {pilar.detalhes.map((detalhe) => (
                  <div key={detalhe.titulo}>
                    <h4>{detalhe.titulo}</h4>
                    {detalhe.linhas.map((linha) => (
                      <p key={linha}>{linha}</p>
                    ))}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </article>
      ))}
    </section>
  )
}

export default Pilares
