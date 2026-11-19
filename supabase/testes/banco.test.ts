import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { beforeEach, describe, expect, it } from 'vitest'

const PASTA_MIGRATIONS = join(__dirname, '..', 'migrations')

const AMBIENTE_SUPABASE = `
create role anon;
create role authenticated;
create role service_role;
create schema auth;
create table auth.users (
  id uuid primary key,
  email text,
  created_at timestamptz default now(),
  last_sign_in_at timestamptz,
  banned_until timestamptz,
  raw_user_meta_data jsonb default '{}'::jsonb
);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
`

const ALUNO = '00000000-0000-0000-0000-00000000000a'
const OUTRO_ALUNO = '00000000-0000-0000-0000-00000000000b'
const ADMIN = '00000000-0000-0000-0000-0000000000ad'
const NOVO = '00000000-0000-0000-0000-00000000000c'

let db: PGlite

async function criarBanco(): Promise<PGlite> {
  const banco = new PGlite()
  await banco.exec(AMBIENTE_SUPABASE)
  const arquivos = readdirSync(PASTA_MIGRATIONS)
    .filter((arquivo) => arquivo.endsWith('.sql') && !arquivo.includes('rotina_diaria'))
    .sort()
  for (const arquivo of arquivos) {
    await banco.exec(readFileSync(join(PASTA_MIGRATIONS, arquivo), 'utf8'))
  }
  return banco
}

async function criarUsuario(id: string, email: string, nome: string, papel = 'aluno') {
  await db.query('insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)', [
    id,
    email,
    JSON.stringify({ nome }),
  ])
  await db.query('update public.user_profiles set papel = $2 where id = $1', [id, papel])
}

async function comoUsuario<T>(id: string, acao: () => Promise<T>): Promise<T> {
  await db.exec(`set role authenticated; set request.jwt.claim.sub = '${id}';`)
  try {
    return await acao()
  } finally {
    await db.exec(`reset role; reset request.jwt.claim.sub;`)
  }
}

async function criarFoco(usuario: string, titulo: string, diasDesdeCriacao: number, comEstrela = false) {
  const { rows } = await db.query<{ id: string }>(
    `insert into public.focos (user_id, titulo, meta_horas, tem_estrela, created_at)
     values ($1, $2, 10, $3, now() - make_interval(days => $4)) returning id`,
    [usuario, titulo, comEstrela, diasDesdeCriacao],
  )
  return rows[0].id
}

async function criarSessao(focoId: string, diasAtras: number) {
  await db.query(
    `insert into public.focus_sessions (foco_id, duracao_minutos, created_at)
     values ($1, 25, now() - make_interval(days => $2))`,
    [focoId, diasAtras],
  )
}

async function statusDoFoco(id: string) {
  const { rows } = await db.query<{ status: string }>('select status from public.focos where id = $1', [id])
  return rows[0].status
}

async function marcarAvisoHaDias(id: string, dias: number) {
  await db.query(
    'update public.focos set ultimo_aviso_inatividade_em = now() - make_interval(days => $2) where id = $1',
    [id, dias],
  )
}

beforeEach(async () => {
  db = await criarBanco()
  await criarUsuario(ALUNO, 'aluno@exemplo.com', 'Aluno')
  await criarUsuario(OUTRO_ALUNO, 'outro@exemplo.com', 'Outro Aluno')
  await criarUsuario(ADMIN, 'admin@exemplo.com', 'Admin', 'admin')
}, 30000)

