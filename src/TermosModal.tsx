
import { useState, useEffect } from 'react'

interface TermosModalProps {
  aberto: boolean
  onAceitar: () => void
  onFechar: () => void
  somenteLeitura?: boolean
}


const TEXTO_TERMOS = `
Termo de Uso e Política de Privacidade — F.O.C.O.

Versão 1.0 — 25/09/2026]

PARTE 1 — TERMOS DE USO

1.1 Descrição, finalidade e limitações do serviço

O F.O.C.O. (Filtrar, Organizar, Concentrar, Observar) é uma plataforma web de gestão de estudos e organização de prioridades pessoais, desenvolvida como protótipo acadêmico. Suas funcionalidades atuais permitem: criar contas de usuário, cadastrar objetivos de estudo ("Focos"), registrar sessões de dedicação a esses objetivos, e acompanhar o progresso percentual rumo às metas definidas pelo próprio usuário.

Por se tratar de um protótipo em desenvolvimento contínuo, o serviço não garante disponibilidade contínua, backup permanente dos dados, nem suporte técnico formal. Não deve ser utilizado como única ferramenta de registro de informações críticas.

1.2 Quem pode utilizar o sistema

O uso do F.O.C.O. é destinado a pessoas com 18 anos completos ou mais. Não há, no momento, mecanismos de verificação de idade nem controles específicos para uso por crianças e adolescentes.

1.3 Criação e proteção da conta, papéis e permissões

O cadastro exige nome, e-mail e senha. Ao se cadastrar, o usuário é registrado com o papel de (Aluno ou Mentor) , conforme escolha própria no momento do cadastro. Um terceiro papel, 9Administrador), existe no sistema para fins de gestão técnica da plataforma, mas não é atribuível por autocadastro - é reservado à equipe responsável pelo desenvolvimento e manutenção do projeto.

Cada papel tem acesso a funcionalidades e dados distintos:

- Aluno: acessa e gerencia exclusivamente seus próprios Focos e sessões de estudo.

- Mentor: neste momento do desenvolvimento, possui a mesma experiência funcional do Aluno; a funcionalidade de acompanhamento de alunos vinculados está prevista para versões futuras e ainda não está implementada.

- Administrador: acessa métricas agregadas e não identificadas do sistema (contagem total de usuários e de Focos cadastrados), para fins de administração da plataforma. Não acessa o conteúdo individual dos Focos de outros usuários.

O usuário é responsável por manter sua senha em sigilo e por todas as atividades realizadas em sua conta.

1.4 Responsabilidades do usuário e condutas proibidas

O usuário compromete-se a fornecer informações verdadeiras no cadastro e a não utilizar a plataforma para fins ilícitos, incluindo tentativas de acesso não autorizado a dados de outros usuários ou de burlar os mecanismos de segurança do sistema.

1.5 Conteúdo enviado pelo usuário

Os títulos, observações e relatos inseridos pelo usuário em seus Focos e sessões de estudo permanecem de sua titularidade. O F.O.C.O. armazena esse conteúdo exclusivamente para viabilizar o funcionamento do serviço, sem finalidade de reutilização, publicação ou compartilhamento com terceiros.

1.6 Indisponibilidade, manutenção e encerramento

O serviço pode ficar indisponível por motivos de manutenção, falhas técnicas ou descontinuação do projeto acadêmico. O usuário pode solicitar o encerramento de sua conta e a exclusão de seus dados a qualquer momento, pelo canal de contato indicado na Parte 2 deste documento.

1.7 Legislação aplicável

Este Termo é regido pelas leis brasileiras, em especial pela Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais — LGPD).



PARTE 2 — POLÍTICA DE PRIVACIDADE

2.1 Responsável pelo tratamento (controlador)

Para fins deste protótipo acadêmico, o controlador dos dados é o desenvolvedor responsável pelo projeto: **Guilherme Ramires Lana**, sob orientação do Prof. Leandro Miranda de Almeida (UMC). Em uma eventual implantação real e comercial do F.O.C.O., o controlador seria a pessoa jurídica responsável pela operação da plataforma.

Canal de contato para assuntos de privacidade**: [gu1.r4m1r3s@gmail.com]

2.2 Dados pessoais tratados

| Categoria | Dados específicos | Onde é coletado |

| Identificação e contato | Nome, e-mail | Formulário de cadastro |
| Credenciais de acesso | Senha (armazenada apenas como hash criptográfico, nunca em texto legível) | Formulário de cadastro |
| Dados de uso da plataforma | Títulos de Focos, meta de horas definida, observações, relatos de sessões de estudo, duração das sessões | Telas de criação de Foco e registro de sessões |
| Papel do usuário | Aluno, Mentor ou Administrador | Definido no cadastro (Aluno/Mentor) ou atribuído administrativamente (Admin) |
| Registros de auditoria | Ação realizada (login, cadastro, criação de Foco, atribuição de prioridade), data e hora | Gerado automaticamente pelo sistema a cada ação relevante |
| Dados técnicos de sessão | Token de autenticação (JWT), data/hora do último login | Gerado pelo Supabase Auth no momento do login |

Não coletamos: CPF, endereço completo, data de nascimento, fotografia, dados de geolocalização, dados de saúde, dados biométricos, ou qualquer dado sensível nos termos do artigo 5º, II, da LGPD.

2.3 Finalidades e hipóteses legais

| Dado | Finalidade específica | Hipótese legal |
|
| Nome, e-mail, senha | Autenticar o acesso à conta e permitir a identificação do usuário dentro da plataforma | Execução de contrato (Art. 7º, V) - necessário para a prestação do serviço solicitado pelo usuário |
| E-mail | Envio de mensagem de confirmação de cadastro | Execução de contrato / legítimo interesse na comunicação sobre o próprio cadastro do usuário |
| Títulos de Focos, metas, observações, sessões | Viabilizar a funcionalidade central da plataforma: organização e acompanhamento dos estudos do próprio usuário | Execução de contrato |
| Papel do usuário | Controlar o acesso às funcionalidades conforme o perfil (Aluno, Mentor, Admin) | Execução de contrato / legítimo interesse na segurança do sistema |
| Registros de auditoria (logs) | Permitir rastreabilidade de ações para fins de segurança e correção de eventuais incidentes | Legítimo interesse do controlador na segurança da plataforma (Art. 7º, IX), com necessidade e proporcionalidade limitadas ao mínimo de dados descrito no item 2.2 |

Não utilizamos consentimento como base legal genérica para todo o tratamento - cada finalidade acima está associada à hipótese legal que efetivamente a sustenta.

2.4 Compartilhamento e serviços de terceiros

O F.O.C.O. utiliza os seguintes provedores de infraestrutura, que atuam como operadores no tratamento dos dados:

| Serviço | Finalidade | Dados enviados |

| Supabase (Supabase Inc.) | Hospedagem do banco de dados, autenticação de usuários e execução do back-end (Edge Functions) | Todos os dados pessoais tratados pela aplicação, listados no item 2.2 |
| Resend (Resend, Inc.) | Envio do e-mail transacional de boas-vindas após o cadastro | Nome e e-mail do usuário, apenas no momento do cadastro |

Não utilizamos serviços de inteligência artificial que processem dados pessoais dos usuários da plataforma, nem realizamos qualquer outro compartilhamento de dados com terceiros para fins comerciais ou publicitários.

2.5 Transferência internacional

Supabase Inc. e Resend, Inc. são empresas com infraestrutura tecnológica que pode estar localizada fora do Brasil (incluindo os Estados Unidos). Isso significa que os dados pessoais tratados pela plataforma podem ser processados ou armazenados em servidores localizados em outros países. Essas empresas adotam políticas próprias de proteção de dados compatíveis com padrões internacionais de segurança.

2.6 Cookies e armazenamento local

O F.O.C.O. utiliza apenas o armazenamento estritamente necessário ao funcionamento da sessão de login (token de autenticação), gerenciado automaticamente pelo Supabase Auth. Não utilizamos cookies de rastreamento, publicidade ou análise comportamental de terceiros.

2.7 Retenção e descarte

| Categoria | Finalidade | Prazo/critério | Destino |

| Conta (nome, e-mail, senha) | Autenticação | Enquanto a conta estiver ativa | Excluído mediante solicitação do titular |
| Focos e sessões de estudo | Funcionalidade principal do serviço | Enquanto a conta estiver ativa | Excluído em cascata junto com a exclusão da conta |
| Registros de auditoria (logs) | Segurança e rastreabilidade | Enquanto a conta estiver ativa | Excluído em cascata junto com a exclusão da conta |
| Dados de contas de teste/demonstração | Testes acadêmicos durante o desenvolvimento do PFC | Somente durante o período de desenvolvimento do projeto | Excluídos ao final do projeto acadêmico |

A exclusão da conta pode ser solicitada pelo canal indicado no item 2.1, e resulta na remoção definitiva dos dados listados acima do banco de dados de produção.

2.8 Direitos dos titulares

Nos termos do artigo 18 da LGPD, o titular dos dados pode solicitar, mediante contato com o canal indicado no item 2.1:
- Confirmação da existência de tratamento e acesso aos seus dados;
- Correção de dados incompletos, inexatos ou desatualizados;
- Eliminação dos dados tratados com consentimento ou quando não mais necessários;
- Informação sobre as entidades com as quais o controlador compartilhou dados (item 2.4);
- Revogação do consentimento, quando aplicável, e informação sobre suas consequências;
- Oposição a tratamento realizado com base em hipótese legal diversa do consentimento, quando cabível.

2.9 Segurança da informação

Adotamos as seguintes medidas técnicas:
- Senhas armazenadas exclusivamente como hash criptográfico (nunca em texto legível), por meio do Supabase Auth;
- Comunicação entre cliente e servidor realizada via HTTPS;
- Controle de acesso a nível de linha no banco de dados (Row Level Security), garantindo que cada usuário só acesse seus próprios dados, e que perfis administrativos só acessem dados agregados e não identificados;
- Chaves de API de serviços externos (Resend) armazenadas como segredo de servidor, nunca expostas no código executado no navegador do usuário;
- Validação de força de senha no cadastro, exigindo composição mínima e rejeitando sequências e dados pessoais óbvios.

Recomendações de segurança ao usuário: utilize senhas com pelo menos 8 caracteres, combinando letras maiúsculas, minúsculas e números; evite senhas baseadas em dados pessoais (nome, datas) ou sequências previsíveis; não reutilize a mesma senha em diferentes serviços.

2.10 Resposta a incidentes de segurança

Em caso de incidente de segurança que envolva risco ou dano relevante aos titulares, o responsável pelo projeto compromete-se a: identificar os dados e titulares afetados, avaliar a extensão do risco, corrigir a causa do incidente, e comunicar os titulares afetados e, quando aplicável, a Autoridade Nacional de Proteção de Dados (ANPD), em prazo razoável.

2.11 Limitações reconhecidas deste protótipo acadêmico

Em caráter de transparência, reconhecemos as seguintes limitações da presente versão, a serem endereçadas em iterações futuras do projeto:
- A funcionalidade de exclusão de conta ainda não possui um botão de autoatendimento na interface - solicitações devem ser feitas pelo canal de contato indicado;
- A jornada completa do perfil Mentor (visualização de dados de alunos vinculados) ainda não está implementada.

2.12 Alterações desta política

Esta política pode ser atualizada para refletir mudanças no sistema ou na legislação aplicável. A data e o número de versão constam no topo deste documento.


*Última atualização: [25/09/2025].
`.trim()

