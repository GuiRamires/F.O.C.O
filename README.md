# F.O.C.O.

**Plataforma Web para Gestão de Múltiplos Interesses, Aprendizagem Autodirigida e Organização de Prioridades Pessoais**

Projeto Final de Curso (PFC) — Bacharelado em Sistemas de Informação, Universidade de Mogi das Cruzes (UMC).

---

## O problema

Pessoas curiosas e multidisciplinares costumam acumular vários interesses ao mesmo tempo como hobbies, cursos, projetos pessoais e acabam se dispersando entre eles. Essa fragmentação de energia cognitiva gera sobrecarga, abandono recorrente de iniciativas e uma sensação crônica de improdutividade e culpa.

Ferramentas tradicionais de produtividade (listas de tarefas, planners) tratam todos os itens com a mesma urgência e rigidez, o que gera ansiedade e poluição visual em vez de ajudar na tomada de decisão consciente.

## A proposta

O **F.O.C.O.** (Filtrar, Organizar, Concentrar, Observar) é uma plataforma web que atua como uma "bússola comportamental": em vez de ser mais um gerenciador genérico de listas, ela usa **travas de UX desenhadas intencionalmente** para limitar o excesso de escolhas e induzir a execução real — sem mecânicas punitivas, e sem descartar projetos pausados.

### O método, em 4 etapas

**Filtrar** — cadastro rápido de novas ideias, que entram obrigatoriamente em estado de "quarentena", sem virar prioridade de imediato
**Organizar** — pilha visual de Focos ativos, com atribuição de **Estrela Dourada** (prioridade máxima) restrita a apenas 1 item por vez dentro do Top 3
**Concentrar** — timer de execução com bloqueio de conclusões precipitadas e registro obrigatório de evidência de aprendizado ao final
**Observar** — dashboard de consistência e evolução por Foco

## Público-alvo

Jovens adultos e estudantes com múltiplos interesses pessoais, acadêmicos e profissionais que têm dificuldade em estabelecer prioridades e manter o acompanhamento contínuo de seus objetivos de aprendizagem.

## Tecnologias

| Camada | Tecnologia |
|---|---|
| **Front-end** | React.js (Vite) + TypeScript + Tailwind CSS |
| **Back-end** | Supabase (BaaS — Backend as a Service) |
| **Banco de dados** | PostgreSQL (via Supabase) |
| **Autenticação e segurança** | Supabase Auth + Row Level Security (RLS) |
| **Versionamento** | Git + GitHub |
| **Deploy** | Vercel (front-end) + Supabase Cloud (banco/auth) |

### Por que essa stack

O Supabase foi escolhido como BaaS para eliminar a necessidade de um servidor intermediário dedicado, permitindo acesso direto do cliente via SDK — com autenticação via JWT e controle de acesso a nível de linha (RLS), garantindo que cada usuário só acesse seus próprios dados.

## Arquitetura

O projeto segue uma separação estrita em 3 camadas:

```
Controllers  →  coordenam requisições da interface
Services     →  concentram as regras de negócio
Repositories →  acessam diretamente o Supabase/banco de dados
```

Essa separação é uma decisão arquitetural deliberada — cada regra de negócio crítica (como as travas da Estrela Dourada) vive isolada na camada de Service, independente de como a interface é construída.

## Regra de negócio em destaque: a Estrela Dourada

Um dos pilares comportamentais do F.O.C.O. é a trava de priorização da **Estrela Dourada**:

Apenas os 3 primeiros cards da pilha (**Top 3**) podem receber a Estrela
A Estrela é única — apenas um Foco pode tê-la por vez
Um Foco só pode **receber** a Estrela após acumular no mínimo **10 horas** de timer concluído e relatado — impedindo que uma ideia impulsiva vire prioridade máxima antes de provar constância
Retirar a Estrela de um Foco dispara uma **confirmação reflexiva**, e o Foco é movido para o **Laboratório de Sonhos** (não é excluído — fica em estado de espera, resgatável a qualquer momento)
A exclusão definitiva de um Foco só é permitida dentro do Laboratório de Sonhos, mediante confirmação digitada — nunca a partir da pilha principal

## Escopo do MVP

**Incluído:**
Autenticação de usuários
Cadastro de ideias em quarentena (Filtrar)
Pilha visual com prioridade única no Top 3 (Organizar)
Timer de concentração com bloqueio de conclusão precipitada (Concentrar)
Laboratório de Sonhos com congelamento reflexivo
Registro de evidências de aprendizado e dashboard de consistência (Observar)

**Fora do escopo:**
Aplicativo nativo mobile (iOS/Android)
Integração com calendários externos
Recursos de rede social/compartilhamento público
Recomendação de rotina via IA

## Rodando o projeto localmente

### Pré-requisitos
Node.js instalado
Conta no Supabase com um projeto criado

### Passos

```bash
# Clonar o repositório
git clone https://github.com/GuiRamires/F.O.C.O.git
cd F.O.C.O

# Instalar dependências
npm install

# Criar o arquivo .env na raiz do projeto com:
# VITE_SUPABASE_URL=sua_url_aqui
# VITE_SUPABASE_ANON_KEY=sua_chave_publica_aqui

# Rodar o servidor de desenvolvimento
npm run dev
```

O schema do banco de dados está versionado em `supabase/migrations/`.

## Contexto acadêmico

Este projeto é desenvolvido como Projeto Final de Curso (PFC) para o Bacharelado em Sistemas de Informação da UMC, sob orientação do Prof. Alessandro Aparecido da Silva Horas.

---

**Autor:** Guilherme Ramires Lana