describe('arquivamento automático por inatividade (RF16)', () => {
  it('arquiva o Foco com 30 dias sem sessão e aviso já emitido (CA16.1)', async () => {
    const foco = await criarFoco(ALUNO, 'Inglês', 60)
    await criarSessao(foco, 30)
    await marcarAvisoHaDias(foco, 16)

    await db.query('select public.arquivar_focos_inativos()')

    expect(await statusDoFoco(foco)).toBe('laboratorio_sonhos')
    const { rows } = await db.query<{ acao: string }>(
      `select acao from public.logs_auditoria where detalhes->>'foco_id' = $1`,
      [foco],
    )
    expect(rows.map((linha) => linha.acao)).toContain('arquivamento_automatico')
  })

  it('mantém ativo o Foco com 29 dias sem sessão (CA16.2)', async () => {
    const foco = await criarFoco(ALUNO, 'Inglês', 60)
    await criarSessao(foco, 29)
    await marcarAvisoHaDias(foco, 15)

    await db.query('select public.arquivar_focos_inativos()')

    expect(await statusDoFoco(foco)).toBe('ativo')
  })

  it('nunca arquiva o Foco com a Estrela Dourada (CA16.3)', async () => {
    const foco = await criarFoco(ALUNO, 'TCC', 45, true)
    await marcarAvisoHaDias(foco, 20)

    await db.query('select public.arquivar_focos_inativos()')

    expect(await statusDoFoco(foco)).toBe('ativo')
  })

  it('conta a inatividade a partir do resgate (CA16.4)', async () => {
    const foco = await criarFoco(ALUNO, 'Redação', 90)
    await criarSessao(foco, 60)
    await db.query(`update public.focos set resgatado_em = now() - interval '5 days' where id = $1`, [foco])
    await marcarAvisoHaDias(foco, 40)

    await db.query('select public.arquivar_focos_inativos()')

    expect(await statusDoFoco(foco)).toBe('ativo')
  })

  it('só arquiva depois do aviso de inatividade (RN16.4)', async () => {
    const foco = await criarFoco(ALUNO, 'Inglês', 45)

    await db.query('select public.arquivar_focos_inativos()')

    expect(await statusDoFoco(foco)).toBe('ativo')
  })

  it('reorganiza as posições da pilha e não processa duas vezes (RN16.5)', async () => {
    const primeiro = await criarFoco(ALUNO, 'Primeiro', 1)
    const parado = await criarFoco(ALUNO, 'Parado', 40)
    const terceiro = await criarFoco(ALUNO, 'Terceiro', 1)
    await db.query(`update public.focos set posicao = case id when $1 then 1 when $2 then 2 when $3 then 3 end where user_id = $4`, [
      primeiro,
      parado,
      terceiro,
      ALUNO,
    ])
    await marcarAvisoHaDias(parado, 20)

    const primeira = await db.query<{ arquivar_focos_inativos: number }>('select public.arquivar_focos_inativos()')
    const segunda = await db.query<{ arquivar_focos_inativos: number }>('select public.arquivar_focos_inativos()')

    expect(primeira.rows[0].arquivar_focos_inativos).toBe(1)
    expect(segunda.rows[0].arquivar_focos_inativos).toBe(0)
    const { rows } = await db.query<{ id: string; posicao: number }>(
      `select id, posicao from public.focos where status = 'ativo' and user_id = $1 order by posicao`,
      [ALUNO],
    )
    expect(rows).toEqual([
      { id: primeiro, posicao: 1 },
      { id: terceiro, posicao: 2 },
    ])
  })
})

describe('aviso de inatividade (RF17)', () => {
  it('emite um único aviso por período, com os dias restantes (RN17.2 e CA17.3)', async () => {
    const foco = await criarFoco(ALUNO, 'Inglês', 40)
    await criarSessao(foco, 20)

    const primeiro = await db.query<{ foco_id: string; dias_restantes: number; email: string }>(
      'select * from public.registrar_avisos_inatividade()',
    )
    const segundo = await db.query('select * from public.registrar_avisos_inatividade()')

    expect(primeiro.rows).toHaveLength(1)
    expect(primeiro.rows[0]).toMatchObject({ foco_id: foco, dias_restantes: 10, email: 'aluno@exemplo.com' })
    expect(segundo.rows).toHaveLength(0)
  })

  it('não avisa antes de 14 dias nem o Foco com a Estrela', async () => {
    const recente = await criarFoco(ALUNO, 'Recente', 40)
    await criarSessao(recente, 13)
    await criarFoco(ALUNO, 'Com estrela', 40, true)

    const { rows } = await db.query('select * from public.registrar_avisos_inatividade()')

    expect(rows).toHaveLength(0)
  })

  it('volta a avisar depois de uma nova sessão, em um novo período (CA17.2)', async () => {
    const foco = await criarFoco(ALUNO, 'Inglês', 60)
    await criarSessao(foco, 40)
    await marcarAvisoHaDias(foco, 25)
    await criarSessao(foco, 15)

    const { rows } = await db.query('select * from public.registrar_avisos_inatividade()')

    expect(rows).toHaveLength(1)
  })

  it('não pode ser executado por um Aluno', async () => {
    await expect(comoUsuario(ALUNO, () => db.query('select * from public.registrar_avisos_inatividade()'))).rejects.toThrow()
  })
})

