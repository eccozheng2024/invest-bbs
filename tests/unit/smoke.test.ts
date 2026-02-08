import { describe, it, expect } from 'vitest'

describe('Smoke Tests', () => {
  it('basic math works', () => {
    expect(1 + 1).toBe(2)
  })

  it('environment is node', () => {
    expect(typeof process).toBe('object')
  })
})
