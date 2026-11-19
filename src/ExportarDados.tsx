import { useState } from 'react'
import { handleExportarDados } from './controllers/contaController'
import type { FormatoExportacao } from './services/exportacaoService'
import { baixarArquivo } from './utils/baixarArquivo'

interface ExportarDadosProps {
  userId: string
}

function ExportarDados({ userId }: ExportarDadosProps) {
  const [exportando, setExportando] = useState<FormatoExportacao | null>(null)
  const [mensagem, setMensagem] = useState<{ tipo: 'erro' | 'sucesso'; texto: string } | null>(null)

  async function exportar(formato: FormatoExportacao) {
    if (exportando) return
    setExportando(formato)
    setMensagem(null)
    const resultado = await handleExportarDados(userId, formato)
    setExportando(null)
    if (!resultado.sucesso) {
      setMensagem({ tipo: 'erro', texto: resultado.mensagem })
      return
    }
    baixarArquivo(resultado.arquivo.nome, resultado.arquivo.conteudo, resultado.arquivo.tipo)
    setMensagem({ tipo: 'sucesso', texto: `Arquivo ${resultado.arquivo.nome} gerado.` })
  }

  return (
    <div>
      <p className="secao__dica">
        Baixe uma cópia dos seus Focos, ativos e arquivados, com as sessões e os registros de aprendizado. O arquivo é
        gerado no seu navegador e não fica guardado no servidor.
      </p>
      <div className="grupo-botoes">
        <button type="button" className="btn btn-outline-light" onClick={() => exportar('json')} disabled={exportando !== null}>
          {exportando === 'json' ? 'Gerando...' : 'Exportar em JSON'}
        </button>
        <button type="button" className="btn btn-outline-light" onClick={() => exportar('csv')} disabled={exportando !== null}>
          {exportando === 'csv' ? 'Gerando...' : 'Exportar em CSV (planilha)'}
        </button>
      </div>
      {mensagem && (
        <p className={`mensagem mensagem--${mensagem.tipo}`} role={mensagem.tipo === 'erro' ? 'alert' : 'status'}>
          {mensagem.texto}
        </p>
      )}
    </div>
  )
}

export default ExportarDados