describe('chamados de suporte (RF29 e RF30)', () => {
  async function abrirChamado(usuario: string, descricao = 'Não consigo ver meus Focos arquivados') {
    return comoUsuario(usuario, () =>
      db.query(`insert into public.chamados (categoria, descricao) values ('problema_tecnico', $1)`, [descricao]),
    )
  }

  it('o Aluno vê apenas os próprios chamados (CA29.4 e CA30.2)', async () => {
    await abrirChamado(ALUNO)
    await abrirChamado(OUTRO_ALUNO)

    const { rows } = await comoUsuario(ALUNO, () => db.query<{ user_id: string }>('select user_id from public.chamados'))

    expect(rows).toEqual([{ user_id: ALUNO }])
  })

  it('o Administrador vê todos os chamados', async () => {
    await abrirChamado(ALUNO)
    await abrirChamado(OUTRO_ALUNO)

    const { rows } = await comoUsuario(ADMIN, () => db.query('select id from public.chamados'))

    expect(rows).toHaveLength(2)
  })

  it('recusa descrição com menos de 10 caracteres ou caracteres fora do permitido (RN29.1)', async () => {
    await expect(abrirChamado(ALUNO, 'curto')).rejects.toThrow()
    await expect(abrirChamado(ALUNO, 'Texto com <script> no meio')).rejects.toThrow()
  })

  it('o Aluno não altera a situação nem responde chamados', async () => {
    await abrirChamado(ALUNO)
    const { rows } = await db.query<{ id: string }>('select id from public.chamados')

    await expect(
      comoUsuario(ALUNO, () => db.query(`update public.chamados set status = 'encerrado'`)),
    ).rejects.toThrow()
    await expect(
      comoUsuario(ALUNO, () => db.query('select public.responder_chamado($1, $2)', [rows[0].id, 'Resposta'])),
    ).rejects.toThrow()
  })

  it('a resposta do Administrador muda a situação e fica visível ao Aluno (CA30.1 e CA29.2)', async () => {
    await abrirChamado(ALUNO)
    const { rows } = await db.query<{ id: string }>('select id from public.chamados')

    await comoUsuario(ADMIN, () =>
      db.query('select public.responder_chamado($1, $2)', [rows[0].id, 'Os Focos arquivados ficam no Laboratório.']),
    )

    const chamado = await comoUsuario(ALUNO, () =>
      db.query<{ status: string }>('select status from public.chamados where id = $1', [rows[0].id]),
    )
    const respostas = await comoUsuario(ALUNO, () =>
      db.query<{ texto: string }>('select texto from public.respostas_chamado where chamado_id = $1', [rows[0].id]),
    )
    const outroAluno = await comoUsuario(OUTRO_ALUNO, () => db.query('select texto from public.respostas_chamado'))
    expect(chamado.rows[0].status).toBe('respondido')
    expect(respostas.rows[0].texto).toBe('Os Focos arquivados ficam no Laboratório.')
    expect(outroAluno.rows).toHaveLength(0)
  })

  it('a resposta tem até 2.000 caracteres (RN30.2)', async () => {
    await abrirChamado(ALUNO)
    const { rows } = await db.query<{ id: string }>('select id from public.chamados')

    await expect(
      comoUsuario(ADMIN, () => db.query('select public.responder_chamado($1, $2)', [rows[0].id, 'a'.repeat(2001)])),
    ).rejects.toThrow()
  })
})

