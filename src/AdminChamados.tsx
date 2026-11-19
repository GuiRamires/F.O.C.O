import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  handleAlterarSituacao,
  handleConferirTitulos,
  handleRegistrarAlteracaoEmail,
  handleResponderChamado,
} from './controllers/adminController'
import type { UsuarioAdmin } from './repositories/adminRepository'
import type { Chamado } from './repositories/suporteRepository'
import { filtrarChamados, LIMITE_RESPOSTA, usuarioDoChamado } from './services/adminService'
import { CATEGORIAS_CHAMADO, rotuloDaCategoria, rotuloDaSituacao, SITUACOES_CHAMADO } from './services/suporteService'
import { formatarData, formatarDataHora } from './utils/formatarData'

interface AdminChamadosProps {
  chamados: Chamado[]
  usuarios: UsuarioAdmin[]
  onAtualizar: () => void
}

type Aviso = { tipo: 'erro' | 'sucesso'; texto: string } | null

function AdminChamados({ chamados, usuarios, onAtualizar }: AdminChamadosProps) {
  const [situacao, setSituacao] = useState('aberto')
  const [categoria, setCategoria] = useState('')
  const [numero, setNumero] = useState('')
  const [filtros, setFiltros] = useState({ situacao: 'aberto', categoria: '', numero: '' })
  const cartaoAberto = useRef<HTMLLIElement | null>(null)
  const [abertoId, setAbertoId] = useState<string | null>(null)
  const [resposta, setResposta] = useState('')
  const [conferencia, setConferencia] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [aviso, setAviso] = useState<Aviso>(null)

  const chamado = chamados.find((item) => item.id === abertoId) ?? null
  const filtrados = filtrarChamados(chamados, filtros.situacao, filtros.categoria, filtros.numero)
  const lista = chamado && !filtrados.some((item) => item.id === chamado.id) ? [chamado, ...filtrados] : filtrados
  const usuario = chamado ? usuarioDoChamado(chamado, usuarios) : null

  useEffect(() => {
    if (!abertoId) return
    function fecharAoClicarFora(evento: MouseEvent) {
      if (cartaoAberto.current && !cartaoAberto.current.contains(evento.target as Node)) setAbertoId(null)
    }
    function fecharComEsc(evento: KeyboardEvent) {
      if (evento.key === 'Escape') setAbertoId(null)
    }
    document.addEventListener('mousedown', fecharAoClicarFora)
    document.addEventListener('keydown', fecharComEsc)
    return () => {
      document.removeEventListener('mousedown', fecharAoClicarFora)
      document.removeEventListener('keydown', fecharComEsc)
    }
  }, [abertoId])

  function aplicarFiltros(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setAbertoId(null)
    setFiltros({ situacao, categoria, numero })
    onAtualizar()
  }

  function abrir(id: string) {
    setAbertoId(id)
    setResposta('')
    setConferencia('')
    setAviso(null)
  }

  async function responder(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!chamado || salvando) return
    setSalvando(true)
    const resultado = await handleResponderChamado(chamado.id, resposta)
    setSalvando(false)
    setAviso({ tipo: resultado.sucesso ? 'sucesso' : 'erro', texto: resultado.mensagem })
    if (resultado.sucesso) {
      setResposta('')
      onAtualizar()
    }
  }

  async function mudarSituacao(status: 'em_andamento' | 'encerrado') {
    if (!chamado || salvando) return
    setSalvando(true)
    const resultado = await handleAlterarSituacao(chamado.id, status)
    setSalvando(false)
    setAviso({ tipo: resultado.sucesso ? 'sucesso' : 'erro', texto: resultado.mensagem })
    if (resultado.sucesso) onAtualizar()
  }

  async function registrarAlteracaoEmail() {
    if (!chamado || salvando) return
    setSalvando(true)
    const resultado = await handleRegistrarAlteracaoEmail(chamado.id)
    setSalvando(false)
    setAviso({ tipo: resultado.sucesso ? 'sucesso' : 'erro', texto: resultado.mensagem })
  }

  async function conferir() {
    if (!chamado) return
    const resultado = await handleConferirTitulos(chamado.email_informado ?? '', chamado.titulos_informados ?? '')
    setConferencia(resultado.mensagem)
  }

  return (
    <section aria-labelledby="chamados-admin-titulo">
      <h2 id="chamados-admin-titulo" className="secao__titulo">
        Chamados
      </h2>
      <form className="grupo-botoes" style={{ marginBottom: '1rem', alignItems: 'flex-end' }} onSubmit={aplicarFiltros}>
        <div className="campo">
          <label htmlFor="filtro-situacao">Situação</label>
          <select id="filtro-situacao" value={situacao} onChange={(evento) => setSituacao(evento.target.value)}>
            <option value="">Todas</option>
            {SITUACOES_CHAMADO.map((item) => (
              <option key={item.valor} value={item.valor}>
                {item.rotulo}
              </option>
            ))}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="filtro-numero">Nº do chamado</label>
          <input
            id="filtro-numero"
            inputMode="numeric"
            value={numero}
            onChange={(evento) => setNumero(evento.target.value.replace(/\D/g, '').slice(0, 9))}
          />
        </div>
        <div className="campo">
          <label htmlFor="filtro-categoria">Categoria</label>
          <select id="filtro-categoria" value={categoria} onChange={(evento) => setCategoria(evento.target.value)}>
            <option value="">Todas</option>
            {CATEGORIAS_CHAMADO.map((item) => (
              <option key={item.valor} value={item.valor}>
                {item.rotulo}
              </option>
            ))}
          </select>
        </div>
        <div className="campo">
          <button type="submit" className="btn btn-primary">
            Aplicar filtros
          </button>
        </div>
      </form>

      {lista.length === 0 ? (
        <p className="secao__dica">Nenhum chamado encontrado.</p>
      ) : (
        <ul className="lista-chamados">
          {lista.map((item) => (
            <li key={item.id} className="chamado" ref={abertoId === item.id ? cartaoAberto : undefined}>
              <div className="chamado__cabecalho">
                <span>
                  <strong>Chamado nº {item.numero}</strong> · {rotuloDaCategoria(item.categoria)} ·{' '}
                  {formatarDataHora(item.created_at)}
                  {!item.user_id && ' · sem login'}
                </span>
                <span className={`selo-situacao selo-situacao--${item.status}`}>{rotuloDaSituacao(item.status)}</span>
              </div>
              <button
                type="button"
                className="link-texto"
                aria-expanded={abertoId === item.id}
                onClick={() => (abertoId === item.id ? setAbertoId(null) : abrir(item.id))}
              >
                {abertoId === item.id ? 'Fechar chamado' : 'Abrir chamado'}
              </button>
              {abertoId === item.id && chamado && (
              <div className="chamado__detalhes">
                {chamado.user_id ? (
                  <p className="secao__dica">Aberto por {usuario ? `${usuario.nome} (${usuario.email})` : 'um usuário'}.</p>
                ) : (
                  <p className="secao__dica">
                    Sem login. E-mail informado: {chamado.email_informado}. Resposta para: {chamado.email_contato}.
                  </p>
                )}
                <p className="chamado__descricao">{chamado.descricao}</p>
                {chamado.respostas_chamado.map((item) => (
                  <div key={item.created_at} className="chamado__resposta">
                    <small className="secao__dica">Resposta · {formatarDataHora(item.created_at)}</small>
                    <div>{item.texto}</div>
                  </div>
                ))}

                {!chamado.user_id && (
                  <div className="secao" style={{ marginTop: '1rem' }}>
                    <h4 className="secao__titulo">Verificação de identidade</h4>
                    {usuario ? (
                      <>
                        <p className="secao__dica">Compare o que o usuário informou no pedido com os dados da conta.</p>
                        <div className="tabela-rolavel">
                          <table>
                            <thead>
                              <tr>
                                <th>Pergunta</th>
                                <th>Informado no pedido</th>
                                <th>Dados da conta</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>Nome</td>
                                <td>{chamado.nome_informado || '—'}</td>
                                <td>{usuario.nome}</td>
                              </tr>
                              <tr>
                                <td>Cadastro</td>
                                <td>{chamado.cadastro_informado || '—'}</td>
                                <td>{formatarData(usuario.cadastradoEm)}</td>
                              </tr>
                              <tr>
                                <td>Último acesso</td>
                                <td>{chamado.ultimo_acesso_informado || '—'}</td>
                                <td>{formatarData(usuario.ultimoAcesso)}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <p className="secao__dica" style={{ marginTop: '0.75rem' }}>
                          Os títulos de Focos não são exibidos ao Administrador. A conferência informa apenas quantos títulos do
                          pedido existem na conta.
                        </p>
                        <button type="button" className="btn btn-sm btn-outline-light" onClick={conferir}>
                          Conferir títulos informados
                        </button>
                        {conferencia && (
                          <p className="mensagem" role="status">
                            {conferencia}
                          </p>
                        )}
                        <p className="secao__dica">
                          Com a verificação aprovada, bloqueie a conta na aba Usuários, altere o e-mail pelo painel do serviço
                          de autenticação e registre a decisão em uma resposta. Nunca altere o e-mail apenas a pedido.
                        </p>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-light"
                          disabled={salvando}
                          onClick={registrarAlteracaoEmail}
                        >
                          Registrar que o e-mail foi alterado
                        </button>
                      </>
                    ) : (
                      <p className="secao__dica">
                        Não há conta com o e-mail informado. Responda orientando o usuário a conferir o endereço ou a criar uma
                        conta nova.
                      </p>
                    )}
                  </div>
                )}

                {chamado.status !== 'encerrado' && (
                  <form onSubmit={responder} noValidate style={{ marginTop: '1rem' }}>
                    <div className="campo">
                      <label htmlFor="resposta-chamado">Resposta</label>
                      <textarea
                        id="resposta-chamado"
                        rows={5}
                        value={resposta}
                        maxLength={LIMITE_RESPOSTA}
                        onChange={(evento) => setResposta(evento.target.value)}
                      />
                      <span className="campo__contador">
                        {resposta.length}/{LIMITE_RESPOSTA}
                      </span>
                      <small className="secao__dica">A resposta não pode ser editada depois de enviada.</small>
                    </div>
                    <div className="grupo-botoes">
                      <button type="submit" className="btn btn-primary" disabled={salvando}>
                        {salvando ? 'Enviando...' : 'Enviar resposta'}
                      </button>
                      {chamado.status === 'aberto' && (
                        <button type="button" className="btn btn-outline-light" disabled={salvando} onClick={() => mudarSituacao('em_andamento')}>
                          Marcar em andamento
                        </button>
                      )}
                      <button type="button" className="btn btn-outline-light" disabled={salvando} onClick={() => mudarSituacao('encerrado')}>
                        Encerrar chamado
                      </button>
                    </div>
                  </form>
                )}
                {aviso && (
                  <p className={`mensagem mensagem--${aviso.tipo}`} role={aviso.tipo === 'erro' ? 'alert' : 'status'}>
                    {aviso.texto}
                  </p>
                )}
              </div>
              )}
            </li>
          ))}
        </ul>
      )}

    </section>
  )
}

export default AdminChamados
