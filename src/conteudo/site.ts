import { COR_PADRAO_FOCO, PALETA_FOCO } from '../services/opcoesFoco'

export type PaginaPublica = 'inicio' | 'metodo' | 'funcionalidades' | 'sobre' | 'comecar' | 'termo'

export const PAGINAS_DO_MENU: { pagina: PaginaPublica; rotulo: string }[] = [
  { pagina: 'inicio', rotulo: 'Início' },
  { pagina: 'metodo', rotulo: 'Método' },
  { pagina: 'funcionalidades', rotulo: 'Funcionalidades' },
  { pagina: 'sobre', rotulo: 'Sobre nós' },
  { pagina: 'comecar', rotulo: 'Comece agora' },
]

function corDaPaleta(nome: string): string {
  return PALETA_FOCO.find((cor) => cor.nome === nome)?.hex ?? COR_PADRAO_FOCO
}

export const CORES_DOS_FOCOS = {
  azul: COR_PADRAO_FOCO,
  roxo: corDaPaleta('Roxo'),
  verde: corDaPaleta('Verde'),
  ciano: corDaPaleta('Ciano'),
  rosa: corDaPaleta('Rosa'),
  dourado: '#f5b83d',
  neutro: '#8a8a90',
}

export const CORES_DOS_PILARES = {
  filtrar: '#4d8dff',
  organizar: '#a77bff',
  concentrar: '#22c7d9',
  observar: '#3ecf8e',
}

export interface Pilar {
  letra: string
  palavra: string
  cor: string
  rotulo: string
  titulo: string
  texto: string
  numeros: { valor: string; legenda: string }[]
  detalhes: { titulo: string; linhas: string[] }[]
}

export const PILARES: Pilar[] = [
  {
    letra: 'F',
    palavra: 'Filtrar',
    cor: CORES_DOS_PILARES.filtrar,
    rotulo: 'Pilar 1 · Filtrar',
    titulo: 'Menos coisas. Mais clareza.',
    texto:
      'Quem tem muitos interesses costuma tentar estudar tudo ao mesmo tempo e não chega a finalizar nada. O primeiro passo do F.O.C.O é filtrar: escolher o nome, o tempo e os motivos para finalizar o seu objetivo.',
    numeros: [
      { valor: '6', legenda: 'metas de tempo, de 1 semana a 1 ano' },
      { valor: '200', legenda: 'caracteres para anotar os seus motivos' },
    ],
    detalhes: [
      {
        titulo: 'Nome e meta de horas',
        linhas: ['Dê ao objetivo um nome de até 40 caracteres.', 'Escolha a meta: de 168 h (1 semana) a 8.760 h (1 ano).'],
      },
      {
        titulo: 'Seus motivos',
        linhas: ['Anote nas observações por que esse Foco importa.', 'O progresso mostra quanto falta para finalizar.'],
      },
    ],
  },
  {
    letra: 'O',
    palavra: 'Organizar',
    cor: CORES_DOS_PILARES.organizar,
    rotulo: 'Pilar 2 · Organizar',
    titulo: 'Cada Foco no seu lugar.',
    texto:
      'Seus objetivos viram Focos, com meta de horas e progresso. Você define a ordem da pilha, escolhe a cor de cada um e decide qual merece a Estrela Dourada.',
    numeros: [
      { valor: '1', legenda: 'Estrela Dourada por vez' },
      { valor: '10 h', legenda: 'de estudo para um Foco poder receber a Estrela' },
    ],
    detalhes: [
      {
        titulo: 'Pilha de prioridades',
        linhas: ['A ordem é decisão sua, não da data de criação.', 'Mude a posição de qualquer Foco pelo menu do card.'],
      },
      {
        titulo: 'Estrela Dourada',
        linhas: ['Marca a prioridade máxima e fixa o Foco no topo.', 'Só para Focos do Top 3 com 10 h ou mais de estudo.'],
      },
    ],
  },
  {
    letra: 'C',
    palavra: 'Concentrar',
    cor: CORES_DOS_PILARES.concentrar,
    rotulo: 'Pilar 3 · Concentrar',
    titulo: 'Uma coisa de cada vez.',
    texto:
      'Você escolhe o Foco e o tempo da sessão. Durante o timer, o app fica bloqueado e não existe botão de "concluir antes": a sensação de dever cumprido vem de terminar o que você mesmo se propôs.',
    numeros: [
      { valor: '5–180', legenda: 'minutos por sessão, você escolhe' },
      { valor: '0', legenda: 'botões para concluir antes do fim' },
    ],
    detalhes: [
      { titulo: 'Timer de foco', linhas: ['Atalhos de 25, 50 e 90 minutos.', 'Pause e retome; o tempo pausado não conta.'] },
      {
        titulo: 'Janela flutuante',
        linhas: ['O timer fica por cima dos outros programas.', 'Leia, assista à aula ou anote sem perder o tempo de vista.'],
      },
    ],
  },
  {
    letra: 'O',
    palavra: 'Observar',
    cor: CORES_DOS_PILARES.observar,
    rotulo: 'Pilar 4 · Observar',
    titulo: 'Veja o seu progresso de verdade.',
    texto:
      'Metacognição é pensar sobre como você aprende. Ao fim de cada sessão você registra o que aprendeu, e a área Observar mostra para onde foi o seu tempo, com gráficos e o mapa de constância.',
    numeros: [
      { valor: '12', legenda: 'semanas no mapa de constância' },
      { valor: '6', legenda: 'semanas de evolução no gráfico' },
    ],
    detalhes: [
      { titulo: 'Estatísticas', linhas: ['Tempo total, média por sessão e tempo por Foco.', 'Filtre tudo por um Foco específico.'] },
      { titulo: 'O que você aprendeu', linhas: ['Um registro curto ao fim de cada sessão.', 'Privado: só você vê.'] },
    ],
  },
]

