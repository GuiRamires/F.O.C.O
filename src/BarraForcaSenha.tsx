import { calcularForcaSenha, validarSenha } from './services/validarSenha'

interface BarraForcaSenhaProps {
  senha: string
  nome: string
  email: string
  id?: string
}

const CONFIG_NIVEL = {
  fraca: { segmentos: 1, label: 'Fraca' },
  media: { segmentos: 2, label: 'Média' },
  boa: { segmentos: 3, label: 'Boa' },
  excelente: { segmentos: 4, label: 'Excelente' },
}

const REQUISITOS = [
  { texto: '8 a 20 caracteres', erros: ['A senha deve ter entre 8 e 20 caracteres.'] },
  { texto: 'Uma letra maiúscula', erros: ['A senha deve conter ao menos uma letra maiúscula.'] },
  { texto: 'Uma letra minúscula', erros: ['A senha deve conter ao menos uma letra minúscula.'] },
  { texto: 'Um número', erros: ['A senha deve conter ao menos um número.'] },
  { texto: 'Sem sequências (como 1234)', erros: ['A senha não deve conter sequências óbvias, como 1234 ou abcd.'] },
  {
    texto: 'Sem o seu nome ou e-mail',
    erros: ['A senha não deve conter seu nome.', 'A senha não deve conter parte do seu e-mail.'],
  },
]

function BarraForcaSenha({ senha, nome, email, id }: BarraForcaSenhaProps) {
  const { erros } = validarSenha(senha, nome, email)
  const nivel = senha ? CONFIG_NIVEL[calcularForcaSenha(senha, nome, email)] : null

  return (
    <>
      {nivel && (
        <div className="foco-forca" aria-live="polite">
          <div className="foco-forca__barra" data-nivel={nivel.segmentos}>
            {[1, 2, 3, 4].map((segmento) => (
              <span key={segmento} className={segmento <= nivel.segmentos ? 'foco-forca__segmento--ativo' : ''} />
            ))}
          </div>
          <small>{nivel.label}</small>
        </div>
      )}
      <ul id={id} className="foco-requisitos">
        {REQUISITOS.map((requisito) => {
          const atendido = senha.length > 0 && !requisito.erros.some((erro) => erros.includes(erro))
          return (
            <li key={requisito.texto} className={atendido ? 'foco-requisitos__item--ok' : ''}>
              <span aria-hidden="true">{atendido ? '✓' : '•'}</span> {requisito.texto}
            </li>
          )
        })}
      </ul>
    </>
  )
}

export default BarraForcaSenha
