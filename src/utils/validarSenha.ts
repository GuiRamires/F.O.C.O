export interface ResultadoValidacaoSenha {
  valida: boolean
  erros: string[]
}

export function validarSenha(senha: string, nome: string, email: string): ResultadoValidacaoSenha {
  const erros: string[] = []

  if (senha.length < 8 || senha.length > 20) {
    erros.push('A senha deve ter entre 8 e 20 caracteres.')
  }

  if (!/[a-zA-Z]/.test(senha)) {
    erros.push('A senha deve conter ao menos uma letra.')
  }

  if (!/[0-9]/.test(senha)) {
    erros.push('A senha deve conter ao menos um número.')
  }

  const senhaMinuscula = senha.toLowerCase()
  const nomeMinusculo = nome.trim().toLowerCase()
  const emailUsuario = email.split('@')[0]?.toLowerCase() ?? ''

  if (nomeMinusculo && senhaMinuscula.includes(nomeMinusculo)) {
    erros.push('A senha não deve conter seu nome.')
  }

  if (emailUsuario && senhaMinuscula.includes(emailUsuario)) {
    erros.push('A senha não deve conter parte do seu e-mail.')
  }

  const sequenciasFracas = ['12345678', 'abcdefgh', 'qwertyui', '87654321']
  if (sequenciasFracas.some((seq) => senhaMinuscula.includes(seq))) {
    erros.push('A senha não deve conter sequências óbvias (ex: 12345678, abcdefgh).')
  }

  return {
    valida: erros.length === 0,
    erros,
  }
}