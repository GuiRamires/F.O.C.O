import type { FocoComProgresso } from './services/focoService'

interface ListaFocosProps {
  focos: FocoComProgresso[]
  onNovoFoco: () => void
}

function ListaFocos({ focos, onNovoFoco }: ListaFocosProps) {
  const focosAtivos = focos.filter((f) => f.status === 'ativo')
  const focosLaboratorio = focos.filter((f) => f.status === 'laboratorio_sonhos')

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
      {focosAtivos.length > 0 && (
        <>
          <h5 style={{ marginBottom: '1rem' }}>Seu FOCO Atual</h5>
          {focosAtivos.map((foco) => (
            <CardFoco key={foco.id} foco={foco} />
          ))}
        </>
      )}

      {focosLaboratorio.length > 0 && (
        <>
          <h5 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#888' }}>
            Laboratório de Sonhos
          </h5>
          {focosLaboratorio.map((foco) => (
            <CardFoco key={foco.id} foco={foco} desativado />
          ))}
        </>
      )}
    </div>
  )
}

function CardFoco({ foco, desativado = false }: { foco: FocoComProgresso; desativado?: boolean }) {
  return (
    <div
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
        {!foco.tem_estrela && <span style={{ color: '#666' }}>☆</span>}
        <span style={{ marginLeft: 'auto' }}>{foco.porcentagem.toFixed(0)}%</span>
      </div>
    </div>
  )
}

export default ListaFocos