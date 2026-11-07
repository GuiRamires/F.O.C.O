import { useState, type CSSProperties } from 'react'
import type { FocoComProgresso } from './services/focoService'
import { estaNoTop3, type AvaliacaoEstrela } from './services/estrelaService'
import { corDoFocoNaPilha, estadoVisualDoFoco } from './services/estadoVisualService'
import { podeEditar } from './services/edicaoFocoService'
import { avaliarArquivamento, STATUS_ATIVO, STATUS_LABORATORIO, type ResultadoResgate } from './services/laboratorioService'
import {
  podeMudarDePosicao,
  posicoesDaPilha,
  primeiraPosicaoLivre,
  type SituacaoDaPilha,
} from './services/posicaoService'
import {
  handleAtribuirEstrela,
  handleRemoverEstrela,
  handleVerificarEstrela,
} from './controllers/estrelaController'
import { handleArquivarFoco, handleExcluirFoco, handleResgatarFoco } from './controllers/laboratorioController'
import { handleMudarPosicao } from './controllers/posicaoController'
import { handleEditarFoco } from './controllers/edicaoFocoController'
import { descreverMinutos } from './utils/formatarHoras'
import MenuAcoesFoco, { type AcaoMenu } from './MenuAcoesFoco'
import ModalAtribuirEstrela from './ModalAtribuirEstrela'
import ModalRemoverEstrela from './ModalRemoverEstrela'
import ModalArquivarFoco from './ModalArquivarFoco'
import ModalFocoResgatado from './ModalFocoResgatado'
import ModalExcluirFoco from './ModalExcluirFoco'
import ModalMudarPosicao from './ModalMudarPosicao'
import ModalEditarFoco from './ModalEditarFoco'
import './styles/laboratorio.css'
import './styles/pilha.css'

interface ListaFocosProps {
  focos: FocoComProgresso[]
  userId: string
  onFocoAtualizado: () => void
  onConcentrar: (foco: FocoComProgresso) => void
}

type ModalAberto =
  | { tipo: 'atribuir'; foco: FocoComProgresso; avaliacao: AvaliacaoEstrela }
  | { tipo: 'remover'; foco: FocoComProgresso }
  | { tipo: 'editar'; foco: FocoComProgresso }
  | { tipo: 'posicao'; foco: FocoComProgresso }
  | { tipo: 'arquivar'; foco: FocoComProgresso }
  | { tipo: 'resgatado'; foco: FocoComProgresso; resultado: ResultadoResgate }
  | { tipo: 'excluir'; foco: FocoComProgresso }

interface MenuDoFoco {
  acoes: AcaoMenu[]
  aviso?: string
}

function minutosDoFoco(foco: FocoComProgresso): number {
  return Math.round(foco.horasAcumuladas * 60)
}

