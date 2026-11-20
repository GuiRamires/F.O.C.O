import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import TrueFocus from '../../efeitos/TrueFocus'
import { PILARES } from '../../conteudo/site'

interface AberturaProps {
  onCriarConta: () => void
}

function Abertura({ onCriarConta }: AberturaProps) {
  const [ativo, setAtivo] = useState(0)
  const trocarPilar = useCallback((indice: number) => setAtivo(indice), [])
  const pilar = PILARES[ativo]

  return (
    <section className="foco-abertura">
      <motion.div
        className="foco-abertura__brilho"
        animate={{ background: `radial-gradient(circle at 50% 45%, ${pilar.cor}33, transparent 60%)` }}
        transition={{ duration: 0.8 }}
      />

      <div className="foco-abertura__palco">
        <TrueFocus letras={PILARES.map((p) => p.letra)} cores={PILARES.map((p) => p.cor)} onTrocar={trocarPilar} />

        <div className="foco-abertura__palavra" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.span
              key={pilar.palavra}
              style={{ color: pilar.cor }}
              initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(8px)' }}
              transition={{ duration: 0.35 }}
            >
              {pilar.palavra}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <div className="foco-container foco-abertura__base">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }}>
          <p className="foco-abertura__nome">F.O.C.O</p>
          <h1 className="foco-abertura__titulo">Estude com foco.</h1>
        </motion.div>

        <motion.div
          className="foco-abertura__chamada"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <span>
            <strong>Comece agora</strong>
            <small>Plataforma de gestão de estudos</small>
          </span>
          <button type="button" className="btn btn-primary" onClick={onCriarConta}>
            Criar conta
          </button>
        </motion.div>
      </div>
    </section>
  )
}

export default Abertura
