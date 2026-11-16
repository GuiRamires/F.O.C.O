import { useState, useEffect } from 'react'
import { buscarIndicadoresAdmin } from './repositories/adminRepository'
import type { IndicadoresAdmin } from './repositories/adminRepository'

interface PainelAdminProps {
  onLogout: () => void
}

const estiloCard = {
  border: '1px solid #444',
  borderRadius: '8px',
  padding: '1.5rem',
  flex: '1 1 200px',
  textAlign: 'center' as const,
}

function PainelAdmin({ onLogout }: PainelAdminProps) {
  const [indicadores, setIndicadores] = useState<IndicadoresAdmin | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    buscarIndicadoresAdmin()
      .then(setIndicadores)
      .catch(() => setErro('Não foi possível carregar os indicadores agora.'))
  }, [])

  const cards = indicadores
    ? [
        { valor: indicadores.totalUsuarios, rotulo: 'Usuários cadastrados' },
        { valor: indicadores.totalFocos, rotulo: 'Focos criados no sistema' },
        { valor: indicadores.usuariosAtivos30Dias, rotulo: 'Usuários com acesso nos últimos 30 dias' },
        { valor: indicadores.sessoes30Dias, rotulo: 'Sessões concluídas nos últimos 30 dias' },
      ]
    : []

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem' }}>F.O.C.O. — Painel Admin</h1>
        <button className="btn btn-outline-light" onClick={onLogout}>Sair</button>
      </div>

      {erro && <p role="alert">{erro}</p>}

      {!erro && !indicadores && <p>Carregando estatísticas...</p>}

      {indicadores && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {cards.map((card) => (
              <div key={card.rotulo} style={estiloCard}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{card.valor}</div>
                <div style={{ color: '#aaa' }}>{card.rotulo}</div>
              </div>
            ))}
          </div>
          <p style={{ color: '#aaa', marginTop: '1.5rem', fontSize: '0.9rem' }}>
            O painel mostra apenas totais. Títulos, observações, sessões e registros de aprendizado dos alunos não
            são acessíveis ao Administrador.
          </p>
        </>
      )}
    </div>
  )
}

export default PainelAdmin
