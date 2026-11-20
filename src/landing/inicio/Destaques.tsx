import { useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { DESTAQUES } from '../../conteudo/site'
import { VisualDeDestaque, VisualTimer } from '../Visuais'
import JanelaModal from '../../components/JanelaModal'
import VideoQuadro from '../VideoQuadro'

const DURACAO_DO_SLIDE_MS = 5000

function Destaques() {
  const [indice, setIndice] = useState(0)
  const reduzirMovimento = useReducedMotion()
  const [tocando, setTocando] = useState(!reduzirMovimento)
  const [videoAberto, setVideoAberto] = useState(false)
  const inicioDoArraste = useRef<number | null>(null)

  const irPara = (i: number) => setIndice((i + DESTAQUES.length) % DESTAQUES.length)

  const aoPressionar = (evento: React.PointerEvent) => {
    inicioDoArraste.current = evento.clientX
  }

  const aoSoltar = (evento: React.PointerEvent) => {
    if (inicioDoArraste.current === null) return
    const distancia = evento.clientX - inicioDoArraste.current
    if (Math.abs(distancia) > 50) irPara(indice + (distancia < 0 ? 1 : -1))
    inicioDoArraste.current = null
  }

  return (
    <section className="foco-destaques" id="destaques">
      <div className="foco-container foco-destaques__topo">
        <h2 className="foco-titulo-secao">Comece pelos destaques.</h2>
        <button type="button" className="foco-link-seta" onClick={() => setVideoAberto(true)}>
          Assistir ao vídeo <span className="foco-destaques__play">▶</span>
        </button>
      </div>

      <div className="foco-destaques__janela" onPointerDown={aoPressionar} onPointerUp={aoSoltar}>
        <div className="foco-destaques__trilho" style={{ ['--indice' as string]: indice }}>
          {DESTAQUES.map((destaque, i) => (
            <article
              key={destaque.id}
              className={`foco-destaques__slide ${i === indice ? 'foco-destaques__slide--ativo' : ''}`}
              style={{ ['--tom' as string]: destaque.tom }}
              onClick={() => i !== indice && irPara(i)}
              aria-hidden={i !== indice}
            >
              <p className="foco-destaques__texto">
                <strong>{destaque.titulo}.</strong> {destaque.texto}
              </p>
              <div className="foco-destaques__visual">
                <AnimatePresence mode="wait">
                  {i === indice && (
                    <motion.div
                      key={`visual-${indice}`}
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <VisualDeDestaque id={destaque.id} />
                    </motion.div>
                  )}
                </AnimatePresence>
                {i !== indice && (
                  <div className="foco-destaques__fantasma">
                    <VisualDeDestaque id={destaque.id} />
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="foco-destaques__controles">
        <div className="foco-destaques__pontos" role="tablist" aria-label="Destaques">
          {DESTAQUES.map((destaque, i) => (
            <button
              key={destaque.id}
              type="button"
              role="tab"
              aria-selected={i === indice}
              aria-label={destaque.titulo}
              className={`foco-destaques__ponto ${i === indice ? 'foco-destaques__ponto--ativo' : ''}`}
              onClick={() => irPara(i)}
            >
              {i === indice && (
                <span
                  key={indice}
                  className="foco-destaques__progresso"
                  style={{ animationDuration: `${DURACAO_DO_SLIDE_MS}ms`, animationPlayState: tocando ? 'running' : 'paused' }}
                  onAnimationEnd={() => irPara(indice + 1)}
                />
              )}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="foco-destaques__pausa"
          onClick={() => setTocando((atual) => !atual)}
          aria-label={tocando ? 'Pausar' : 'Reproduzir'}
        >
          {tocando ? '❚❚' : '▶'}
        </button>
      </div>

      <JanelaModal aberto={videoAberto} titulo="Vídeo de demonstração" onFechar={() => setVideoAberto(false)} largura="video">
        <VideoQuadro
          src="/videos/foco-demo.mp4"
          controles
          reserva={
            <div className="foco-video-reserva">
              <VisualTimer aoVivo tamanho={240} />
              <p>O vídeo de demonstração do F.O.C.O entra aqui.</p>
            </div>
          }
        />
      </JanelaModal>
    </section>
  )
}

export default Destaques
