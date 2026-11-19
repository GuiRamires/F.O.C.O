import { useCallback, useEffect, useState } from 'react'
import AdminChamados from './AdminChamados'
import AdminUsuarios from './AdminUsuarios'
import { handleCarregarChamados, handleCarregarIndicadores, handleCarregarUsuarios } from './controllers/adminController'
import type { IndicadoresAdmin, UsuarioAdmin } from './repositories/adminRepository'
import type { Chamado } from './repositories/suporteRepository'

interface PainelAdminProps {
  adminId: string
  onLogout: () => void
}

type Aba = 'indicadores' | 'chamados' | 'usuarios'

function PainelAdmin({ adminId, onLogout }: PainelAdminProps) {
  const [aba, setAba] = useState<Aba>('indicadores')
  const [indicadores, setIndicadores] = useState<IndicadoresAdmin | null>(null)
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([])
  const [chamados, setChamados] = useState<Chamado[]>([])
  const [erro, setErro] = useState(false)

  const carregar = useCallback(async () => {
    const [novosIndicadores, novosUsuarios, novosChamados] = await Promise.all([
      handleCarregarIndicadores(),
      handleCarregarUsuarios(),
      handleCarregarChamados(),
    ])
    setErro(!novosIndicadores || !novosUsuarios || !novosChamados)
    setIndicadores(novosIndicadores)
    setUsuarios(novosUsuarios ?? [])
    setChamados(novosChamados ?? [])
  }, [])

  useEffect(() => {
    let ativo = true
    Promise.all([handleCarregarIndicadores(), handleCarregarUsuarios(), handleCarregarChamados()]).then(
      ([novosIndicadores, novosUsuarios, novosChamados]) => {
        if (!ativo) return
        setErro(!novosIndicadores || !novosUsuarios || !novosChamados)
        setIndicadores(novosIndicadores)
        setUsuarios(novosUsuarios ?? [])
        setChamados(novosChamados ?? [])
      },
    )
    return () => {
      ativo = false
    }
  }, [])

  const cards = indicadores
    ? [
        { valor: indicadores.totalUsuarios, rotulo: 'Usuários cadastrados' },
        { valor: indicadores.totalFocos, rotulo: 'Focos criados no sistema' },
        { valor: indicadores.usuariosAtivos30Dias, rotulo: 'Usuários com acesso nos últimos 30 dias' },
        { valor: indicadores.sessoes30Dias, rotulo: 'Sessões concluídas nos últimos 30 dias' },
        { valor: indicadores.chamadosAbertos, rotulo: 'Chamados abertos' },
        { valor: indicadores.chamadosEmAndamento, rotulo: 'Chamados em andamento' },
        { valor: indicadores.chamadosRespondidos, rotulo: 'Chamados respondidos' },
        { valor: indicadores.chamadosEncerrados, rotulo: 'Chamados encerrados' },
      ]
    : []

  return (
    <main className="tela" style={{ maxWidth: '960px' }}>
      <div className="tela__topo">
        <h1 className="tela__titulo">F.O.C.O. — Painel Admin</h1>
        <button className="btn btn-outline-light" onClick={onLogout}>
          Sair
        </button>
      </div>

      <nav className="abas" aria-label="Áreas do painel">
        {(
          [
            ['indicadores', 'Indicadores'],
            ['chamados', `Chamados${indicadores ? ` (${indicadores.chamadosAbertos})` : ''}`],
            ['usuarios', 'Usuários'],
          ] as const
        ).map(([valor, rotulo]) => (
          <button
            key={valor}
            type="button"
            className={`btn ${aba === valor ? 'btn-primary' : 'btn-outline-light'}`}
            aria-pressed={aba === valor}
            onClick={() => setAba(valor)}
          >
            {rotulo}
          </button>
        ))}
      </nav>

      {erro && (
        <p className="mensagem mensagem--erro" role="alert">
          Não foi possível carregar todos os dados do painel agora.
        </p>
      )}

      {aba === 'indicadores' &&
        (indicadores ? (
          <>
            <div className="indicadores">
              {cards.map((card) => (
                <div key={card.rotulo} className="indicador">
                  <div className="indicador__valor">{card.valor}</div>
                  <div className="indicador__rotulo">{card.rotulo}</div>
                </div>
              ))}
            </div>
            <p className="secao__dica" style={{ marginTop: '1.5rem' }}>
              O painel mostra apenas totais. Títulos, observações, sessões e registros de aprendizado dos alunos não são
              acessíveis ao Administrador.
            </p>
          </>
        ) : (
          !erro && <p>Carregando estatísticas...</p>
        ))}

      {aba === 'chamados' && <AdminChamados chamados={chamados} usuarios={usuarios} onAtualizar={carregar} />}
      {aba === 'usuarios' && <AdminUsuarios adminId={adminId} usuarios={usuarios} onAtualizar={carregar} />}
    </main>
  )
}

export default PainelAdmin
