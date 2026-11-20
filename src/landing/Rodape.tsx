import { PAGINAS_DO_MENU, TCC, type PaginaPublica } from '../conteudo/site'

interface RodapeProps {
  onNavegar: (pagina: PaginaPublica) => void
  onEntrar: () => void
  onCriarConta: () => void
}

function Rodape({ onNavegar, onEntrar, onCriarConta }: RodapeProps) {
  return (
    <footer className="foco-rodape">
      <div className="foco-container">
        <p className="foco-rodape__nota">
          F.O.C.O é um Projeto Final de Curso de {TCC.curso} da {TCC.universidade}. Protótipo acadêmico.
        </p>

        <div className="foco-rodape__grade">
          <div>
            <h4>Navegar</h4>
            {PAGINAS_DO_MENU.map((item) => (
              <button key={item.pagina} type="button" onClick={() => onNavegar(item.pagina)}>
                {item.rotulo}
              </button>
            ))}
          </div>
          <div>
            <h4>Conta</h4>
            <button type="button" onClick={onEntrar}>
              Entrar
            </button>
            <button type="button" onClick={onCriarConta}>
              Criar conta
            </button>
            <button type="button" onClick={() => onNavegar('termo')}>
              Termo de Uso e Política de Privacidade
            </button>
          </div>
          <div>
            <h4>Créditos do TCC</h4>
            <span>Autor: {TCC.autor}</span>
            <span>Orientador: {TCC.orientador}</span>
            <span>Coorientador: {TCC.coorientador}</span>
          </div>
        </div>

        <div className="foco-rodape__base">
          <span>© {TCC.ano} F.O.C.O · Filtrar, Organizar, Concentrar, Observar.</span>
          <span>Feito com React + Vite</span>
        </div>
      </div>
    </footer>
  )
}

export default Rodape
