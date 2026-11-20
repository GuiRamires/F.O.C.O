import { motion } from 'motion/react'
import CabecalhoPagina from '../CabecalhoPagina'
import Reveal from '../../efeitos/Reveal'

interface ComecarProps {
  onEntrar: () => void
  onCriarConta: () => void
  onLerTermo: () => void
}

const PASSOS = [
  {
    numero: '1',
    titulo: 'Crie sua conta',
    texto: 'Nome, e-mail e uma senha de 8 a 20 caracteres, com letra maiúscula, minúscula e número.',
  },
  {
    numero: '2',
    titulo: 'Leia e aceite o Termo',
    texto: 'O Termo de Uso e Política de Privacidade segue a LGPD. Você pode consultá-lo a qualquer momento.',
  },
  {
    numero: '3',
    titulo: 'Cadastre o primeiro Foco',
    texto: 'Você entra direto na plataforma e recebe um e-mail de boas-vindas. Depois é só escolher o que estudar.',
  },
]

function Comecar({ onEntrar, onCriarConta, onLerTermo }: ComecarProps) {
  return (
    <>
      <CabecalhoPagina
        rotulo="Comece agora"
        titulo="Seu primeiro Foco está a três passos."
        texto="O F.O.C.O é gratuito. Crie a conta, escolha o que quer estudar e defina a meta de horas: de uma semana a um ano."
      />

      <section className="foco-container foco-passos">
        {PASSOS.map((passo, i) => (
          <motion.article
            key={passo.numero}
            className="foco-passos__item"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
          >
            <span className="foco-passos__numero">{passo.numero}</span>
            <h3>{passo.titulo}</h3>
            <p>{passo.texto}</p>
          </motion.article>
        ))}
      </section>

      <section className="foco-container foco-comecar">
        <Reveal className="foco-comecar__caixa">
          <h2 className="foco-titulo-bloco">Pronto para começar?</h2>
          <div className="foco-chamada-final__acoes">
            <button type="button" className="btn btn-primary" onClick={onCriarConta}>
              Criar conta
            </button>
            <button type="button" className="btn btn-outline-light" onClick={onEntrar}>
              Entrar
            </button>
          </div>
          <button type="button" className="foco-comecar__termo" onClick={onLerTermo}>
            Ler o Termo de Uso e Política de Privacidade
          </button>
        </Reveal>
      </section>
    </>
  )
}

export default Comecar
