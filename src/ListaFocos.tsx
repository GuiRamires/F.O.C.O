import { useState } from 'react'
import type { FocoComProgresso } from './services/focoService'
import { handleAtribuirEstrela, handleRemoverEstrela } from './controllers/estrelaController'
import MenuAcoesFoco from './MenuAcoesFoco'

interface ListaFocosProps {
  focos: FocoComProgresso[]
  userId: string
  onFocoAtualizado: () => void
  onConcentrar: (foco: FocoComProgresso) => void
}

function ListaFocos({ focos, userId, onFocoAtualizado, onConcentrar }: ListaFocosProps) {
  const [processando, setProcessando] = useState<string | null>(null)
  const [menuAbertoId, setMenuAbertoId] = useState<string | null>(null)

  const focosAtivos = focos.filter((f) => f.status === 'ativo')
  const focosLaboratorio = focos.filter((f) => f.status === 'laboratorio_sonhos')

  async function handleCliqueEstrela(foco: FocoComProgresso) {
    setProcessando(foco.id)

    if (foco.tem_estrela) {
      const confirmado = window.confirm(
        'Deseja tirar a prioridade deste FOCO? Ele será movido para o seu Laboratório de Sonhos para que você reorganize suas energias.'
      )
      if (confirmado) {
        const resultado = await handleRemoverEstrela(foco.id)
        alert(resultado.mensagem)
        if (resultado.sucesso) onFocoAtualizado()
      }
    } else {
      const confirmado = window.confirm(
        `Deseja atribuir a Estrela Dourada ao Foco "${foco.titulo}"? Ele se tornará sua prioridade máxima.`
      )
      if (confirmado) {
        const resultado = await handleAtribuirEstrela(foco.id, userId)
        alert(resultado.mensagem)
        if (resultado.sucesso) onFocoAtualizado()
      }
    }

    setProcessando(null)
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
          {focosAtivos.map((foco, index) => (
            <CardFoco
              key={foco.id}
              foco={foco}
              podeReceberEstrela={index < 3}
              processando={processando === foco.id}
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
        <span>{foco.horasAcumuladas.toFixed(1)} horas</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
        {podeReceberEstrela ? (
          <button
            onClick={(evento) => {
              evento.stopPropagation()
              onCliqueEstrela?.()
            }}
            disabled={processando}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: foco.tem_estrela ? '#000' : '#666' }}
          >
            {foco.tem_estrela ? '⭐' : '☆'}
          </button>
        ) : (
          <span />
        )}
        <span style={{ marginLeft: 'auto' }}>{foco.porcentagem.toFixed(0)}%</span>
      </div>

      {menuAberto && onConcentrar && onFecharMenu && (
        <MenuAcoesFoco onConcentrar={onConcentrar} onFechar={onFecharMenu} />
      )}
    </div>
  )
}

export default ListaFocos