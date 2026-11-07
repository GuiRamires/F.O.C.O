import { useState, type CSSProperties, type FormEvent } from 'react'
import type { FocoComProgresso } from './services/focoService'
import type { DadosDaEdicao, ResultadoEdicao } from './services/edicaoFocoService'
import { COR_PADRAO_FOCO, OPCOES_META, PALETA_FOCO, metaEhValida } from './services/opcoesFoco'
import { descreverMinutos } from './utils/formatarHoras'
import './styles/timer.css'
import './styles/edicaoFoco.css'

interface ModalEditarFocoProps {
  foco: FocoComProgresso
  onSalvar: (dados: DadosDaEdicao) => Promise<ResultadoEdicao>
  onConcluido: () => void
  onFechar: () => void
}

function ModalEditarFoco({ foco, onSalvar, onConcluido, onFechar }: ModalEditarFocoProps) {
  const [titulo, setTitulo] = useState(foco.titulo)
  const [metaHoras, setMetaHoras] = useState(foco.meta_horas)
  const [observacoes, setObservacoes] = useState(foco.observacoes ?? '')
  const [cor, setCor] = useState<string | null>(foco.cor_hex)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const opcoesMeta = metaEhValida(foco.meta_horas)
    ? OPCOES_META
    : [{ label: `${foco.meta_horas} h (meta atual)`, horas: foco.meta_horas }, ...OPCOES_META]
  const corEscolhida = PALETA_FOCO.find((opcao) => opcao.hex === cor) ?? PALETA_FOCO[0]
  const minutosAcumulados = Math.round(foco.horasAcumuladas * 60)

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErro('')

    if (!titulo.trim()) {
      setErro('O nome do F.O.C.O é obrigatório.')
      return
    }

    setSalvando(true)
    const resultado = await onSalvar({ titulo, meta_horas: metaHoras, observacoes, cor_hex: cor })
    if (resultado.sucesso) {
      onConcluido()
      return
    }
    setErro(resultado.mensagem)
    setSalvando(false)
  }

  return (
    <div className="retomada-fundo">
      <div className="retomada edicao-modal" role="dialog" aria-modal="true" aria-labelledby="editar-foco-titulo">
        <form className="edicao-modal__form" onSubmit={salvar} noValidate>
          <p id="editar-foco-titulo" className="retomada__titulo">
            Editar Foco
          </p>

          <label className="edicao-modal__grupo">
            <span className="edicao-modal__rotulo">Nome do F.O.C.O</span>
            <input
              className="edicao-modal__campo"
              type="text"
              value={titulo}
              onChange={(evento) => setTitulo(evento.target.value)}
              autoFocus
            />
          </label>

          <label className="edicao-modal__grupo">
            <span className="edicao-modal__rotulo">Tempo que Pretende Finalizar</span>
            <select
              className="edicao-modal__campo"
              value={metaHoras}
              onChange={(evento) => setMetaHoras(Number(evento.target.value))}
            >
              {opcoesMeta.map((opcao) => (
                <option key={opcao.horas} value={opcao.horas}>
                  {opcao.label}
                </option>
              ))}
            </select>
          </label>

          <label className="edicao-modal__grupo">
            <span className="edicao-modal__rotulo">Observações</span>
            <textarea
              className="edicao-modal__campo"
              value={observacoes}
              onChange={(evento) => setObservacoes(evento.target.value)}
            />
          </label>

          <fieldset className="edicao-modal__grupo">
            <legend className="edicao-modal__rotulo">Cor no Top 3: {corEscolhida.nome}</legend>
            <div className="edicao-modal__paleta" role="radiogroup" aria-label="Cor do Foco">
              {PALETA_FOCO.map((opcao) => (
                <button
                  key={opcao.nome}
                  type="button"
                  role="radio"
                  aria-checked={opcao.hex === cor}
                  aria-label={opcao.nome}
                  title={opcao.nome}
                  className="edicao-modal__cor"
                  style={{ '--cor-amostra': opcao.hex ?? COR_PADRAO_FOCO } as CSSProperties}
                  onClick={() => setCor(opcao.hex)}
                />
              ))}
            </div>
            <p className="edicao-modal__nota">
              {foco.tem_estrela
                ? 'Com a Estrela, o Foco fica dourado. A cor escolhida aparece se ele deixar de ser a prioridade.'
                : 'A cor aparece enquanto o Foco estiver entre os três primeiros e sem a Estrela.'}
            </p>
          </fieldset>

          <p className="edicao-modal__nota">
            {minutosAcumulados > 0
              ? `As ${descreverMinutos(minutosAcumulados)} já estudadas continuam iguais; só o progresso é recalculado.`
              : 'Mudar a meta só recalcula o progresso.'}
          </p>

          <p className="aprendizado__erro" role="alert">
            {erro}
          </p>

          <div className="edicao-modal__acoes">
            <button type="submit" className="retomada__continuar" disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" className="retomada__link" onClick={onFechar} disabled={salvando}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalEditarFoco
