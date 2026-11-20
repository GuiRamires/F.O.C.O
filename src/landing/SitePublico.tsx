import PaginaInicial from '../PaginaInicial'
import Metodo from './paginas/Metodo'
import Funcionalidades from './paginas/Funcionalidades'
import Sobre from './paginas/Sobre'
import Comecar from './paginas/Comecar'
import TermoPublico from './paginas/TermoPublico'
import type { PaginaPublica } from '../conteudo/site'
import '../styles/paginas.css'
import '../styles/visuais.css'

interface SitePublicoProps {
  pagina: PaginaPublica
  onNavegar: (pagina: PaginaPublica) => void
  onEntrar: () => void
  onCriarConta: () => void
}

function SitePublico({ pagina, onNavegar, onEntrar, onCriarConta }: SitePublicoProps) {
  if (pagina === 'metodo') return <Metodo onCriarConta={onCriarConta} />
  if (pagina === 'funcionalidades') return <Funcionalidades />
  if (pagina === 'sobre') return <Sobre />
  if (pagina === 'comecar') return <Comecar onEntrar={onEntrar} onCriarConta={onCriarConta} onLerTermo={() => onNavegar('termo')} />
  if (pagina === 'termo') return <TermoPublico />
  return <PaginaInicial onEntrar={onEntrar} onCriarConta={onCriarConta} />
}

export default SitePublico
