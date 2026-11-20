interface MarcaFocoProps {
  className?: string
}

function MarcaFoco({ className = '' }: MarcaFocoProps) {
  return (
    <span className={`foco-marca ${className}`}>
      <img src="/brand-ring.png" alt="" className="foco-marca__anel" />
      F.O.C.O
    </span>
  )
}

export default MarcaFoco