describe('chamado sem login (RF29, fluxo alternativo)', () => {
  async function inserirSemLogin(status: string, mesesAtras: number) {
    await db.query(
      `insert into public.chamados (user_id, categoria, descricao, status, email_informado, email_contato,
                                    nome_informado, titulos_informados, atualizado_em)
       values (null, 'acesso_conta', 'Perdi o acesso ao e-mail antigo', $1, 'aluno@exemplo.com', 'contato@exemplo.com',
               'Aluno', 'Inglês',
               now() - make_interval(months => $2))`,
      [status, mesesAtras],
    )
  }

  it('exige os dois e-mails e a categoria de acesso à conta', async () => {
    await expect(
      db.query(
        `insert into public.chamados (user_id, categoria, descricao, email_informado, email_contato)
         values (null, 'duvida', 'Pergunta sem login aqui', 'aluno@exemplo.com', 'contato@exemplo.com')`,
      ),
    ).rejects.toThrow()
    await expect(
      db.query(
        `insert into public.chamados (user_id, categoria, descricao, email_informado)
         values (null, 'acesso_conta', 'Perdi o acesso ao e-mail', 'aluno@exemplo.com')`,
      ),
    ).rejects.toThrow()
  })

  it('aceita as respostas de verificação só com caracteres permitidos', async () => {
    await expect(
      db.query(
        `insert into public.chamados (user_id, categoria, descricao, email_informado, email_contato, nome_informado, titulos_informados)
         values (null, 'acesso_conta', 'Perdi o acesso ao e-mail', 'aluno@exemplo.com', 'contato@exemplo.com', 'Aluno', '<script>')`,
      ),
    ).rejects.toThrow()
    await db.query(
      `insert into public.chamados (user_id, categoria, descricao, email_informado, email_contato,
                                    nome_informado, cadastro_informado, ultimo_acesso_informado, titulos_informados)
       values (null, 'acesso_conta', 'Perdi o acesso ao e-mail', 'aluno@exemplo.com', 'contato@exemplo.com',
               'Aluno', 'setembro de 2026', '15/11/2026', 'Inglês, Cálculo')`,
    )
  })

  it('mantém os chamados sem login antigos, sem respostas de verificação, editáveis', async () => {
    await db.query(
      `insert into public.chamados (user_id, categoria, descricao, email_informado, email_contato)
       values (null, 'acesso_conta', 'Pedido anterior ao formulário', 'aluno@exemplo.com', 'contato@exemplo.com')`,
    )
    await db.query(`update public.chamados set status = 'encerrado'`)
    const { rows } = await db.query<{ status: string }>('select status from public.chamados')

    expect(rows).toEqual([{ status: 'encerrado' }])
  })

  it('numera os chamados em sequência, sem o Aluno escolher o número', async () => {
    await comoUsuario(ALUNO, () =>
      db.query(`insert into public.chamados (categoria, descricao) values ('duvida', 'Primeira pergunta aqui')`),
    )
    await comoUsuario(ALUNO, () =>
      db.query(`insert into public.chamados (categoria, descricao) values ('sugestao', 'Segunda sugestão aqui')`),
    )
    const { rows } = await db.query<{ numero: number }>('select numero from public.chamados order by created_at, numero')

    expect(rows.map((linha) => Number(linha.numero))).toEqual([1, 2])
    await expect(
      comoUsuario(ALUNO, () =>
        db.query(`insert into public.chamados (categoria, descricao, numero) values ('duvida', 'Pergunta qualquer aqui', 99)`),
      ),
    ).rejects.toThrow()
  })

  it('o Aluno não informa dados de verificação no próprio chamado', async () => {
    await expect(
      comoUsuario(ALUNO, () =>
        db.query(
          `insert into public.chamados (categoria, descricao, nome_informado) values ('acesso_conta', 'Pergunta qualquer aqui', 'Aluno')`,
        ),
      ),
    ).rejects.toThrow()
  })

  it('o Aluno não informa e-mails de contato no próprio chamado', async () => {
    await expect(
      comoUsuario(ALUNO, () =>
        db.query(
          `insert into public.chamados (categoria, descricao, email_contato) values ('duvida', 'Pergunta qualquer aqui', 'x@exemplo.com')`,
        ),
      ),
    ).rejects.toThrow()
  })

  it('elimina o chamado sem login 6 meses após o encerramento (Termo 1.1, item 2.7)', async () => {
    await inserirSemLogin('encerrado', 7)
    await inserirSemLogin('encerrado', 5)
    await inserirSemLogin('respondido', 8)

    const { rows } = await db.query<{ total: number }>('select public.remover_chamados_sem_login_vencidos() as total')
    const restantes = await db.query<{ status: string }>('select status from public.chamados order by status')

    expect(rows[0].total).toBe(1)
    expect(restantes.rows.map((linha) => linha.status)).toEqual(['encerrado', 'respondido'])
  })

  it('não pode ser executado por um Aluno', async () => {
    await expect(
      comoUsuario(ALUNO, () => db.query('select public.remover_chamados_sem_login_vencidos()')),
    ).rejects.toThrow()
  })
})

