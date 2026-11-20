import { useState } from 'react'
import { handleCriarFoco } from './controllers/focoController'
import { OPCOES_META } from './services/opcoesFoco'
import {
  LIMITE_OBSERVACOES,
  LIMITE_TITULO,
  mascararObservacoes,
  mascararTitulo,
  validarTextosDoFoco,
} from './services/textoFoco'

interface NovoFocoProps {
  userId: string
  onFocoCriado: () => void
  onCancelar: () => void
}

function NovoFoco({ userId, onFocoCriado, onCancelar }: NovoFocoProps) {
  const [titulo, setTitulo] = useState('')
  const [metaHoras, setMetaHoras] = useState(OPCOES_META[0].horas)
  const [observacoes, setObservacoes] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    const erroDeTexto = validarTextosDoFoco(titulo, observacoes)

    if (erroDeTexto) {
      setErro(erroDeTexto)
      return
    }

    setCarregando(true)
    const resultado = await handleCriarFoco(userId, {
      titulo: titulo.trim(),
      meta_horas: metaHoras,
      observacoes: observacoes.trim(),
    })
    setCarregando(false)

    if (!resultado.sucesso) {
      setErro(resultado.erro ?? 'Erro ao criar o Foco.')
      return
    }

    onFocoCriado()
  }

  return (
    <section className="foco-cartao">
      <h2 className="foco-cartao__titulo">Crie seu Próximo F.O.C.O</h2>

      <form className="foco-cartao__formulario" onSubmit={handleSubmit}>
        <div className="campo">
          <label htmlFor="novo-foco-titulo">Nome do F.O.C.O</label>
          <input
            id="novo-foco-titulo"
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(mascararTitulo(e.target.value))}
            placeholder="Ex: TCC - Projeto WEB"
          />
          <small className="campo__contador">
            Letras, números, espaços e hífen · {titulo.length}/{LIMITE_TITULO}
          </small>
        </div>

        <div className="campo">
          <label htmlFor="novo-foco-meta">Tempo que Pretende Finalizar</label>
          <select id="novo-foco-meta" value={metaHoras} onChange={(e) => setMetaHoras(Number(e.target.value))}>
            {OPCOES_META.map((opcao) => (
              <option key={opcao.horas} value={opcao.horas}>
                {opcao.label}
              </option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label htmlFor="novo-foco-observacoes">Observações</label>
          <textarea
            id="novo-foco-observacoes"
            value={observacoes}
            onChange={(e) => setObservacoes(mascararObservacoes(e.target.value))}
            placeholder="Ex: Criar projeto Web com métricas aprendidas em Aula"
          />
          <small className="campo__contador">
            {observacoes.length}/{LIMITE_OBSERVACOES}
          </small>
        </div>

        {erro && (
          <div className="alert alert-secondary" role="alert">
            {erro}
          </div>
        )}

        <div className="grupo-botoes">
          <button type="submit" className="btn btn-primary" disabled={carregando}>
            {carregando ? 'Criando...' : 'CRIAR'}
          </button>
          <button type="button" className="btn btn-outline-light" onClick={onCancelar}>
            Cancelar
          </button>
        </div>
      </form>
    </section>
  )
}

export default NovoFoco
