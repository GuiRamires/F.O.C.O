import CabecalhoPagina from '../CabecalhoPagina'
import TextoTermo from '../../components/TextoTermo'
import { TEXTO_TERMOS } from '../../conteudo/termo'

function TermoPublico() {
  return (
    <>
      <CabecalhoPagina
        rotulo="Documentos"
        titulo="Termo de Uso e Política de Privacidade"
        texto="Como o F.O.C.O trata os seus dados, de acordo com a LGPD (Lei nº 13.709/2018)."
      />
      <section className="foco-container foco-termo-pagina">
        <article className="foco-termo">
          <TextoTermo texto={TEXTO_TERMOS} />
        </article>
      </section>
    </>
  )
}

export default TermoPublico
