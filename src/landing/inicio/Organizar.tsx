import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Reveal from '../../efeitos/Reveal'
import { CORES_DOS_FOCOS } from '../../conteudo/site'
import { PreviaDoApp } from '../Visuais'

const OPCOES = [
  { id: 'cores', rotulo: 'Cores dos Focos', texto: 'Escolha a cor de cada Foco. Ela aparece enquanto ele estiver no Top 3.' },
  { id: 'top3', rotulo: 'Top 3', texto: 'As três primeiras posições ganham destaque. Do 4º Foco em diante, cor neutra.' },
  {
    id: 'estrela',
    rotulo: 'Estrela Dourada',
    texto: 'A prioridade máxima fica fixa no topo, em dourado. Só um Foco do Top 3 com 10 h ou mais de estudo pode recebê-la.',
  },
  {
    id: 'posicao',
    rotulo: 'Mudar posição',
    texto: 'Você decide a ordem da pilha escolhendo a nova posição de cada Foco. O 1º lugar fica reservado à Estrela.',
  },
  {
    id: 'laboratorio',
    rotulo: 'Laboratório de Sonhos',
    texto: 'Arquive um Foco que ficou para depois. As horas e o histórico continuam guardados.',
  },
]

const AMOSTRAS = [
  { nome: 'Azul', cor: CORES_DOS_FOCOS.azul },
  { nome: 'Roxo', cor: CORES_DOS_FOCOS.roxo },
  { nome: 'Verde', cor: CORES_DOS_FOCOS.verde },
  { nome: 'Ciano', cor: CORES_DOS_FOCOS.ciano },
  { nome: 'Rosa', cor: CORES_DOS_FOCOS.rosa },
]

function Organizar() {
  const [aberta, setAberta] = useState('cores')
  const [cor, setCor] = useState(CORES_DOS_FOCOS.roxo)

  return (
    <section className="foco-organizar">
      <div className="foco-container">
        <p className="foco-rotulo">Organizar</p>
        <h2 className="foco-titulo-secao">
          Sua pilha.
          <br />
          Suas prioridades.
        </h2>

        <Reveal className="foco-organizar__caixa">
          <ul className="foco-organizar__lista">
            {OPCOES.map((opcao) => {
              const estaAberta = aberta === opcao.id
              return (
                <motion.li
                  key={opcao.id}
                  layout
                  className={`foco-organizar__pilula ${estaAberta ? 'foco-organizar__pilula--aberta' : ''}`}
                  transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                >
                  <button
                    type="button"
                    className="foco-organizar__botao"
                    onClick={() => setAberta(opcao.id)}
                    aria-expanded={estaAberta}
                  >
                    <motion.span className="foco-organizar__icone" layout>
                      {estaAberta ? '–' : '+'}
                    </motion.span>
                    <motion.span layout>{opcao.rotulo}</motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {estaAberta && (
                      <motion.div
                        className="foco-organizar__corpo"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <p>{opcao.texto}</p>
                        {opcao.id === 'cores' && (
                          <div className="foco-organizar__amostras">
                            {AMOSTRAS.map((amostra) => (
                              <button
                                key={amostra.cor}
                                type="button"
                                style={{ background: amostra.cor }}
                                className={cor === amostra.cor ? 'foco-organizar__amostra--ativa' : ''}
                                onClick={() => setCor(amostra.cor)}
                                aria-label={amostra.nome}
                                title={amostra.nome}
                              />
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              )
            })}
          </ul>

          <div className="foco-organizar__previa">
            <PreviaDoApp destaque={cor} foco={aberta} />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default Organizar
