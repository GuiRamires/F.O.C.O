import Abertura from './landing/inicio/Abertura'
import Destaques from './landing/inicio/Destaques'
import PorQueFoco from './landing/inicio/PorQueFoco'
import Organizar from './landing/inicio/Organizar'
import Pilares from './landing/inicio/Pilares'
import Concentrar from './landing/inicio/Concentrar'
import ValeTrocar from './landing/inicio/ValeTrocar'
import './styles/inicio.css'
import './styles/visuais.css'

interface PaginaInicialProps {
  onEntrar: () => void
  onCriarConta: () => void
}

function PaginaInicial({ onEntrar, onCriarConta }: PaginaInicialProps) {
  return (
    <>
      <Abertura onCriarConta={onCriarConta} />
      <Destaques />
      <PorQueFoco />
      <Organizar />
      <Pilares />
      <Concentrar />
      <ValeTrocar onEntrar={onEntrar} onCriarConta={onCriarConta} />
    </>
  )
}

export default PaginaInicial
