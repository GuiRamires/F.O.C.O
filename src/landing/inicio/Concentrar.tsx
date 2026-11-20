import BlurText from '../../efeitos/BlurText'
import Reveal from '../../efeitos/Reveal'
import VideoQuadro from '../VideoQuadro'
import { VisualTimer } from '../Visuais'

const EXTRAS = [
  {
    titulo: 'Janela flutuante.',
    texto: 'O timer fica por cima dos outros programas enquanto você lê, assiste à aula ou anota.',
  },
  {
    titulo: 'Sem "concluir antes".',
    texto: 'A sessão só termina quando o tempo que você escolheu acaba. Pausar pode; o tempo pausado não conta.',
  },
  {
    titulo: 'O que você aprendeu?',
    texto: 'No fim, um registro curto e privado da sessão, e as horas somam no seu Foco.',
  },
]

function Concentrar() {
  return (
    <section className="foco-concentrar">
      <div className="foco-container">
        <p className="foco-rotulo foco-centro">Concentrar</p>
        <BlurText como="h2" className="foco-titulo-secao foco-centro" texto="Concentração. Do primeiro ao último minuto." />

        <Reveal className="foco-tela">
          <div className="foco-tela__interior">
            <VideoQuadro
              className="foco-tela__video"
              src="/videos/timer.mp4"
              reserva={
                <div className="foco-tela__reserva">
                  <VisualTimer aoVivo tamanho={280} />
                </div>
              }
            />
          </div>
        </Reveal>

        <Reveal>
          <p className="foco-lead foco-centro foco-concentrar__texto">
            Escolha um Foco, defina de <strong>5 a 180 minutos</strong> e comece. Durante a sessão, o app fica
            <span className="foco-gradiente-2"> bloqueado só no timer</span>, e um alerta sonoro avisa o fim. Depois,
            <span className="foco-gradiente-3"> as horas somam no Foco e aparecem no Observar</span>.
          </p>
        </Reveal>

        <div className="foco-concentrar__extras">
          {EXTRAS.map((extra, i) => (
            <Reveal key={extra.titulo} atraso={i * 0.1} className="foco-concentrar__extra">
              <p>
                <strong>{extra.titulo}</strong> {extra.texto}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Concentrar