function ListaFocos({ focos, userId, onFocoAtualizado, onConcentrar }: ListaFocosProps) {
  const [processandoId, setProcessandoId] = useState<string | null>(null)
  const [menuAbertoId, setMenuAbertoId] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalAberto | null>(null)

  const focosAtivos = focos.filter((f) => f.status === STATUS_ATIVO)
  const focosLaboratorio = focos.filter((f) => f.status === STATUS_LABORATORIO)
  const pilha: SituacaoDaPilha = {
    totalAtivos: focosAtivos.length,
    existeEstrela: focosAtivos.some((f) => f.tem_estrela),
  }

  function abrirModal(novoModal: ModalAberto) {
    setMenuAbertoId(null)
    setModal(novoModal)
  }

  function fecharModal() {
    setModal(null)
  }

  function concluirAcao() {
    setModal(null)
    onFocoAtualizado()
  }

  async function handleCliqueEstrela(foco: FocoComProgresso) {
    if (foco.tem_estrela) {
      abrirModal({ tipo: 'remover', foco })
      return
    }

    setProcessandoId(foco.id)
    const avaliacao = await handleVerificarEstrela(foco, userId)
    setProcessandoId(null)
    abrirModal({ tipo: 'atribuir', foco, avaliacao })
  }

  async function resgatar(foco: FocoComProgresso) {
    setMenuAbertoId(null)
    setProcessandoId(foco.id)
    const resultado = await handleResgatarFoco(foco, userId)
    setProcessandoId(null)
    setModal({ tipo: 'resgatado', foco, resultado })
  }

  function concentrarNoResgatado(foco: FocoComProgresso, posicao: number | null) {
    setModal(null)
    onConcentrar({ ...foco, status: STATUS_ATIVO, posicao, aguardandoPratica: true })
    onFocoAtualizado()
  }

  function menuDoFocoAtivo(foco: FocoComProgresso): MenuDoFoco {
    const acoes: AcaoMenu[] = [
      {
        rotulo: 'Concentrar',
        icone: 'concentrar',
        aoEscolher: () => {
          setMenuAbertoId(null)
          onConcentrar(foco)
        },
      },
    ]

    if (podeEditar(foco)) {
      acoes.push({
        rotulo: 'Editar',
        icone: 'editar',
        aoEscolher: () => abrirModal({ tipo: 'editar', foco }),
        variante: 'secundario',
      })
    }

    if (podeMudarDePosicao(foco, pilha)) {
      acoes.push({
        rotulo: 'Mudar posição',
        icone: 'mover',
        aoEscolher: () => abrirModal({ tipo: 'posicao', foco }),
        variante: 'secundario',
      })
    }

    const arquivamento = avaliarArquivamento(foco)

    if (!arquivamento.permitido) {
      return { acoes, aviso: arquivamento.mensagem }
    }

    acoes.push({
      rotulo: 'Arquivar',
      icone: 'arquivar',
      aoEscolher: () => abrirModal({ tipo: 'arquivar', foco }),
      variante: 'laboratorio',
    })
    return { acoes }
  }

  function menuDoFocoNoLaboratorio(foco: FocoComProgresso): MenuDoFoco {
    return {
      acoes: [
        { rotulo: 'Resgatar e praticar', icone: 'resgatar', aoEscolher: () => resgatar(foco), variante: 'laboratorio' },
        {
          rotulo: 'Excluir',
          icone: 'excluir',
          aoEscolher: () => abrirModal({ tipo: 'excluir', foco }),
          variante: 'perigo',
        },
      ],
    }
  }

  if (focosAtivos.length === 0 && focosLaboratorio.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🧠</div>
        <p style={{ fontSize: '1.1rem' }}>
          Você não tem nenhum F.O.C.O recentemente.<br />
          Adicione um novo
        </p>
      </div>
    )
  }

  return (
    <div>
      {menuAbertoId && <div className="fundo-escurecido" aria-hidden="true" />}

      <h5 style={{ marginBottom: '1rem' }}>Seu FOCO Atual</h5>
      {focosAtivos.length === 0 && (
        <p style={{ opacity: 0.75 }}>Sua pilha está vazia. Crie um Foco ou resgate um do Laboratório de Sonhos.</p>
      )}
      {focosAtivos.map((foco) => (
        <CardFoco
          key={foco.id}
          foco={foco}
          podeReceberEstrela={estaNoTop3(foco.posicao)}
          processando={processandoId === foco.id}
          onCliqueEstrela={() => handleCliqueEstrela(foco)}
          menu={menuDoFocoAtivo(foco)}
          menuAberto={menuAbertoId === foco.id}
          onAbrirMenu={() => setMenuAbertoId(foco.id)}
          onFecharMenu={() => setMenuAbertoId(null)}
        />
      ))}

      {focosLaboratorio.length > 0 && (
        <>
          <h5 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#888' }}>
            Laboratório de Sonhos
          </h5>
          {focosLaboratorio.map((foco) => (
            <CardFoco
              key={foco.id}
              foco={foco}
              podeReceberEstrela={false}
              processando={processandoId === foco.id}
              menu={menuDoFocoNoLaboratorio(foco)}
              menuAberto={menuAbertoId === foco.id}
              onAbrirMenu={() => setMenuAbertoId(foco.id)}
              onFecharMenu={() => setMenuAbertoId(null)}
            />
          ))}
        </>
      )}

      {modal?.tipo === 'atribuir' && (
        <ModalAtribuirEstrela
          tituloFoco={modal.foco.titulo}
          avaliacao={modal.avaliacao}
          onConfirmar={() => handleAtribuirEstrela(modal.foco, userId)}
          onConcluido={concluirAcao}
          onFechar={fecharModal}
        />
      )}

      {modal?.tipo === 'remover' && (
        <ModalRemoverEstrela
          tituloFoco={modal.foco.titulo}
          onRemover={(fraseDigitada) => handleRemoverEstrela(modal.foco, userId, fraseDigitada, focosAtivos.length)}
          onConcluido={concluirAcao}
          onFechar={fecharModal}
        />
      )}

      {modal?.tipo === 'editar' && (
        <ModalEditarFoco
          foco={modal.foco}
          onSalvar={(dados) => handleEditarFoco(modal.foco, dados, userId)}
          onConcluido={concluirAcao}
          onFechar={fecharModal}
        />
      )}

      {modal?.tipo === 'posicao' && (
        <ModalMudarPosicao
          tituloFoco={modal.foco.titulo}
          posicaoAtual={modal.foco.posicao}
          posicoes={posicoesDaPilha(pilha)}
          primeiraLivre={primeiraPosicaoLivre(pilha)}
          aguardandoPratica={modal.foco.aguardandoPratica}
          onMover={(novaPosicao) => handleMudarPosicao(modal.foco, novaPosicao, pilha, userId)}
          onConcluido={concluirAcao}
          onFechar={fecharModal}
        />
      )}

      {modal?.tipo === 'arquivar' && (
        <ModalArquivarFoco
          tituloFoco={modal.foco.titulo}
          minutosAcumulados={minutosDoFoco(modal.foco)}
          onArquivar={() => handleArquivarFoco(modal.foco, userId)}
          onConcluido={concluirAcao}
          onFechar={fecharModal}
        />
      )}

      {modal?.tipo === 'resgatado' && (
        <ModalFocoResgatado
          tituloFoco={modal.foco.titulo}
          minutosAcumulados={minutosDoFoco(modal.foco)}
          resultado={modal.resultado}
          onConcentrar={() => concentrarNoResgatado(modal.foco, modal.resultado.posicao)}
          onFechar={concluirAcao}
        />
      )}

      {modal?.tipo === 'excluir' && (
        <ModalExcluirFoco
          tituloFoco={modal.foco.titulo}
          minutosAcumulados={minutosDoFoco(modal.foco)}
          onExcluir={(palavraDigitada) => handleExcluirFoco(modal.foco, userId, palavraDigitada)}
          onConcluido={concluirAcao}
          onFechar={fecharModal}
        />
      )}
    </div>
  )
}

