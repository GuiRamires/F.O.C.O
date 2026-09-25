import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

interface PainelAdminProps {
  onLogout: () => void
}

function PainelAdmin({ onLogout }: PainelAdminProps) {
  const [totalUsuarios, setTotalUsuarios] = useState<number | null>(null)
  const [totalFocos, setTotalFocos] = useState<number | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregarDados() {
      const { count: countUsuarios } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      const { count: countFocos } = await supabase
        .from('focos')
        .select('*', { count: 'exact', head: true })

      setTotalUsuarios(countUsuarios ?? 0)
      setTotalFocos(countFocos ?? 0)
      setCarregando(false)
    }

    carregarDados()
  }, [])

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem' }}>F.O.C.O. — Painel Admin</h1>
        <button className="btn btn-outline-light" onClick={onLogout}>Sair</button>
      </div>

      {carregando ? (
        <p>Carregando estatísticas...</p>
      ) : (
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ border: '1px solid #444', borderRadius: '8px', padding: '1.5rem', flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalUsuarios}</div>
            <div style={{ color: '#888' }}>Usuários cadastrados</div>
          </div>
          <div style={{ border: '1px solid #444', borderRadius: '8px', padding: '1.5rem', flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalFocos}</div>
            <div style={{ color: '#888' }}>Focos criados no sistema</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PainelAdmin