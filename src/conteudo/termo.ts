import { VERSAO_DO_TERMO } from '../services/termoService'

export const TEXTO_TERMOS = `
Termo de Uso e Política de Privacidade — F.O.C.O.

Versão ${VERSAO_DO_TERMO} — 23/11/2026

PARTE 1 — TERMOS DE USO

1.1 Descrição, finalidade e limitações do serviço

O F.O.C.O. (Filtrar, Organizar, Concentrar e Observar) é uma plataforma web de gestão de estudos e organização de prioridades pessoais, desenvolvida como protótipo acadêmico. Suas funcionalidades permitem: criar uma conta de Aluno; cadastrar objetivos de estudo ("Focos") e organizá-los em uma pilha de prioridades; realizar sessões de estudo com temporizador e registrar o que foi aprendido; acompanhar estatísticas de estudo; exportar os próprios dados; e abrir chamados de suporte.

Por se tratar de um protótipo em desenvolvimento contínuo, o serviço não garante disponibilidade contínua nem backup permanente dos dados. O suporte é prestado pelo canal de chamados, com prazo estimado de resposta de até 5 dias úteis, sem garantia formal. Não deve ser utilizado como única ferramenta de registro de informações críticas.

1.2 Quem pode utilizar o sistema

O uso do F.O.C.O. é destinado a pessoas com 18 anos completos ou mais. Não há, no momento, mecanismos de verificação de idade nem controles específicos para uso por crianças e adolescentes.

1.3 Criação e proteção da conta e perfis

O cadastro exige nome, e-mail, digitado duas vezes, e senha. Todo cadastro cria uma conta com o perfil Aluno. O perfil Administrador existe para a gestão técnica da plataforma e não pode ser obtido pelo cadastro.

Cada perfil tem acesso a funcionalidades e dados distintos:
- Aluno: acessa e gerencia exclusivamente seus próprios Focos, sessões de estudo, registros de aprendizado e chamados de suporte.
- Administrador: acessa indicadores agregados da plataforma, a lista de usuários com dados mínimos (nome, e-mail, datas de cadastro e de último acesso, situação da conta e quantidade de Focos) e os chamados de suporte. Não acessa os títulos, as observações, as sessões nem os registros de aprendizado dos alunos.

O usuário é responsável por manter sua senha em sigilo e por todas as atividades realizadas em sua conta. Em caso de suspeita de uso indevido, ou durante a análise de um pedido de recuperação de acesso, a conta pode ser bloqueada temporariamente.

1.4 Responsabilidades do usuário e condutas proibidas

O usuário compromete-se a fornecer informações verdadeiras no cadastro e a não utilizar a plataforma para fins ilícitos, incluindo tentativas de acesso não autorizado a dados de outros usuários, de burlar os mecanismos de segurança do sistema ou de usar o suporte para o envio de mensagens abusivas ou em massa.

1.5 Conteúdo enviado pelo usuário

Os títulos, observações e registros de aprendizado inseridos pelo usuário em seus Focos e sessões de estudo permanecem de sua titularidade. O F.O.C.O. armazena esse conteúdo exclusivamente para viabilizar o funcionamento do serviço, sem finalidade de reutilização, publicação ou compartilhamento com terceiros. Recomendamos não incluir dados sensíveis, como informações de saúde, religião, opinião política ou documentos, nos campos de texto livre, inclusive nos chamados de suporte.

1.6 Indisponibilidade, manutenção e encerramento

O serviço pode ficar indisponível por motivos de manutenção, falhas técnicas ou descontinuação do projeto acadêmico. O usuário pode exportar seus dados e excluir a conta a qualquer momento, na área Minha conta.

1.7 Legislação aplicável

Este Termo é regido pelas leis brasileiras, em especial pela Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais — LGPD).



PARTE 2 — POLÍTICA DE PRIVACIDADE

2.1 Responsável pelo tratamento (controlador)

Para fins deste protótipo acadêmico, o controlador dos dados é o desenvolvedor responsável pelo projeto: Guilherme Ramires Lana, sob orientação do Prof. Leandro Miranda de Almeida (UMC). Em uma eventual implantação real e comercial do F.O.C.O., o controlador seria a pessoa jurídica responsável pela operação da plataforma.

Canal de contato para assuntos de privacidade: aba Suporte da plataforma, categoria Privacidade e dados, ou o e-mail gu1.r4m1r3s@gmail.com.

2.2 Dados pessoais tratados

| Categoria | Dados específicos | Onde é coletado |

| Identificação e contato | Nome e e-mail | Cadastro e Minha conta |
| Credenciais de acesso | Senha, armazenada apenas como hash criptográfico | Cadastro, Minha conta e recuperação de senha |
| Dados de uso da plataforma | Títulos, metas, cores e observações dos Focos; data e duração das sessões; registros de aprendizado | Telas de Focos e de sessões |
| Suporte | Categoria, descrição e respostas dos chamados e, no chamado sem login, o e-mail de contato | Formulários de suporte |
| Registros de auditoria | Tipo da ação, data e hora, identificador do Foco e dados da mudança, sem textos digitados | Gerados automaticamente |
| Dados técnicos de acesso | Endereço IP e informações do navegador | Registros dos provedores de infraestrutura |

Não coletamos: CPF, endereço completo, data de nascimento, fotografia, dados de geolocalização, dados de saúde, dados biométricos ou qualquer dado sensível nos termos do artigo 5º, II, da LGPD.

2.3 Finalidades e hipóteses legais

| Dado | Finalidade específica | Hipótese legal |

| Nome, e-mail e senha | Autenticar o acesso à conta e identificar o usuário na plataforma | Execução de contrato (art. 7º, V) |
| E-mail | Enviar a confirmação de cadastro, os códigos de verificação, os avisos de inatividade e os avisos de resposta do suporte | Execução de contrato (art. 7º, V) |
| Focos, sessões e registros de aprendizado | Viabilizar a funcionalidade principal do serviço | Execução de contrato (art. 7º, V) |
| Chamados de suporte | Atender às solicitações dos usuários, inclusive aos pedidos do titular | Execução de contrato (art. 7º, V) e cumprimento de obrigação legal (art. 7º, II) |
| Registros de auditoria e dados técnicos | Garantir a segurança, prevenir fraudes e permitir a rastreabilidade das ações | Legítimo interesse (art. 7º, IX) |

Não utilizamos o consentimento como base legal. O aceite deste Termo registra a ciência do usuário sobre as regras de uso e de tratamento, e cada finalidade acima está associada à hipótese legal que efetivamente a sustenta.

2.4 Compartilhamento e serviços de terceiros

O F.O.C.O. utiliza os seguintes provedores de infraestrutura, que atuam como operadores no tratamento dos dados:

| Serviço | Finalidade | Dados enviados |

| Supabase (Supabase Inc.) | Banco de dados, autenticação de usuários, funções do servidor (Edge Functions) e rotinas agendadas | Todos os dados listados no item 2.2 |
| Resend (Resend, Inc.) | Envio dos e-mails da plataforma: confirmação de cadastro, códigos de verificação e avisos | Nome, e-mail e o conteúdo de cada mensagem, como o código ou o título do Foco no aviso de inatividade |
| Vercel (Vercel Inc.) | Hospedagem da interface da plataforma | Dados técnicos de acesso (endereço IP e informações do navegador) |

Não utilizamos serviços de inteligência artificial que processem dados pessoais dos usuários da plataforma, nem realizamos qualquer outro compartilhamento de dados com terceiros para fins comerciais ou publicitários.

2.5 Transferência internacional

Supabase Inc., Resend, Inc. e Vercel Inc. são empresas com infraestrutura tecnológica que pode estar localizada fora do Brasil, incluindo os Estados Unidos. Isso significa que os dados pessoais tratados pela plataforma podem ser processados ou armazenados em servidores localizados em outros países, nos termos do artigo 33 da LGPD. Essas empresas adotam políticas próprias de proteção de dados compatíveis com padrões internacionais de segurança.

2.6 Cookies e armazenamento local

O F.O.C.O. utiliza apenas o armazenamento estritamente necessário ao funcionamento da plataforma: o token de autenticação, gerenciado pelo Supabase Auth, e, durante uma sessão de foco, os dados da sessão em andamento (Foco escolhido e horários de início e de pausa), apagados do navegador após a gravação da sessão concluída. Não utilizamos cookies de rastreamento, publicidade ou análise comportamental de terceiros.

2.7 Retenção e descarte

| Categoria | Prazo ou critério | Destino |

| Conta (nome, e-mail e senha) | Enquanto a conta estiver ativa | Eliminada com a exclusão da conta |
| Focos, sessões e registros de aprendizado | Enquanto a conta estiver ativa, ou até a exclusão do Foco | Eliminados em cascata com a exclusão da conta |
| Chamados de suporte | Enquanto a conta estiver ativa; no chamado sem login, até 6 meses após o encerramento | Eliminados com a conta ou ao fim do prazo |
| Registros de auditoria | Enquanto a conta estiver ativa | Eliminados em cascata com a exclusão da conta |
| Contas de teste e demonstração | Até o encerramento do projeto acadêmico | Eliminadas |

A exclusão da conta pode ser feita pelo próprio usuário, na área Minha conta, e resulta na remoção definitiva dos dados listados acima do banco de dados de produção.

2.8 Direitos dos titulares

Nos termos do artigo 18 da LGPD, o titular dos dados pode exercer os direitos abaixo. Os três primeiros estão disponíveis diretamente na plataforma, e os demais podem ser solicitados pelo canal indicado no item 2.1:
- Confirmação da existência de tratamento, acesso aos dados e portabilidade, pela opção "Exportar meus dados";
- Correção de dados incompletos, inexatos ou desatualizados, na área Minha conta;
- Eliminação dos dados, pela opção "Excluir conta";
- Informação sobre as entidades com as quais o controlador compartilhou dados (item 2.4);
- Oposição a tratamento realizado com base no legítimo interesse, quando cabível.

2.9 Segurança da informação

Adotamos as seguintes medidas técnicas:
- Senhas armazenadas exclusivamente como hash criptográfico, por meio do Supabase Auth;
- Comunicação entre cliente e servidor realizada via HTTPS;
- Controle de acesso em nível de linha no banco de dados (Row Level Security), garantindo que cada usuário só acesse seus próprios dados e que o perfil administrativo não acesse o conteúdo dos estudos dos alunos;
- Chaves secretas de serviços externos e a chave administrativa do banco de dados armazenadas como segredo do servidor, nunca expostas no código executado no navegador;
- Política de senha que exige composição mínima e rejeita sequências e dados pessoais óbvios;
- Códigos de verificação de uso único, com validade limitada e limite de solicitações, e confirmação no e-mail atual e no novo para a troca de e-mail;
- Registros de auditoria que não podem ser alterados pelos usuários e que não guardam textos digitados.

Recomendações de segurança ao usuário: utilize senhas com pelo menos 8 caracteres, combinando letras maiúsculas, minúsculas e números; evite senhas baseadas em dados pessoais (nome, datas) ou sequências previsíveis; não reutilize a mesma senha em diferentes serviços.

2.10 Resposta a incidentes de segurança

Em caso de incidente de segurança que envolva risco ou dano relevante aos titulares, o responsável pelo projeto compromete-se a identificar os dados e os titulares afetados, avaliar a extensão do risco, corrigir a causa do incidente e comunicar os titulares afetados e a Autoridade Nacional de Proteção de Dados (ANPD) no prazo previsto em sua regulamentação.

2.11 Limitações reconhecidas deste protótipo acadêmico

Em caráter de transparência, reconhecemos as seguintes limitações da presente versão, a serem endereçadas em iterações futuras do projeto:
- O login não exige um segundo fator de autenticação;
- A recuperação de acesso de quem perdeu o e-mail cadastrado é feita pelo suporte, com verificação baseada em informações da conta, e não em documentos.

2.12 Alterações desta política

Esta política pode ser atualizada para refletir mudanças no sistema ou na legislação aplicável. A data e o número de versão constam no topo deste documento, e as alterações relevantes serão informadas na plataforma.

Última atualização: 23/11/2026.
`.trim()
