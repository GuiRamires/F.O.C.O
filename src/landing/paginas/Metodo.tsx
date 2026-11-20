import { useState } from 'react'
import { motion } from 'motion/react'
import CabecalhoPagina from '../CabecalhoPagina'
import Reveal from '../../efeitos/Reveal'
import { PILARES } from '../../conteudo/site'
import { FRASE_REMOVER_ESTRELA, fraseRemoverEstrelaConfere, mascararFraseEstrela } from '../../services/estrelaService'

interface MetodoProps {
  onCriarConta: () => void
}

function DemonstracaoReflexiva() {
  const [frase, setFrase] = useState('')
  const [concluida, setConcluida] = useState(false)
  const confere = fraseRemoverEstrelaConfere(frase)

  return (
    <section className="foco-container foco-reflexao">
      <Reveal className="foco-reflexao__caixa">
        <div>
          <p className="foco-rotulo">Confirmação reflexiva</p>
          <h2 className="foco-titulo-bloco">Decisões importantes pedem uma pausa.</h2>
          <p className="foco-lead">
            Tirar a Estrela Dourada de um Foco não é um clique. Primeiro o F.O.C.O lembra que aquele Foco já foi a sua
            prioridade. Se você seguir, precisa digitar uma frase. A pequena fricção faz você{' '}
            <strong>pensar antes de decidir</strong>.
          </p>
        </div>

        <div className="foco-reflexao__demo">
          <p className="foco-reflexao__instrucao">Experimente. Digite:</p>
          <p className="foco-reflexao__frase">{FRASE_REMOVER_ESTRELA}</p>
          <input
            value={frase}
            onChange={(evento) => {
              setConcluida(false)
              setFrase(mascararFraseEstrela(evento.target.value))
            }}
            onPaste={(evento) => evento.preventDefault()}
            onDrop={(evento) => evento.preventDefault()}
            maxLength={FRASE_REMOVER_ESTRELA.length}
            placeholder="Digite a frase acima"
            aria-label="Frase de confirmação"
            autoComplete="off"
            spellCheck={false}
          />
          <button type="button" className="foco-reflexao__botao" disabled={!confere} onClick={() => setConcluida(true)}>
            Remover a Estrela
          </button>
          {concluida && (
            <motion.p className="foco-reflexao__ok" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              Pronto. No sistema, o Foco desceria para a 4ª posição e a Estrela ficaria livre.
            </motion.p>
          )}
        </div>
      </Reveal>
    </section>
  )
}

function Metodo({ onCriarConta }: MetodoProps) {
  return (
    <>
      <CabecalhoPagina
        rotulo="O método"
        titulo="Quatro pilares. Um jeito de estudar."
        texto="F.O.C.O é a sigla de Filtrar, Organizar, Concentrar e Observar. Você filtra o que importa, organiza a pilha de prioridades, se concentra em uma sessão de cada vez e observa o que mudou."
      />

      <section className="foco-container foco-metodo">
        {PILARES.map((pilar, i) => (
          <motion.article
            key={pilar.palavra}
            className="foco-metodo__card"
            style={{ ['--cor-pilar' as string]: pilar.cor }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            whileHover={{ y: -6 }}
          >
            <span className="foco-metodo__letra">{pilar.letra}</span>
            <h3>{pilar.palavra}</h3>
            <p className="foco-metodo__titulo">{pilar.titulo}</p>
            <p>{pilar.texto}</p>
            <ul>
              {pilar.detalhes.map((detalhe) => (
                <li key={detalhe.titulo}>
                  <strong>{detalhe.titulo}:</strong> {detalhe.linhas[0]}
                </li>
              ))}
            </ul>
          </motion.article>
        ))}
      </section>

      <section className="foco-container foco-dividido">
        <Reveal>
          <p className="foco-rotulo">A base científica</p>
          <h2 className="foco-titulo-bloco">Metacognição: pensar sobre como você aprende.</h2>
        </Reveal>
        <Reveal atraso={0.1}>
          <p className="foco-lead">
            Flavell (1979) chama de metacognição o conhecimento que temos sobre os nossos próprios processos de pensamento. E
            Kahneman (2012) mostra que decisões como trocar de prioridade ou desistir costumam ser tomadas{' '}
            <strong>no impulso</strong>. Por isso, o F.O.C.O foi desenhado para levar você ao{' '}
            <strong>pensamento deliberado</strong> justamente nesses momentos.
          </p>
        </Reveal>
      </section>

      <DemonstracaoReflexiva />

      <section className="foco-container foco-destaque-final">
        <Reveal>
          <h2 className="foco-titulo-bloco">Incentivo, não punição.</h2>
          <p className="foco-lead">
            Nada de ícones vermelhos ou avisos de "não concluído". Um Foco que ficou parado vai para o
            <strong> Laboratório de Sonhos</strong> com todas as horas e o histórico preservados. Para voltar, é só resgatar e
            fazer uma sessão: o retorno é demonstrado na prática, não só declarado.
          </p>
          <button type="button" className="btn btn-primary foco-destaque-final__botao" onClick={onCriarConta}>
            Criar conta
          </button>
        </Reveal>
      </section>
    </>
  )
}

export default Metodo
