import { useEffect, useRef, useState, type ReactNode } from 'react'

interface VideoQuadroProps {
  src: string
  reserva: ReactNode
  className?: string
  controles?: boolean
}

function VideoQuadro({ src, reserva, className, controles = false }: VideoQuadroProps) {
  const ref = useRef<HTMLVideoElement>(null)
  const [falhou, setFalhou] = useState(false)

  useEffect(() => {
    const video = ref.current
    if (!video || controles) return
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.3 },
    )
    observador.observe(video)
    return () => observador.disconnect()
  }, [falhou, controles])

  if (falhou) return <>{reserva}</>

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      muted={!controles}
      loop={!controles}
      playsInline
      controls={controles}
      autoPlay={controles}
      preload="metadata"
      onError={() => setFalhou(true)}
    />
  )
}

export default VideoQuadro
