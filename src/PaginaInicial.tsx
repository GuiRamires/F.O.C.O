import { useState } from 'react'
import SobreNos from './SobreNos'
import TermosModal from './TermosModal'

interface PaginaInicialProps {
  onEntrar: () => void
  onCriarConta: () => void
}

const MODULOS = [
  {
    letra: 'F',
    nome: 'Filtrar',
    texto: 'Escolha o que realmente importa estudar e transforme cada objetivo em um Foco com meta de horas.',
  },
  {
    letra: 'O',
    nome: 'Organizar',
    texto: 'Monte sua pilha de prioridades, destaque um Foco com a Estrela Dourada e guarde o resto no Laboratório de Sonhos.',
  },
  {
    letra: 'C',
    nome: 'Concentrar',
    texto: 'Estude com um temporizador que pode flutuar sobre outros programas, sem precisar manter a aba aberta.',
  },
  {
    letra: 'O',
    nome: 'Observar',
    texto: 'Registre o que aprendeu em cada sessão e acompanhe a sua evolução em gráficos.',
  },
]

function PaginaInicial({ onEntrar, onCriarConta }: PaginaInicialProps) {
  const [termoAberto, setTermoAberto] = useState(false)

  return (
    <main className="pagina-inicial">
      <header className="pagina-inicial__topo">
        <strong>F.O.C.O.</strong>
        <nav className="grupo-botoes" aria-label="Acesso">
          <button type="button" className="btn btn-outline-light" onClick={onEntrar}>
            Entrar
          </button>
          <button type="button" className="btn btn-primary" onClick={onCriarConta}>
            Criar conta
          </button>
        </nav>
      </header>

      <section className="pagina-inicial__destaque">
        <h1>Seu foco, do seu jeito.</h1>
        <p>
          O F.O.C.O. ajuda você a escolher o que estudar, organizar suas prioridades e cumprir o tempo de estudo que você
          mesmo definiu.
        </p>
        <div className="grupo-botoes">
          <button type="button" className="btn btn-primary" onClick={onCriarConta}>
            Criar conta
          </button>
          <button type="button" className="btn btn-outline-light" onClick={onEntrar}>
            Já tenho conta
          </button>
        </div>
      </section>

      <section aria-labelledby="modulos-titulo">
        <h2 id="modulos-titulo" className="secao__titulo">
          Os quatro módulos
        </h2>
        <div className="pagina-inicial__modulos">
          {MODULOS.map((modulo) => (
            <article key={modulo.nome} className="modulo">
              <div className="modulo__letra" aria-hidden="true">
                {modulo.letra}
              </div>
              <h3 className="secao__titulo">{modulo.nome}</h3>
              <p>{modulo.texto}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="secao">
        <SobreNos />
      </div>

      <footer>
        <button type="button" className="link-texto" onClick={() => setTermoAberto(true)}>
          Termo de Uso e Política de Privacidade
        </button>
      </footer>

      <TermosModal
        aberto={termoAberto}
        onAceitar={() => setTermoAberto(false)}
        onFechar={() => setTermoAberto(false)}
        somenteLeitura
      />
    </main>
  )
}

export default PaginaInicial
