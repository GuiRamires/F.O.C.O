import type { Chamado } from './repositories/suporteRepository'
import { rotuloDaCategoria, rotuloDaSituacao } from './services/suporteService'
import { formatarDataHora } from './utils/formatarData'

interface ListaChamadosProps {
  chamados: Chamado[]
  carregando: boolean
}

function ListaChamados({ chamados, carregando }: ListaChamadosProps) {
  if (carregando) return <p>Carregando seus chamados...</p>
  if (chamados.length === 0) return <p className="secao__dica">Você ainda não abriu nenhum chamado.</p>

  return (
    <ul className="lista-chamados">
      {chamados.map((chamado) => (
        <li key={chamado.id} className="chamado">
          <div className="chamado__cabecalho">
            <span>
              <strong>Chamado nº {chamado.numero}</strong> · {rotuloDaCategoria(chamado.categoria)} ·{' '}
              {formatarDataHora(chamado.created_at)}
            </span>
            <span className={`selo-situacao selo-situacao--${chamado.status}`}>{rotuloDaSituacao(chamado.status)}</span>
          </div>
          <p className="chamado__descricao">{chamado.descricao}</p>
          {chamado.respostas_chamado.map((resposta) => (
            <div key={resposta.created_at} className="chamado__resposta">
              <small className="secao__dica">Resposta do suporte · {formatarDataHora(resposta.created_at)}</small>
              <div>{resposta.texto}</div>
            </div>
          ))}
        </li>
      ))}
    </ul>
  )
}

export default ListaChamados
