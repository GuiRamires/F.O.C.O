export interface ResultadoValidacaoSenha {
  valida: boolean
  erros: string[]
}

const TAMANHO_MINIMO_TRECHO_PESSOAL = 3

function temSequencia(caracteres: string, tamanhoMinimo = 4): boolean {
  for (let i = 0; i <= caracteres.length - tamanhoMinimo; i++) {
    let crescente = true
    let decrescente = true

    for (let j = 0; j < tamanhoMinimo - 1; j++) {
      const atual = caracteres.charCodeAt(i + j)
      const proximo = caracteres.charCodeAt(i + j + 1)

      if (proximo !== atual + 1) crescente = false
      if (proximo !== atual - 1) decrescente = false
    }

    if (crescente || decrescente) return true
  }
  return false
}

function obterProblemasSenha(senha: string, nome: string, email: string): string[] {
  const problemas: string[] = []

  const temMinuscula = /[a-z]/.test(senha)
  const temMaiuscula = /[A-Z]/.test(senha)
  const temNumero = /[0-9]/.test(senha)
  const tamanhoValido = senha.length >= 8 && senha.length <= 20

  if (!tamanhoValido) {
    problemas.push('A senha deve ter entre 8 e 20 caracteres.')
  }
  if (!temMinuscula) {
    problemas.push('A senha deve conter ao menos uma letra minúscula.')
  }
  if (!temMaiuscula) {
    problemas.push('A senha deve conter ao menos uma letra maiúscula.')
  }
  if (!temNumero) {
    problemas.push('A senha deve conter ao menos um número.')
  }

  const senhaMinuscula = senha.toLowerCase()

  const partesNome = nome
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((parte) => parte.length >= TAMANHO_MINIMO_TRECHO_PESSOAL)

  if (partesNome.some((parte) => senhaMinuscula.includes(parte))) {
    problemas.push('A senha não deve conter seu nome.')
  }

  const usuarioEmail = email.split('@')[0]?.toLowerCase() ?? ''

  if (usuarioEmail.length >= TAMANHO_MINIMO_TRECHO_PESSOAL && senhaMinuscula.includes(usuarioEmail)) {
    problemas.push('A senha não deve conter parte do seu e-mail.')
  }

  if (temSequencia(senhaMinuscula)) {
    problemas.push('A senha não deve conter sequências óbvias, como 1234 ou abcd.')
  }

  return problemas
}

export function validarSenha(senha: string, nome: string, email: string): ResultadoValidacaoSenha {
  const erros = obterProblemasSenha(senha, nome, email)
  return {
    valida: erros.length === 0,
    erros,
  }
}

export type NivelForcaSenha = 'fraca' | 'media' | 'boa' | 'excelente'

export function calcularForcaSenha(senha: string, nome: string, email: string): NivelForcaSenha {
  const problemas = obterProblemasSenha(senha, nome, email)
  const temEspecial = /[!@#$%^&*(),.?":{}|<>_\-+=[\]/~`]/.test(senha)

  if (problemas.length > 0) {
    const temMinuscula = /[a-z]/.test(senha)
    const temNumero = /[0-9]/.test(senha)
    const tamanhoValido = senha.length >= 8

    if (tamanhoValido && temMinuscula && temNumero) {
      return 'media'
    }
    return 'fraca'
  }

  return temEspecial ? 'excelente' : 'boa'
}