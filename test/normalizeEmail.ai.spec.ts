import { describe, expect, it, vi } from 'vitest'

import { normaliseEmailWithAI } from '../src'

// Mock aiSuggestEmailDomain to avoid model load
vi.mock('../src/utils/email/aiSuggestEmail', () => ({
  aiSuggestEmailDomain: vi.fn(async (domain: string) => {
    if (domain === 'invalid')
      return {
        suggestion: 'gmail.com',
        confidence: 0.92,
        reason: 'embedding_similarity',
      }
    if (domain === 'weird') return null
    return null
  }),
}))

describe('normaliseEmailWithAI', () => {
  it('returns AI suggestion when base normalization is invalid', async () => {
    const r = await normaliseEmailWithAI('user@invalid', {
      ai: { enabled: true },
    })
    expect(r.valid).toBe(false) // base (sync) may be invalid for this path
    expect(r.ai?.domain).toBe('gmail.com')
    // UI can render: user@gmail.com
  })

  it('does not suggest when AI returns null', async () => {
    const r = await normaliseEmailWithAI('user@weird', {
      ai: { enabled: true },
    })
    expect(r.ai).toBeUndefined()
  })

  it('respects blocklist (does not suggest blocked domains)', async () => {
    const r = await normaliseEmailWithAI('x@invalid', {
      ai: { enabled: true },
      blocklist: { block: { exact: ['gmail.com'] }, allow: { exact: [] } },
    })
    expect(r.ai).toBeUndefined()
  })
})
