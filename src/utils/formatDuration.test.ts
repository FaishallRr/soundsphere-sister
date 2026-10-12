import { describe, expect, it } from 'vitest'
import { formatDuration } from './formatDuration'

describe('formatDuration', () => {
  it('formats whole minutes and seconds', () => {
    expect(formatDuration(61_000)).toBe('1:01')
    expect(formatDuration(215_000)).toBe('3:35')
  })

  it('pads seconds with a leading zero', () => {
    expect(formatDuration(5_000)).toBe('0:05')
    expect(formatDuration(0)).toBe('0:00')
  })

  it('returns a placeholder for missing or invalid values', () => {
    expect(formatDuration(null)).toBe('--:--')
    expect(formatDuration(undefined)).toBe('--:--')
    expect(formatDuration(-1)).toBe('--:--')
    expect(formatDuration(Number.NaN)).toBe('--:--')
  })

  it('truncates fractional seconds', () => {
    expect(formatDuration(1_999)).toBe('0:01')
  })
})