interface CardFocoProps {
  foco: FocoComProgresso
  podeReceberEstrela: boolean
  processando?: boolean
  onCliqueEstrela?: () => void
  menu: MenuDoFoco
  menuAberto: boolean
  onAbrirMenu: () => void
  onFecharMenu: () => void
}

function descreverData(dataIso: string): string {
  return new Date(dataIso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function CardFoco({
  foco,
  podeReceberEstrela,
  processando = false,
  onCliqueEstrela,
  menu,
  menuAberto,
  onAbrirMenu,
  onFecharMenu,
}: CardFocoProps) {
  const estado = estadoVisualDoFoco(foco)
  const cor = corDoFocoNaPilha(foco)
  const noLaboratorio = estado === 'laboratorio'

  return (
    <div
      className={`card-foco card-foco--clicavel card-foco--${estado}${menuAberto ? ' card-foco--selecionado' : ''}`}
      style={cor ? ({ '--cor-foco': cor } as CSSProperties) : undefined}
      onClick={processando ? undefined : onAbrirMenu}
      aria-busy={processando}
    >
      <div className="card-foco__conteudo">
        <div className="card-foco__linha">
          <h5 className="card-foco__titulo">{foco.titulo}</h5>
          <span>{descreverMinutos(Math.round(foco.horasAcumuladas * 60))}</span>
        </div>
        <div className="card-foco__linha">
          {podeReceberEstrela ? (
            <button
              type="button"
              className="card-foco__estrela"
              onClick={(evento) => {
                evento.stopPropagation()
                onCliqueEstrela?.()
              }}
              disabled={processando}
              aria-label={foco.tem_estrela ? 'Retirar a Estrela Dourada' : 'Dar a Estrela Dourada'}
            >
              {foco.tem_estrela ? '⭐' : '☆'}
            </button>
          ) : (
            <span />
          )}
          <span>{Math.floor(foco.porcentagem)}%</span>
        </div>
        {processando && noLaboratorio && <div className="card-foco__data">Resgatando...</div>}
        {!processando && noLaboratorio && foco.arquivado_em && (
          <div className="card-foco__data">No Laboratório desde {descreverData(foco.arquivado_em)}</div>
        )}
        {foco.aguardandoPratica && (
          <span className="card-foco__selo">Recém-resgatado: pratique para liberar</span>
        )}
      </div>

      {menuAberto && <MenuAcoesFoco acoes={menu.acoes} aviso={menu.aviso} onFechar={onFecharMenu} />}
    </div>
  )
}

export default ListaFocos
