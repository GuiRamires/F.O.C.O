import { Fragment, useEffect, useRef, useState, type FormEvent } from 'react'
import { handleAlterarBloqueio } from './controllers/adminController'
import type { UsuarioAdmin } from './repositories/adminRepository'
import { filtrarUsuarios, LIMITE_MINIMO_MOTIVO, LIMITE_MOTIVO, podeAlterarBloqueio } from './services/adminService'
import { formatarData } from './utils/formatarData'

interface AdminUsuariosProps {
  adminId: string
  usuarios: UsuarioAdmin[]
  onAtualizar: () => void
}

type Aviso = { usuarioId: string; tipo: 'erro' | 'sucesso'; texto: string } | null

const TOTAL_COLUNAS = 7

function AdminUsuarios({ adminId, usuarios, onAtualizar }: AdminUsuariosProps) {
  const [busca, setBusca] = useState('')
  const [selecionado, setSelecionado] = useState<UsuarioAdmin | null>(null)
  const [motivo, setMotivo] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [aviso, setAviso] = useState<Aviso>(null)
  const formulario = useRef<HTMLTableRowElement | null>(null)

  const lista = filtrarUsuarios(usuarios, busca)
  const tamanhoMotivo = motivo.trim().length
  const faltam = LIMITE_MINIMO_MOTIVO - tamanhoMotivo

  useEffect(() => {
    if (!selecionado || salvando) return
    function fecharAoClicarFora(evento: MouseEvent) {
      const alvo = evento.target as HTMLElement
      if (formulario.current?.contains(alvo) || alvo.closest('[data-acao-bloqueio]')) return
      setSelecionado(null)
    }
    function fecharComEsc(evento: KeyboardEvent) {
      if (evento.key === 'Escape') setSelecionado(null)
    }
    document.addEventListener('mousedown', fecharAoClicarFora)
    document.addEventListener('keydown', fecharComEsc)
    return () => {
      document.removeEventListener('mousedown', fecharAoClicarFora)
      document.removeEventListener('keydown', fecharComEsc)
    }
  }, [selecionado, salvando])

  function selecionar(usuario: UsuarioAdmin) {
    if (selecionado?.id === usuario.id) {
      setSelecionado(null)
      return
    }
    setSelecionado(usuario)
    setMotivo('')
    setAviso(null)
  }

  async function confirmar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!selecionado || salvando || faltam > 0) return
    setSalvando(true)
    const resultado = await handleAlterarBloqueio(selecionado, adminId, !selecionado.bloqueado, motivo)
    setSalvando(false)
    setAviso({ usuarioId: selecionado.id, tipo: resultado.sucesso ? 'sucesso' : 'erro', texto: resultado.mensagem })
    if (resultado.sucesso) {
      setSelecionado(null)
      setMotivo('')
      onAtualizar()
    }
  }

  return (
    <section aria-labelledby="usuarios-titulo">
      <h2 id="usuarios-titulo" className="secao__titulo">
        Usuários
      </h2>
      <p className="secao__dica">
        A lista mostra apenas dados mínimos. Títulos, observações, sessões e registros de aprendizado dos alunos não são
        acessíveis ao Administrador.
      </p>
      <div className="campo">
        <label htmlFor="usuarios-busca">Buscar por nome ou e-mail</label>
        <input id="usuarios-busca" value={busca} onChange={(evento) => setBusca(evento.target.value)} />
      </div>

      <div className="tabela-rolavel">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Cadastro</th>
              <th>Último acesso</th>
              <th>Situação</th>
              <th>Focos</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((usuario) => (
              <Fragment key={usuario.id}>
                <tr className={selecionado?.id === usuario.id ? 'linha-selecionada' : undefined}>
                  <td>
                    {usuario.nome}
                    {usuario.papel === 'admin' && <small className="secao__dica"> (Administrador)</small>}
                  </td>
                  <td>{usuario.email}</td>
                  <td>{formatarData(usuario.cadastradoEm)}</td>
                  <td>{formatarData(usuario.ultimoAcesso)}</td>
                  <td>{usuario.bloqueado ? 'Bloqueada' : 'Ativa'}</td>
                  <td>{usuario.totalFocos}</td>
                  <td>
                    {podeAlterarBloqueio(usuario, adminId) && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-light"
                        data-acao-bloqueio
                        aria-expanded={selecionado?.id === usuario.id}
                        onClick={() => selecionar(usuario)}
                      >
                        {usuario.bloqueado ? 'Desbloquear' : 'Bloquear'}
                      </button>
                    )}
                  </td>
                </tr>

                {selecionado?.id === usuario.id && (
                  <tr ref={formulario} className="linha-formulario">
                    <td colSpan={TOTAL_COLUNAS}>
                      <form onSubmit={confirmar} noValidate>
                        <p className="secao__titulo">
                          {usuario.bloqueado ? 'Desbloquear' : 'Bloquear'} a conta de {usuario.nome}
                        </p>
                        <div className="campo">
                          <label htmlFor="bloqueio-motivo">Motivo (fica registrado nos logs de auditoria)</label>
                          <input
                            id="bloqueio-motivo"
                            value={motivo}
                            maxLength={LIMITE_MOTIVO}
                            autoFocus
                            aria-describedby="bloqueio-motivo-dica"
                            aria-invalid={tamanhoMotivo > 0 && faltam > 0}
                            onChange={(evento) => setMotivo(evento.target.value)}
                          />
                          <span
                            id="bloqueio-motivo-dica"
                            className={`campo__contador${tamanhoMotivo > 0 && faltam > 0 ? ' campo__contador--alerta' : ''}`}
                            aria-live="polite"
                          >
                            {faltam > 0
                              ? `Escreva pelo menos ${LIMITE_MINIMO_MOTIVO} caracteres (falta${faltam > 1 ? 'm' : ''} ${faltam}).`
                              : `${motivo.length}/${LIMITE_MOTIVO}`}
                          </span>
                        </div>
                        <div className="grupo-botoes">
                          <button type="submit" className="btn btn-warning" disabled={salvando || faltam > 0}>
                            {salvando ? 'Salvando...' : 'Confirmar'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-light"
                            onClick={() => setSelecionado(null)}
                            disabled={salvando}
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    </td>
                  </tr>
                )}

                {aviso?.usuarioId === usuario.id && (
                  <tr>
                    <td colSpan={TOTAL_COLUNAS}>
                      <p className={`mensagem mensagem--${aviso.tipo}`} role={aviso.tipo === 'erro' ? 'alert' : 'status'}>
                        {aviso.texto}
                      </p>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default AdminUsuarios