export type VisualDoDestaque = 'focos' | 'top3' | 'estrela' | 'timer' | 'laboratorio' | 'observar'

export interface Destaque {
  id: VisualDoDestaque
  titulo: string
  texto: string
  tom: string
}

export const DESTAQUES: Destaque[] = [
  {
    id: 'focos',
    titulo: 'Focos',
    texto: 'Cada objetivo de estudo vira um Foco, com meta de horas e progresso calculado a partir das suas sessões.',
    tom: '#1f3366',
  },
  {
    id: 'top3',
    titulo: 'Top 3',
    texto: 'Só as três primeiras posições da pilha ganham destaque. Prioridade de verdade é pouca coisa por vez.',
    tom: '#3b2a63',
  },
  {
    id: 'estrela',
    titulo: 'Estrela Dourada',
    texto:
      'A prioridade máxima. Só um Foco do Top 3 com pelo menos 10 h de estudo pode recebê-la, deixando o Foco priorizado e fixado na 1ª posição.',
    tom: '#5a4214',
  },
  {
    id: 'timer',
    titulo: 'Concentrar',
    texto: 'Sessões de 5 a 180 minutos, com o app bloqueado e uma janela flutuante que fica por cima de tudo.',
    tom: '#0e3a44',
  },
  {
    id: 'laboratorio',
    titulo: 'Laboratório de Sonhos',
    texto: 'Focos deixados de lado não viram fracasso: ficam arquivados com todas as horas, prontos para serem resgatados.',
    tom: '#2b2f3a',
  },
  {
    id: 'observar',
    titulo: 'Observar',
    texto: 'Gráficos, mapa de constância e os seus registros de aprendizado para enxergar o próprio progresso.',
    tom: '#14463a',
  },
]

export const OPCOES_DE_COMPARACAO = [
  { id: 'caderno', rotulo: 'Caderno' },
  { id: 'agenda', rotulo: 'Agenda de papel' },
  { id: 'lista', rotulo: 'Lista no celular' },
  { id: 'planilha', rotulo: 'Planilha' },
] as const

export type MetodoAtual = (typeof OPCOES_DE_COMPARACAO)[number]['id']

export const RECURSOS_COMPARADOS: {
  id: string
  numero?: { valor: number; sufixo?: string }
  titulo: string
  legenda: string
  tem: Record<MetodoAtual, boolean>
}[] = [
  {
    id: 'top3',
    numero: { valor: 3 },
    titulo: 'Focos em destaque no Top 3',
    legenda: 'Prioridade limitada de propósito',
    tem: { caderno: false, agenda: false, lista: false, planilha: false },
  },
  {
    id: 'estrela',
    numero: { valor: 10, sufixo: ' h' },
    titulo: 'de estudo para liberar a Estrela',
    legenda: 'Prioridade só depois de constância',
    tem: { caderno: false, agenda: false, lista: false, planilha: false },
  },
  {
    id: 'timer',
    titulo: 'Timer sem "concluir antes"',
    legenda: 'Com janela flutuante sobre os outros programas',
    tem: { caderno: false, agenda: false, lista: false, planilha: false },
  },
  {
    id: 'observar',
    titulo: 'Gráficos e mapa de constância',
    legenda: 'Tempo por Foco, por semana e por dia',
    tem: { caderno: false, agenda: false, lista: false, planilha: true },
  },
  {
    id: 'laboratorio',
    titulo: 'Laboratório de Sonhos',
    legenda: 'Arquivar sem perder as horas estudadas',
    tem: { caderno: false, agenda: false, lista: false, planilha: false },
  },
  {
    id: 'aprendi',
    titulo: 'Registro "O que você aprendeu"',
    legenda: 'Uma reflexão ao fim de cada sessão',
    tem: { caderno: true, agenda: true, lista: true, planilha: true },
  },
]

export const TCC = {
  autor: 'Guilherme Ramires Lana',
  curso: 'Sistemas de Informação',
  universidade: 'Universidade de Mogi das Cruzes (UMC)',
  orientador: 'Prof. Leandro Miranda de Almeida',
  coorientador: 'Prof. Alessandro Aparecido da Silva Horas',
  ano: '2026',
}
