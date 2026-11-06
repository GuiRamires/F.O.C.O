import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { FocoComProgresso } from './services/focoService'
import {
  LIMITES_NIVEL_CONSTANCIA,
  SEMANAS_NA_CONSTANCIA,
  type Constancia,
  type MinutosPorFoco,
  type MinutosPorSemana,
} from './services/estatisticasService'
import { descreverMinutos, marcasEmHoras } from './utils/formatarHoras'

const COR_TEXTO_SUAVE = 'rgba(255, 255, 255, 0.65)'
const COR_GRADE = 'rgba(255, 255, 255, 0.08)'
const COR_EIXO = 'rgba(255, 255, 255, 0.18)'
const COR_BARRA = 'var(--grafico-barra)'
const TAMANHO_TEXTO_EIXO = 12
const ROTULOS_DIAS = ['seg', '', 'qua', '', 'sex', '', 'dom']

const ESTILO_DICA = {
  background: '#021B33',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: 12,
  fontFamily: 'inherit',
}

function animacoesPermitidas(): boolean {
  return !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

function descreverFaixa(nivel: number): string {
  const [meiaHora, umaHora, duasHoras] = LIMITES_NIVEL_CONSTANCIA
  if (nivel === 0) return 'sem estudo'
  if (nivel === 1) return `até ${meiaHora - 1} min`
  if (nivel === 2) return `${meiaHora} a ${umaHora - 1} min`
  if (nivel === 3) return `${descreverMinutos(umaHora)} a ${descreverMinutos(duasHoras - 1)}`
  return `${descreverMinutos(duasHoras)} ou mais`
}

interface Linha {
  rotulo: string
  minutos: number
}

function TabelaDados({ titulo, cabecalho, linhas }: { titulo: string; cabecalho: string; linhas: Linha[] }) {
  return (
    <details className="observar__tabela">
      <summary>Ver em tabela</summary>
      <table>
        <caption>{titulo}</caption>
        <thead>
          <tr>
            <th scope="col">{cabecalho}</th>
            <th scope="col">Tempo de foco</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha) => (
            <tr key={linha.rotulo}>
              <td>{linha.rotulo}</td>
              <td>{descreverMinutos(linha.minutos)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  )
}

export function GraficoSemanas({ dados }: { dados: MinutosPorSemana[] }) {
  const marcas = marcasEmHoras(Math.max(0, ...dados.map((semana) => semana.minutos)))
  const semanaAtual = dados[dados.length - 1]?.rotulo
  const descreverSemana = (rotulo: string) => (rotulo === semanaAtual ? `${rotulo} (em andamento)` : rotulo)

  return (
    <>
      <div className="observar__grafico">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dados} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
            <CartesianGrid vertical={false} stroke={COR_GRADE} />
            <XAxis
              dataKey="rotulo"
              tickLine={false}
              axisLine={{ stroke: COR_EIXO }}
              tick={{ fill: COR_TEXTO_SUAVE, fontSize: TAMANHO_TEXTO_EIXO }}
            />
            <YAxis
              ticks={marcas}
              domain={[0, marcas[marcas.length - 1]]}
              tickFormatter={(minutos: number) => `${minutos / 60} h`}
              tickLine={false}
              axisLine={false}
              width={44}
              tick={{ fill: COR_TEXTO_SUAVE, fontSize: TAMANHO_TEXTO_EIXO }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
              separator=": "
              formatter={(valor) => [descreverMinutos(Number(valor)), 'Tempo de foco']}
              labelFormatter={(rotulo) => `Semana de ${descreverSemana(String(rotulo))}`}
              contentStyle={ESTILO_DICA}
              labelStyle={{ color: COR_TEXTO_SUAVE }}
              itemStyle={{ color: '#FFFFFF' }}
            />
            <Bar
              dataKey="minutos"
              fill={COR_BARRA}
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
              isAnimationActive={animacoesPermitidas()}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <TabelaDados
        titulo="Tempo de foco por semana"
        cabecalho="Semana de"
        linhas={dados.map((semana) => ({ rotulo: descreverSemana(semana.rotulo), minutos: semana.minutos }))}
      />
    </>
  )
}

export function RankingFocos({ dados, focos }: { dados: MinutosPorFoco[]; focos: FocoComProgresso[] }) {
  if (dados.length === 0) {
    return <p className="observar__nada">Nenhuma sessão concluída ainda.</p>
  }

  const maior = Math.max(...dados.map((foco) => foco.minutos))
  const temEstrela = dados.some((linha) => focos.find((foco) => foco.id === linha.focoId)?.tem_estrela)

  return (
    <>
      <ol className="ranking">
        {dados.map((linha) => {
          const foco = focos.find((item) => item.id === linha.focoId)
          const estrela = foco?.tem_estrela ?? false
          return (
            <li key={linha.focoId} className="ranking__item">
              <div className="ranking__topo">
                <span className="ranking__nome">
                  {estrela && (
                    <span className="ranking__estrela" aria-label="Estrela Dourada">
                      ★
                    </span>
                  )}
                  {linha.titulo}
                  {foco?.status === 'laboratorio_sonhos' && <span className="ranking__status">Laboratório</span>}
                </span>
                <span className="ranking__valor">{descreverMinutos(linha.minutos)}</span>
              </div>
              <div
                className={`ranking__barra${estrela ? ' ranking__barra--estrela' : ''}`}
                style={{ width: `${Math.max(1, (linha.minutos / maior) * 100)}%` }}
              />
            </li>
          )
        })}
      </ol>
      {temEstrela && (
        <p className="observar__chave">
          <span className="observar__chave-cor" aria-hidden="true" /> Foco com a Estrela Dourada
        </p>
      )}
    </>
  )
}

export function MapaConstancia({ constancia }: { constancia: Constancia }) {
  const { semanas, diasEstudados } = constancia
  const resumo = `${diasEstudados} ${diasEstudados === 1 ? 'dia' : 'dias'} com estudo nas últimas ${SEMANAS_NA_CONSTANCIA} semanas`

  return (
    <div className="constancia">
      <div className="constancia__mapa">
        <div className="constancia__rotulos" aria-hidden="true">
          {ROTULOS_DIAS.map((rotulo, indice) => (
            <span key={indice}>{rotulo}</span>
          ))}
        </div>
        <div className="constancia__grade" role="img" aria-label={resumo}>
          {semanas.map((semana) => (
            <div className="constancia__semana" key={semana[0].chave}>
              {semana.map((dia) => (
                <span
                  key={dia.chave}
                  className={`constancia__dia constancia__dia--${dia.futuro ? 'futuro' : dia.nivel}`}
                  title={dia.futuro ? undefined : `${dia.rotulo}: ${dia.minutos > 0 ? descreverMinutos(dia.minutos) : 'sem estudo'}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="constancia__legenda">
        <span>Menos</span>
        {[0, 1, 2, 3, 4].map((nivel) => (
          <span
            key={nivel}
            className={`constancia__dia constancia__dia--${nivel}`}
            title={descreverFaixa(nivel)}
            aria-label={descreverFaixa(nivel)}
            role="img"
          />
        ))}
        <span>Mais</span>
      </div>

      <p className="constancia__resumo">{resumo}</p>
    </div>
  )
}
