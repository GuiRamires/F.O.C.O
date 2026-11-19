import {
  enviarChamadoSemLogin,
  inserirChamado,
  listarChamadosDoUsuario,
  type Chamado,
  type DadosChamadoSemLogin,
} from '../repositories/suporteRepository'
import { validarEmail } from './contaService'
import { registrarLog } from './logService'

export const LIMITE_MINIMO_DESCRICAO = 10
export const LIMITE_DESCRICAO = 1000

export const CATEGORIAS_CHAMADO = [
  { valor: 'acesso_conta', rotulo: 'Acesso à conta' },
  { valor: 'problema_tecnico', rotulo: 'Problema técnico' },
  { valor: 'duvida', rotulo: 'Dúvida' },
  { valor: 'sugestao', rotulo: 'Sugestão' },
  { valor: 'privacidade_dados', rotulo: 'Privacidade e dados' },
] as const

export const SITUACOES_CHAMADO = [
  { valor: 'aberto', rotulo: 'Aberto' },
  { valor: 'em_andamento', rotulo: 'Em andamento' },
  { valor: 'respondido', rotulo: 'Respondido' },
  { valor: 'encerrado', rotulo: 'Encerrado' },
] as const

export const MENSAGEM_CHAMADO_SEM_LOGIN =
  'Recebemos sua solicitação. Se houver uma conta com o e-mail informado, a resposta será enviada ao e-mail de contato em até 5 dias úteis.'

export function mensagemChamadoSemLogin(numero: number | null): string {
  if (numero === null) return MENSAGEM_CHAMADO_SEM_LOGIN
  return `Pedido registrado como chamado nº ${numero}. ${MENSAGEM_CHAMADO_SEM_LOGIN}`
}

export const ORIENTACAO_DADOS_SENSIVEIS =
  'Não informe senhas, documentos ou outros dados sensíveis na descrição.'

const PERMITIDOS_NA_DESCRICAO = /[^A-Za-záàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ0-9 \n.,!?():;-]/g
const PERMITIDOS_NA_VERIFICACAO = /[^A-Za-záàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ0-9 .,!?():;/-]/g

export const LIMITE_NOME_INFORMADO = 80
export const LIMITE_DATA_INFORMADA = 40
export const LIMITE_TITULOS_INFORMADOS = 300

export function mascararVerificacao(texto: string, limite: number): string {
  return texto.replace(PERMITIDOS_NA_VERIFICACAO, '').slice(0, limite)
}

export function rotuloDaCategoria(valor: string): string {
  return CATEGORIAS_CHAMADO.find((categoria) => categoria.valor === valor)?.rotulo ?? valor
}

export function rotuloDaSituacao(valor: string): string {
  return SITUACOES_CHAMADO.find((situacao) => situacao.valor === valor)?.rotulo ?? valor
}

export function mascararDescricao(texto: string): string {
  return texto.replace(PERMITIDOS_NA_DESCRICAO, '').slice(0, LIMITE_DESCRICAO)
}

export function validarDescricao(descricao: string): string | null {
  const limpa = descricao.trim()
  if (limpa.length < LIMITE_MINIMO_DESCRICAO) {
    return `Descreva o problema com pelo menos ${LIMITE_MINIMO_DESCRICAO} caracteres.`
  }
  if (limpa.length > LIMITE_DESCRICAO) return `A descrição pode ter até ${LIMITE_DESCRICAO} caracteres.`
  if (mascararDescricao(limpa) !== limpa) {
    return 'Na descrição, use só letras, números, espaços e a pontuação . , ! ? ( ) : ; -'
  }
  return null
}

export function validarCategoria(categoria: string): string | null {
  return CATEGORIAS_CHAMADO.some((item) => item.valor === categoria) ? null : 'Escolha uma categoria.'
}

export function validarChamadoSemLogin(dados: DadosChamadoSemLogin): string[] {
  const erros: string[] = []
  const erroCadastrado = validarEmail(dados.emailCadastrado)
  if (erroCadastrado) erros.push(`E-mail cadastrado: ${erroCadastrado}`)
  const erroContato = validarEmail(dados.emailContato)
  if (erroContato) erros.push(`E-mail de contato: ${erroContato}`)
  if (!dados.nome.trim()) erros.push('Informe o nome usado no cadastro.')
  if (!dados.titulos.trim()) erros.push('Informe o título de pelo menos um Foco.')
  const erroDescricao = validarDescricao(dados.descricao)
  if (erroDescricao) erros.push(erroDescricao)
  return erros
}

export function temRespostaNova(chamado: Chamado): boolean {
  return chamado.status === 'respondido'
}

export async function listarMeusChamados(userId: string): Promise<Chamado[]> {
  return listarChamadosDoUsuario(userId)
}

export async function abrirChamado(
  userId: string,
  categoria: string,
  descricao: string,
): Promise<{ sucesso: boolean; mensagem: string }> {
  const erro = validarCategoria(categoria) ?? validarDescricao(descricao)
  if (erro) return { sucesso: false, mensagem: erro }

  const chamado = await inserirChamado(categoria, descricao.trim())
  await registrarLog(userId, 'abrir_chamado', { chamado_id: chamado.id, categoria })
  return {
    sucesso: true,
    mensagem: `Chamado nº ${chamado.numero} aberto. Você verá a resposta em "Meus chamados" e receberá um aviso por e-mail.`,
  }
}

export async function abrirChamadoSemLogin(dados: DadosChamadoSemLogin): Promise<{ sucesso: boolean; mensagem: string }> {
  const erros = validarChamadoSemLogin(dados)
  if (erros.length > 0) return { sucesso: false, mensagem: erros.join(' ') }

  const resultado = await enviarChamadoSemLogin({
    emailCadastrado: dados.emailCadastrado.trim().toLowerCase(),
    emailContato: dados.emailContato.trim().toLowerCase(),
    nome: dados.nome.trim(),
    dataCadastro: dados.dataCadastro.trim(),
    ultimoAcesso: dados.ultimoAcesso.trim(),
    titulos: dados.titulos.trim(),
    descricao: dados.descricao.trim(),
  })

  if (resultado.situacao === 'limite') {
    return { sucesso: false, mensagem: 'Você já enviou muitas solicitações na última hora. Tente novamente mais tarde.' }
  }

  return { sucesso: true, mensagem: mensagemChamadoSemLogin(resultado.numero) }
}