describe('Administrador: indicadores, usuários e verificação de identidade (RF26, RF30 e RF33)', () => {
  it('conta os chamados por situação (CA26.3)', async () => {
    for (let i = 0; i < 5; i++) {
      await comoUsuario(ALUNO, () =>
        db.query(`insert into public.chamados (categoria, descricao) values ('duvida', 'Como funciona a Estrela?')`),
      )
    }
    const { rows: chamados } = await db.query<{ id: string }>('select id from public.chamados order by id')
    for (const chamado of chamados.slice(0, 2)) {
      await comoUsuario(ADMIN, () => db.query('select public.responder_chamado($1, $2)', [chamado.id, 'Resposta.']))
    }

    const { rows } = await comoUsuario(ADMIN, () => db.query('select * from public.indicadores_admin()'))

    expect(rows[0]).toMatchObject({ total_usuarios: 3, chamados_abertos: 3, chamados_respondidos: 2 })
  })

  it('o Aluno não acessa os indicadores nem a lista de usuários (CA26.2 e CA33.3)', async () => {
    await expect(comoUsuario(ALUNO, () => db.query('select * from public.indicadores_admin()'))).rejects.toThrow()
    await expect(comoUsuario(ALUNO, () => db.query('select * from public.listar_usuarios_admin()'))).rejects.toThrow()
  })

  it('a lista de usuários não traz títulos de Focos (CA33.1)', async () => {
    await criarFoco(ALUNO, 'Inglês', 1)

    const { rows } = await comoUsuario(ADMIN, () =>
      db.query<Record<string, unknown>>('select * from public.listar_usuarios_admin()'),
    )

    const aluno = rows.find((linha) => linha.id === ALUNO)
    expect(aluno).toMatchObject({ nome: 'Aluno', email: 'aluno@exemplo.com', total_focos: 1, bloqueado: false })
    expect(JSON.stringify(rows)).not.toContain('Inglês')
  })

  it('o Administrador não lê a tabela de Focos (CA03.4)', async () => {
    await criarFoco(ALUNO, 'Inglês', 1)

    const { rows } = await comoUsuario(ADMIN, () => db.query('select titulo from public.focos'))

    expect(rows).toHaveLength(0)
  })

  it('confere os títulos informados sem exibi-los (CA30.4)', async () => {
    await criarFoco(ALUNO, 'Inglês', 1)
    await criarFoco(ALUNO, 'Redação', 1)

    const { rows } = await comoUsuario(ADMIN, () =>
      db.query<{ conferir_titulos: number }>('select public.conferir_titulos($1, $2)', [
        'aluno@exemplo.com',
        ['inglês', 'Cálculo'],
      ]),
    )

    expect(rows[0].conferir_titulos).toBe(1)
  })
})

describe('alteração de e-mail pelo suporte (RN30.6)', () => {
  it('registra no log apenas o chamado, sem e-mails', async () => {
    await db.query(
      `insert into public.chamados (user_id, categoria, descricao, email_informado, email_contato, nome_informado, titulos_informados)
       values (null, 'acesso_conta', 'Perdi o acesso ao e-mail antigo', 'aluno@exemplo.com', 'contato@exemplo.com', 'Aluno', 'Inglês')`,
    )
    const { rows } = await db.query<{ id: string }>('select id from public.chamados')

    await comoUsuario(ADMIN, () => db.query('select public.registrar_alteracao_email($1)', [rows[0].id]))

    const logs = await db.query<{ detalhes: Record<string, string> }>(
      `select detalhes from public.logs_auditoria where acao = 'alterar_email_suporte'`,
    )
    expect(logs.rows).toEqual([{ detalhes: { chamado_id: rows[0].id } }])
  })

  it('não pode ser registrada por um Aluno nem em outra categoria', async () => {
    await comoUsuario(ALUNO, () =>
      db.query(`insert into public.chamados (categoria, descricao) values ('duvida', 'Pergunta qualquer aqui')`),
    )
    const { rows } = await db.query<{ id: string }>('select id from public.chamados')

    await expect(
      comoUsuario(ALUNO, () => db.query('select public.registrar_alteracao_email($1)', [rows[0].id])),
    ).rejects.toThrow()
    await expect(
      comoUsuario(ADMIN, () => db.query('select public.registrar_alteracao_email($1)', [rows[0].id])),
    ).rejects.toThrow()
  })
})

