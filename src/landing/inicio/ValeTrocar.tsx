import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import CountUp from '../../efeitos/CountUp'
import Reveal from '../../efeitos/Reveal'
import { OPCOES_DE_COMPARACAO, RECURSOS_COMPARADOS, type MetodoAtual } from '../../conteudo/site'

interface ValeTrocarProps {
  onEntrar: () => void
  onCriarConta: () => void
}

function ValeTrocar({ onEntrar, onCriarConta }: ValeTrocarProps) {
  const [metodo, setMetodo] = useState<MetodoAtual>('caderno')
  const rotulo = OPCOES_DE_COMPARACAO.find((opcao) => opcao.id === metodo)?.rotulo ?? ''

  return (
    <section className="foco-comparar">
      <Reveal className="foco-container foco-comparar__caixa">
        <div className="foco-comparar__topo">
          <h2 className="foco-comparar__titulo">
            Vale trocar?
            <br />
            Pode apostar.
          </h2>
          <label className="foco-comparar__seletor">
            <span>Como você estuda hoje?</span>
            <select value={metodo} onChange={(evento) => setMetodo(evento.target.value as MetodoAtual)}>
              {OPCOES_DE_COMPARACAO.map((opcao) => (
                <option key={opcao.id} value={opcao.id}>
                  {opcao.rotulo}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="foco-comparar__subtitulo">
          O que o <span className="foco-gradiente-2">F.O.C.O</span> oferece:
        </p>

        <div className="foco-comparar__grade">
          {RECURSOS_COMPARADOS.map((recurso) => {
            const temRecurso = recurso.tem[metodo]
            return (
              <motion.div
                key={recurso.id}
                className="foco-comparar__card"
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {recurso.numero ? (
                  <strong className="foco-comparar__numero">
                    <CountUp ate={recurso.numero.valor} sufixo={recurso.numero.sufixo} />
                  </strong>
                ) : (
                  <span className="foco-comparar__icone">✓</span>
                )}
                <p className="foco-comparar__nome">{recurso.titulo}</p>
                <small>{recurso.legenda}</small>

                <AnimatePresence mode="wait">
                  <motion.span
                    key={metodo}
                    className={`foco-comparar__selo ${temRecurso ? 'foco-comparar__selo--tem' : ''}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    {rotulo}: {temRecurso ? 'também tem' : 'não tem'}
                  </motion.span>
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </Reveal>

      <div className="foco-container foco-chamada-final">
        <h2 className="foco-titulo-secao foco-centro">Pronto para focar?</h2>
        <p className="foco-lead foco-centro">Crie sua conta grátis e cadastre o seu primeiro Foco.</p>
        <div className="foco-chamada-final__acoes">
          <button type="button" className="btn btn-primary" onClick={onCriarConta}>
            Criar conta
          </button>
          <button type="button" className="btn btn-outline-light" onClick={onEntrar}>
            Já tenho conta
          </button>
        </div>
      </div>
    </section>
  )
}

export default ValeTrocar
