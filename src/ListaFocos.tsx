import { useState } from 'react'
import type { FocoComProgresso } from './services/focoService'
import { estaNoTop3, type AvaliacaoEstrela } from './services/estrelaService'
import {
  handleAtribuirEstrela,
  handleRemoverEstrela,
  handleVerificarEstrela,
} from './controllers/estrelaController'
import { descreverMinutos } from './utils/formatarHoras'
import MenuAcoesFoco from './MenuAcoesFoco'
import ModalAtribuirEstrela from './ModalAtribuirEstrela'
import ModalRemoverEstrela from './ModalRemoverEstrela'

interface ListaFocosProps {
  focos: FocoComProgresso[]
  userId: string
  onFocoAtualizado: () => void
  onConcentrar: (foco: FocoComProgresso) => void
}

type ModalEstrela =
  | { tipo: 'atribuir'; foco: FocoComProgresso; avaliacao: AvaliacaoEstrela }
  | { tipo: 'remover'; foco: FocoComProgresso }

function ListaFocos({ focos, userId, onFocoAtualizado, onConcentrar }: ListaFocosProps) {
  const [verificandoId, setVerificandoId] = useState<string | null>(null)
  const [menuAbertoId, setMenuAbertoId] = useState<string | null>(null)
  const [modalEstrela, setModalEstrela] = useState<ModalEstrela | null>(null)

  const focosAtivos = focos.filter((f) => f.status === 'ativo')
  const focosLaboratorio = focos.filter((f) => f.status === 'laboratorio_sonhos')

  async function handleCliqueEstrela(foco: FocoComProgresso) {
    if (foco.tem_estrela) {
      setModalEstrela({ tipo: 'remover', foco })
      return
    }

    setVerificandoId(foco.id)
    const avaliacao = await handleVerificarEstrela(foco, userId)
    setVerificandoId(null)
    setModalEstrela({ tipo: 'atribuir', foco, avaliacao })
  }

  function fecharModalEstrela() {
    setModalEstrela(null)
  }

  function concluirAcaoEstrela() {
    setModalEstrela(null)
    onFocoAtualizado()
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

      {focosAtivos.length > 0 && (
        <>
          <h5 style={{ marginBottom: '1rem' }}>Seu FOCO Atual</h5>
          {focosAtivos.map((foco) => (
            <CardFoco
              key={foco.id}
              foco={foco}
              podeReceberEstrela={estaNoTop3(foco.posicao)}
              processando={verificandoId === foco.id}
              onCliqueEstrela={() => handleCliqueEstrela(foco)}
              menuAberto={menuAbertoId === foco.id}
              onAbrirMenu={() => setMenuAbertoId(foco.id)}
              onFecharMenu={() => setMenuAbertoId(null)}
              onConcentrar={() => {
                setMenuAbertoId(null)
                onConcentrar(foco)
              }}
            />
          ))}
        </>
      )}

      {focosLaboratorio.length > 0 && (
        <>
          <h5 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#888' }}>
            Laboratório de Sonhos
          </h5>
          {focosLaboratorio.map((foco) => (
            <CardFoco key={foco.id} foco={foco} desativado podeReceberEstrela={false} />
          ))}
        </>
      )}

      {modalEstrela?.tipo === 'atribuir' && (
        <ModalAtribuirEstrela
          tituloFoco={modalEstrela.foco.titulo}
          avaliacao={modalEstrela.avaliacao}
          onConfirmar={() => handleAtribuirEstrela(modalEstrela.foco, userId)}
          onConcluido={concluirAcaoEstrela}
          onFechar={fecharModalEstrela}
        />
      )}

      {modalEstrela?.tipo === 'remover' && (
        <ModalRemoverEstrela
          tituloFoco={modalEstrela.foco.titulo}
          onRemover={(fraseDigitada) =>
            handleRemoverEstrela(modalEstrela.foco, userId, fraseDigitada, focosAtivos.length)
          }
          onConcluido={concluirAcaoEstrela}
          onFechar={fecharModalEstrela}
        />
      )}
    </div>
  )
}

interface CardFocoProps {
  foco: FocoComProgresso
  desativado?: boolean
  podeReceberEstrela: boolean
  processando?: boolean
  onCliqueEstrela?: () => void
  menuAberto?: boolean
  onAbrirMenu?: () => void
  onFecharMenu?: () => void
  onConcentrar?: () => void
}

function CardFoco({
  foco,
  desativado = false,
  podeReceberEstrela,
  processando,
  onCliqueEstrela,
  menuAberto = false,
  onAbrirMenu,
  onFecharMenu,
  onConcentrar,
}: CardFocoProps) {
  return (
    <div
      className={`card-foco ${onAbrirMenu ? 'card-foco--clicavel' : ''} ${menuAberto ? 'card-foco--selecionado' : ''}`}
      onClick={onAbrirMenu}
      style={{
        border: '1px solid #444',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '0.75rem',
        opacity: desativado ? 0.5 : 1,
        backgroundColor: foco.tem_estrela ? '#ffc107' : 'transparent',
        color: foco.tem_estrela ? '#000' : 'inherit',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h5 style={{ margin: 0 }}>{foco.titulo}</h5>
        <span>{descreverMinutos(Math.round(foco.horasAcumuladas * 60))}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
        {podeReceberEstrela ? (
          <button
            type="button"
            onClick={(evento) => {
              evento.stopPropagation()
              onCliqueEstrela?.()
            }}
            disabled={processando}
            aria-label={foco.tem_estrela ? 'Retirar a Estrela Dourada' : 'Dar a Estrela Dourada'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: foco.tem_estrela ? '#000' : '#666' }}
          >
            {foco.tem_estrela ? '⭐' : '☆'}
          </button>
        ) : (
          <span />
        )}
        <span style={{ marginLeft: 'auto' }}>{Math.floor(foco.porcentagem)}%</span>
      </div>

      {menuAberto && onConcentrar && onFecharMenu && (
        <MenuAcoesFoco onConcentrar={onConcentrar} onFechar={onFecharMenu} />
      )}
    </div>
  )
}

export default ListaFocos