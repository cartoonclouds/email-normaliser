import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock aiSuggestEmailDomain to avoid model load
vi.mock('@/utils/email/aiSuggestEmail', () => ({
  aiSuggestEmailDomain: vi.fn(async (domain: string) => {
    if (domain === 'gmai.com')
      return {
        suggestion: 'gmail.com',
        confidence: 0.92,
        reason: 'embedding_similarity',
      }
    if (domain === 'outlok.com')
      return {
        suggestion: 'outlook.com',
        confidence: 0.9,
        reason: 'embedding_similarity',
      }
    return null
  }),
}))

describe('normalizeEmailWithAI', () => {
  it('returns AI suggestion when base normalization is invalid', async () => {
    const r = await normalizeEmailWithAI('user@gmai.com', {
      ai: { enabled: true },
    })
    expect(r.valid).toBe(false) // base (sync) may be invalid for this path
    expect(r.ai?.domain).toBe('gmail.com')
    // UI can render: user@gmail.com
  })

  it('does not suggest when AI returns null', async () => {
    const r = await normalizeEmailWithAI('user@weird', {
      ai: { enabled: true },
    })
    expect(r.ai).toBeUndefined()
  })

  it('respects blocklist (does not suggest blocked domains)', async () => {
    const r = await normalizeEmailWithAI('x@gmai.com', {
      ai: { enabled: true },
      blocklist: { block: { exact: ['gmail.com'] }, allow: { exact: [] } },
    })
    expect(r.ai).toBeUndefined()
  })
})
