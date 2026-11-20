import CartaoAcesso from './components/CartaoAcesso'
import MensagemSucesso from './components/MensagemSucesso'

interface ContaExcluidaProps {
  onIrParaInicio: () => void
}

function ContaExcluida({ onIrParaInicio }: ContaExcluidaProps) {
  return (
    <CartaoAcesso titulo="Conta excluída">
      <MensagemSucesso>
        <p className="foco-sucesso__titulo" role="status">
          Sua conta e todos os seus dados foram apagados.
        </p>
        <p>
          Seu perfil, seus Focos, as sessões, os registros de aprendizado e os chamados de suporte não estão mais no
          F.O.C.O. Se quiser voltar, é só criar uma conta nova.
        </p>
        <button type="button" className="btn btn-primary" onClick={onIrParaInicio}>
          Ir para a página inicial
        </button>
      </MensagemSucesso>
    </CartaoAcesso>
  )
}

export default ContaExcluida
