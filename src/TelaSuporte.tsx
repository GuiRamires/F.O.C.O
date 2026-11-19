import { useCallback, useEffect, useState, type FormEvent } from 'react'
import ListaChamados from './ListaChamados'
import { handleAbrirChamado, handleListarMeusChamados } from './controllers/suporteController'
import type { Chamado } from './repositories/suporteRepository'
import {
  CATEGORIAS_CHAMADO,
  LIMITE_DESCRICAO,
  mascararDescricao,
  ORIENTACAO_DADOS_SENSIVEIS,
} from './services/suporteService'

interface TelaSuporteProps {
  userId: string
  onVoltar: () => void
}

const PERGUNTAS_FREQUENTES = [
  {
    pergunta: 'O que é a Estrela Dourada?',
    resposta:
      'É o destaque do seu Foco principal. Só um Foco pode ter a Estrela por vez, e trocar a prioridade pede uma breve reflexão antes de confirmar.',
  },
  {
    pergunta: 'Para onde vai um Foco arquivado?',
    resposta:
      'Para o Laboratório de Sonhos. Ele sai da pilha, mas continua guardado e pode ser resgatado quando fizer sentido.',
  },
  {
    pergunta: 'Por que um Foco foi para o Laboratório sozinho?',
    resposta:
      'Focos sem nenhuma sessão por 30 dias são arquivados automaticamente. Aos 14 dias você recebe um aviso no card e por e-mail. O Foco com a Estrela nunca é arquivado sozinho.',
  },
  {
    pergunta: 'A janela flutuante não abre. E agora?',
    resposta:
      'Ela funciona no Chrome e no Edge para computador. Nos outros navegadores, o temporizador continua funcionando na própria aba.',
  },
  {
    pergunta: 'Como baixo ou excluo os meus dados?',
    resposta:
      'Em Minha conta você exporta seus Focos e sessões em JSON ou CSV e também pode excluir a conta. Pedidos sobre seus dados também podem ser feitos pela categoria Privacidade e dados.',
  },
]

function TelaSuporte({ userId, onVoltar }: TelaSuporteProps) {
  const [chamados, setChamados] = useState<Chamado[]>([])
  const [carregando, setCarregando] = useState(true)
  const [categoria, setCategoria] = useState('')
  const [descricao, setDescricao] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'erro' | 'sucesso'; texto: string } | null>(null)

  const carregar = useCallback(async () => {
    const resultado = await handleListarMeusChamados(userId)
    setChamados(resultado.chamados)
    setCarregando(false)
  }, [userId])

  useEffect(() => {
    let ativo = true
    handleListarMeusChamados(userId).then((resultado) => {
      if (!ativo) return
      setChamados(resultado.chamados)
      setCarregando(false)
    })
    return () => {
      ativo = false
    }
  }, [userId])

  async function abrir(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (enviando) return
    setEnviando(true)
    setMensagem(null)
    const resultado = await handleAbrirChamado(userId, categoria, descricao)
    setEnviando(false)
    setMensagem({ tipo: resultado.sucesso ? 'sucesso' : 'erro', texto: resultado.mensagem })
    if (resultado.sucesso) {
      setCategoria('')
      setDescricao('')
      carregar()
    }
  }

  return (
    <main className="tela">
      <div className="tela__topo">
        <h1 className="tela__titulo">Suporte</h1>
        <button type="button" className="btn btn-outline-light" onClick={onVoltar}>
          Voltar
        </button>
      </div>

      <section className="secao faq" aria-labelledby="faq-titulo">
        <h2 id="faq-titulo" className="secao__titulo">
          Perguntas frequentes
        </h2>
        {PERGUNTAS_FREQUENTES.map((item) => (
          <details key={item.pergunta}>
            <summary>{item.pergunta}</summary>
            <p>{item.resposta}</p>
          </details>
        ))}
      </section>

      <section className="secao" aria-labelledby="contato-titulo">
        <h2 id="contato-titulo" className="secao__titulo">
          Fale com a gente
        </h2>
        <p className="secao__dica">
          O atendimento é feito pelos chamados abaixo, com resposta em até 5 dias úteis. Quando houver resposta, você
          recebe um aviso por e-mail e lê o conteúdo aqui e em Minha conta.
        </p>
        <form onSubmit={abrir} noValidate>
          <div className="campo">
            <label htmlFor="chamado-categoria">Categoria</label>
            <select id="chamado-categoria" value={categoria} onChange={(evento) => setCategoria(evento.target.value)}>
              <option value="">Escolha uma categoria</option>
              {CATEGORIAS_CHAMADO.map((item) => (
                <option key={item.valor} value={item.valor}>
                  {item.rotulo}
                </option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="chamado-descricao">Descrição</label>
            <textarea
              id="chamado-descricao"
              rows={5}
              value={descricao}
              maxLength={LIMITE_DESCRICAO}
              onChange={(evento) => setDescricao(mascararDescricao(evento.target.value))}
              aria-describedby="chamado-orientacao"
            />
            <span className="campo__contador">
              {descricao.length}/{LIMITE_DESCRICAO}
            </span>
            <small id="chamado-orientacao" className="secao__dica">
              {ORIENTACAO_DADOS_SENSIVEIS}
            </small>
          </div>
          {mensagem && (
            <p className={`mensagem mensagem--${mensagem.tipo}`} role={mensagem.tipo === 'erro' ? 'alert' : 'status'}>
              {mensagem.texto}
            </p>
          )}
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? 'Enviando...' : 'Abrir chamado'}
          </button>
        </form>
      </section>

      <section className="secao" aria-labelledby="meus-chamados-titulo">
        <h2 id="meus-chamados-titulo" className="secao__titulo">
          Meus chamados
        </h2>
        <ListaChamados chamados={chamados} carregando={carregando} />
      </section>
    </main>
  )
}

export default TelaSuporte
