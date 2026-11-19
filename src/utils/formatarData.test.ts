import { describe, expect, it } from 'vitest'
import { formatarData, formatarDataHora } from './formatarData'

describe('formatação de datas', () => {
  it('mostra um traço quando não há data', () => {
    expect(formatarData(null)).toBe('—')
    expect(formatarDataHora(null)).toBe('—')
  })

  it('formata no padrão brasileiro', () => {
    expect(formatarData('2026-11-16T15:00:00')).toBe('16/11/2026')
    expect(formatarDataHora('2026-11-16T15:05:00')).toContain('16/11/2026')
  })
})
