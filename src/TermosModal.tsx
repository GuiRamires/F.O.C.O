
import { useState, useEffect } from 'react'

interface TermosModalProps {
  aberto: boolean
  onAceitar: () => void
  onFechar: () => void
}


const TEXTO_TERMOS = `
TERMO DE USO E POLÍTICA DE PRIVACIDADE — F.O.C.O.

Este é um projeto acadêmico (Projeto Final de Curso) desenvolvido para fins educacionais na Universidade de Mogi das Cruzes (UMC). Os dados coletados são utilizados exclusivamente para demonstração e avaliação do sistema, seguindo os princípios da Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).

1. DADOS COLETADOS
=Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eum tempora velit quisquam quibusdam optio vel illo eaque provident? Totam porro aliquid numquam magnam ullam consequuntur? Quas non praesentium illum deserunt.
2. FINALIDADE DO TRATAMENTO
=Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eum tempora velit quisquam quibusdam optio vel illo eaque provident? Totam porro aliquid numquam magnam ullam consequuntur? Quas non praesentium illum deserunt.

3. COMPARTILHAMENTO DE DADOS
=Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eum tempora velit quisquam quibusdam optio vel illo eaque provident? Totam porro aliquid numquam magnam ullam consequuntur? Quas non praesentium illum deserunt.

4. SEGURANÇA DA INFORMAÇÃO
=Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eum tempora velit quisquam quibusdam optio vel illo eaque provident? 
Totam porro aliquid numquam magnam ullam consequuntur? Quas non praesentium illum deserunt. 
=Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eum tempora velit quisquam quibusdam optio vel illo eaque provident? 
Totam porro aliquid numquam magnam ullam consequuntur? Quas non praesentium illum deserunt.s;


5. SEUS DIREITOS (LGPD)
=Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eum tempora velit quisquam quibusdam optio vel illo eaque provident? Totam porro aliquid numquam magnam ullam consequuntur? Quas non praesentium illum deserunt.
6. RETENÇÃO E EXCLUSÃO
=Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eum tempora velit quisquam quibusdam optio vel illo eaque provident? 
=Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eum tempora velit quisquam quibusdam optio vel illo eaque provident? 
Totam porro aliquid numquam magnam ullam consequuntur? Quas non praesentium illum deserunt.Totam porro aliquid numquam magnam ullam consequuntur? Quas non praesentium illum deserunt.

Ao aceitar este termo, você confirma que leu e compreendeu as condições acima descritas.
`.trim()

function TermosModal({ aberto, onAceitar, onFechar }: TermosModalProps) {
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

        {!scrollCompleto && (
          <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.75rem' }}>
            Role até o final do texto para habilitar o botão de aceite.
          </p>
        )}

        <div style={{ display: 'flex', gap: '0.5rem' }}>
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
        </div>
      </div>
    </div>
  )
}

export default TermosModal