import { useEffect, useRef } from 'react'
import './styles/menuAcoes.css'

interface MenuAcoesFocoProps {
  onConcentrar: () => void
  onFechar: () => void
}

function MenuAcoesFoco({ onConcentrar, onFechar }: MenuAcoesFocoProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function fecharAoClicarFora(evento: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(evento.target as Node)) {
        onFechar()
      }
    }

    function fecharComEsc(evento: KeyboardEvent) {
      if (evento.key === 'Escape') onFechar()
    }

    document.addEventListener('mousedown', fecharAoClicarFora)
    document.addEventListener('keydown', fecharComEsc)

    return () => {
      document.removeEventListener('mousedown', fecharAoClicarFora)
      document.removeEventListener('keydown', fecharComEsc)
    }
  }, [onFechar])

  return (
    <div
      ref={menuRef}
      className="menu-acoes"
      role="menu"
      onClick={(evento) => evento.stopPropagation()}
    >
      <button type="button" role="menuitem" className="menu-acoes__item" onClick={onConcentrar}>
        <span>Concentrar</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l2 2M9 2h6" />
        </svg>
      </button>
    </div>
  )
}

export default MenuAcoesFoco