import { motion } from 'motion/react'
import CabecalhoPagina from '../CabecalhoPagina'
import Reveal from '../../efeitos/Reveal'
import { TCC } from '../../conteudo/site'
import '../../styles/paginas.css'

const TECNOLOGIAS = [
  { nome: 'React + TypeScript', papel: 'Interface' },
  { nome: 'Bootstrap', papel: 'Layout responsivo' },
  { nome: 'Motion', papel: 'Animações da interface' },
  { nome: 'Supabase', papel: 'Auth, banco e RLS' },
  { nome: 'PostgreSQL', papel: 'Dados e regras' },
  { nome: 'Edge Functions', papel: 'Funções no servidor' },
  { nome: 'Resend', papel: 'E-mails' },
  { nome: 'Recharts', papel: 'Gráficos do Observar' },
  { nome: 'Picture-in-Picture', papel: 'Janela flutuante' },
  { nome: 'Web Audio', papel: 'Alerta do timer' },
  { nome: 'Vitest + PGlite', papel: 'Testes' },
  { nome: 'Vercel', papel: 'Hospedagem' },
]

const ETAPAS = [
  {
    situacao: 'Já funciona',
    titulo: 'Jornada do Aluno',
    texto:
      'Pilha de Focos, Top 3, Estrela Dourada, confirmação reflexiva, Laboratório de Sonhos, timer com janela flutuante, registro de aprendizado e Observar.',
  },
  {
    situacao: 'Já funciona',
    titulo: 'Conta, suporte e rotinas',
    texto:
      'Recuperação de senha por código, área Minha conta com exportação e exclusão dos dados, arquivamento automático com aviso prévio, suporte e painel administrativo.',
  },
  {
    situacao: 'Trabalho futuro',
    titulo: 'Próximas ideias',
    texto:
      'Perfil Mentor, segundo fator de autenticação, tema claro, reordenação por arrastar e soltar e modo reduzido da janela flutuante.',
  },
]

interface SobreProps {
  avisoDoPrototipo?: boolean
}

function Sobre({ avisoDoPrototipo = false }: SobreProps) {
  return (
    <>
      <CabecalhoPagina
        rotulo="Sobre nós"
        titulo="Um TCC feito para ser usado de verdade."
        texto={`O F.O.C.O é o Projeto Final de Curso de ${TCC.curso} na ${TCC.universidade}. Nasceu de um problema real: ter interesse em tudo e não conseguir avançar em nada.`}
      />

      <section className="foco-container foco-sobre">
        <Reveal className="foco-sobre__card">
          <p className="foco-rotulo">Desenvolvimento</p>
          <h3>{TCC.autor}</h3>
          <p>Estudante de {TCC.curso}, designer e desenvolvedor front-end.</p>
        </Reveal>
        <Reveal className="foco-sobre__card" atraso={0.1}>
          <p className="foco-rotulo">Orientação</p>
          <h3>{TCC.orientador}</h3>
          <p>Coorientação: {TCC.coorientador}</p>
        </Reveal>
        <Reveal className="foco-sobre__card" atraso={0.2}>
          <p className="foco-rotulo">Arquitetura</p>
          <h3>Controller → Service → Repository</h3>
          <p>
            As regras de negócio ficam nos Services e são conferidas de novo no banco, com Row Level Security para cada aluno
            ver só os próprios dados.
          </p>
        </Reveal>
      </section>

      <section className="foco-container">
        <Reveal>
          <h2 className="foco-titulo-bloco">Stack</h2>
        </Reveal>
        <div className="foco-tecnologias">
          {TECNOLOGIAS.map((tecnologia, i) => (
            <motion.div
              key={tecnologia.nome}
              className="foco-tecnologias__item"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 260, damping: 18 }}
            >
              <strong>{tecnologia.nome}</strong>
              <small>{tecnologia.papel}</small>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="foco-container foco-etapas">
        <Reveal>
          <h2 className="foco-titulo-bloco">Roadmap</h2>
        </Reveal>
        <ol>
          {ETAPAS.map((etapa, i) => (
            <Reveal key={etapa.titulo} atraso={i * 0.1}>
              <li className={`foco-etapas__item ${etapa.situacao === 'Já funciona' ? 'foco-etapas__item--feito' : ''}`}>
                <span className="foco-etapas__situacao">{etapa.situacao}</span>
                <h3>{etapa.titulo}</h3>
                <p>{etapa.texto}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {avisoDoPrototipo && (
        <section className="foco-container foco-aviso-prototipo">
          <p>
            Por ser um protótipo acadêmico, o F.O.C.O. não garante disponibilidade contínua. Dúvidas e pedidos sobre os
            seus dados podem ser feitos pelo Suporte.
          </p>
        </section>
      )}
    </>
  )
}

export default Sobre
