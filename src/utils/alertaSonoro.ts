let contexto: AudioContext | null = null
let osciladoresAgendados: OscillatorNode[] = []

const FREQUENCIA_HZ = 1000
const VOLUME = 0.15
const DURACAO_BIPE_S = 0.1
const INTERVALO_BIPE_S = 0.08
const BIPES_POR_CICLO = 4
const PAUSA_ENTRE_CICLOS_S = 0.5
const CICLOS = 6
const MARGEM_INICIO_S = 0.05

function obterContexto(): AudioContext {
  if (!contexto) {
    contexto = new AudioContext()
  }
  if (contexto.state === 'suspended') {
    contexto.resume()
  }
  return contexto
}

export function prepararAlerta() {
  obterContexto()
}

export function agendarAlerta(daquiMs: number) {
  pararAlerta()
  const ctx = obterContexto()
  let instante = ctx.currentTime + Math.max(daquiMs / 1000, MARGEM_INICIO_S)

  for (let ciclo = 0; ciclo < CICLOS; ciclo++) {
    for (let bipe = 0; bipe < BIPES_POR_CICLO; bipe++) {
      agendarBipe(ctx, instante)
      instante += DURACAO_BIPE_S + INTERVALO_BIPE_S
    }
    instante += PAUSA_ENTRE_CICLOS_S
  }
}

export function tocarAlerta() {
  agendarAlerta(0)
}

export function pararAlerta() {
  osciladoresAgendados.forEach((oscilador) => oscilador.stop())
  osciladoresAgendados = []
}

function agendarBipe(ctx: AudioContext, inicio: number) {
  const oscilador = ctx.createOscillator()
  const volume = ctx.createGain()

  oscilador.type = 'square'
  oscilador.frequency.value = FREQUENCIA_HZ
  volume.gain.value = VOLUME

  oscilador.connect(volume).connect(ctx.destination)
  oscilador.start(inicio)
  oscilador.stop(inicio + DURACAO_BIPE_S)
  osciladoresAgendados.push(oscilador)
}