function TermosModal({ aberto, onAceitar, onFechar, somenteLeitura = false }: TermosModalProps) {
  const [scrollCompleto, setScrollCompleto] = useState(false)
  useEffect(() => {
  if (aberto) {
    setScrollCompleto(false)
  }
}, [aberto])


  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const chegouAoFim = scrollHeight - scrollTop - clientHeight < 10
    if (chegouAoFim) {
      setScrollCompleto(true)
    }
  }

  if (!aberto) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #444',
          borderRadius: '12px',
          padding: '1.5rem',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h4 style={{ marginBottom: '1rem' }}>Termo de Uso e Política de Privacidade</h4>

        <div
          onScroll={handleScroll}
          style={{
            overflowY: 'auto',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '1rem',
            whiteSpace: 'pre-line',
            fontSize: '0.9rem',
            flex: 1,
            marginBottom: '1rem',
          }}
        >
          {TEXTO_TERMOS}
        </div>

        {!somenteLeitura && !scrollCompleto && (
          <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.75rem' }}>
          Role até o final do texto para habilitar o botão de aceite.
          </p>
        )}

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {somenteLeitura ? (
            <button className="btn btn-outline-light" onClick={onFechar}>
            Fechar
            </button>
          ) : (
            <>
              <button
                className="btn btn-warning"
                onClick={onAceitar}
                disabled={!scrollCompleto}
              >
                Aceitar
              </button>
              <button className="btn btn-outline-light" onClick={onFechar}>
                Fechar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TermosModal