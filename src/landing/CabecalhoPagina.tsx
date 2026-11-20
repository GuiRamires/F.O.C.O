import BlurText from '../efeitos/BlurText'
import Reveal from '../efeitos/Reveal'

interface CabecalhoPaginaProps {
  rotulo: string
  titulo: string
  texto: string
}

function CabecalhoPagina({ rotulo, titulo, texto }: CabecalhoPaginaProps) {
  return (
    <header className="foco-pagina__cabecalho foco-container">
      <p className="foco-rotulo">{rotulo}</p>
      <BlurText como="h1" className="foco-titulo-secao" texto={titulo} />
      <Reveal atraso={0.2}>
        <p className="foco-lead">{texto}</p>
      </Reveal>
    </header>
  )
}

export default CabecalhoPagina