describe('aceite versionado do Termo de Uso (RF04)', () => {
  it('registra o aceite da versão atual feito no cadastro', async () => {
    await db.query('insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)', [
      NOVO,
      'novo@exemplo.com',
      JSON.stringify({ nome: 'Novo', termo_versao: '1.1' }),
    ])

    const pendente = await comoUsuario(NOVO, () => db.query<{ versao: string | null }>('select public.termo_pendente() as versao'))
    const logs = await db.query(`select 1 from public.logs_auditoria where user_id = $1 and acao = 'aceitar_termo'`, [NOVO])

    expect(pendente.rows[0].versao).toBeNull()
    expect(logs.rows).toHaveLength(1)
  })

  it('pede o aceite a quem ainda não aceitou a versão atual', async () => {
    const { rows } = await comoUsuario(ALUNO, () => db.query<{ versao: string | null }>('select public.termo_pendente() as versao'))

    expect(rows[0].versao).toBe('1.1')
  })

  it('aceita uma única vez por versão e registra no log', async () => {
    await comoUsuario(ALUNO, () => db.query('select public.aceitar_termo()'))
    await comoUsuario(ALUNO, () => db.query('select public.aceitar_termo()'))

    const aceites = await db.query('select versao from public.aceites_termo where user_id = $1', [ALUNO])
    const logs = await db.query(`select detalhes from public.logs_auditoria where user_id = $1 and acao = 'aceitar_termo'`, [ALUNO])
    const pendente = await comoUsuario(ALUNO, () => db.query<{ versao: string | null }>('select public.termo_pendente() as versao'))

    expect(aceites.rows).toEqual([{ versao: '1.1' }])
    expect(logs.rows).toEqual([{ detalhes: { versao: '1.1' } }])
    expect(pendente.rows[0].versao).toBeNull()
  })

  it('não aceita uma versão antiga informada no cadastro', async () => {
    await db.query('insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)', [
      NOVO,
      'novo@exemplo.com',
      JSON.stringify({ nome: 'Novo', termo_versao: '1.0' }),
    ])

    const { rows } = await comoUsuario(NOVO, () => db.query<{ versao: string | null }>('select public.termo_pendente() as versao'))

    expect(rows[0].versao).toBe('1.1')
  })

  it('o usuário não grava aceites diretamente nem vê os de outros', async () => {
    await comoUsuario(ADMIN, () => db.query('select public.aceitar_termo()'))

    await expect(
      comoUsuario(ALUNO, () => db.query(`insert into public.aceites_termo (versao) values ('1.1')`)),
    ).rejects.toThrow()
    const { rows } = await comoUsuario(ALUNO, () => db.query('select * from public.aceites_termo'))

    expect(rows).toHaveLength(0)
  })
})

describe('logs de auditoria (RF08)', () => {
  it('o usuário não altera nem exclui os próprios logs (CA08.3)', async () => {
    await comoUsuario(ALUNO, () =>
      db.query(`insert into public.logs_auditoria (user_id, acao) values ($1, 'login')`, [ALUNO]),
    )

    await expect(comoUsuario(ALUNO, () => db.query(`update public.logs_auditoria set acao = 'x'`))).rejects.toThrow()
    await expect(comoUsuario(ALUNO, () => db.query('delete from public.logs_auditoria'))).rejects.toThrow()
  })
})

describe('exclusão da conta (RF07)', () => {
  it('a exclusão no serviço de autenticação remove perfil, Focos, sessões, chamados e logs (RN07.1)', async () => {
    const foco = await criarFoco(ALUNO, 'Inglês', 1)
    await criarSessao(foco, 1)
    await comoUsuario(ALUNO, () =>
      db.query(`insert into public.chamados (categoria, descricao) values ('duvida', 'Pergunta sobre a pilha')`),
    )
    await db.query(`insert into public.logs_auditoria (user_id, acao) values ($1, 'login')`, [ALUNO])

    await db.query('delete from auth.users where id = $1', [ALUNO])

    const contagens = await db.query<{ total: number }>(
      `select (select count(*) from public.user_profiles where id = $1)
            + (select count(*) from public.focus_sessions)
            + (select count(*) from public.chamados where user_id = $1)
            + (select count(*) from public.logs_auditoria where user_id = $1) as total`,
      [ALUNO],
    )
    expect(Number(contagens.rows[0].total)).toBe(0)
  })
})
