interface ContaExcluidaProps {
  onIrParaInicio: () => void
}

function ContaExcluida({ onIrParaInicio }: ContaExcluidaProps) {
  return (
    <main className="tela" style={{ maxWidth: '480px' }}>
      <h1 className="tela__titulo">Conta excluída</h1>
      <p className="mensagem mensagem--sucesso" role="status">
        Sua conta e todos os seus dados foram apagados.
      </p>
      <p className="secao__dica">
        Seu perfil, seus Focos, as sessões, os registros de aprendizado e os chamados de suporte não estão mais no
        F.O.C.O. Se quiser voltar, é só criar uma conta nova.
      </p>
      <button type="button" className="btn btn-primary" onClick={onIrParaInicio}>
        Ir para a página inicial
      </button>
    </main>
  )
}

export default ContaExcluida
