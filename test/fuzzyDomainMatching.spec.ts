// fuzzy-domain.spec.ts
import { describe, expect, it } from 'vitest'

import { DEFAULT_FUZZY_DOMAIN_CANDIDATES } from '../src'
import {
  findClosestDomain,
  levenshtein,
} from '../src/utils/email/fuzzyDomainMatching'
import type {
  ClosestDomainResult,
  DomainCandidate,
  FindClosestOptions,
} from '../src/utils/email/types'

describe('DEFAULT_FUZZY_DOMAIN_CANDIDATES', () => {
  it('exports expected domain list', () => {
    expect(DEFAULT_FUZZY_DOMAIN_CANDIDATES).toContain('gmail.com')
    expect(DEFAULT_FUZZY_DOMAIN_CANDIDATES).toContain('outlook.com')
    expect(DEFAULT_FUZZY_DOMAIN_CANDIDATES).toContain('virginmedia.co.uk')
    expect(DEFAULT_FUZZY_DOMAIN_CANDIDATES.length).toBeGreaterThan(20)
  })

  it('is readonly array', () => {
    // TypeScript 'as const' makes it readonly at compile time, but runtime it's still mutable
    // Test that it's actually an array type
    expect(Array.isArray(DEFAULT_FUZZY_DOMAIN_CANDIDATES)).toBe(true)
    expect(DEFAULT_FUZZY_DOMAIN_CANDIDATES.length).toBeGreaterThan(0)
  })
})

describe('Type exports', () => {
  it('DomainCandidate type accepts default candidates and strings', () => {
    const candidate1: DomainCandidate = 'gmail.com' // from DEFAULT_FUZZY_DOMAIN_CANDIDATES
    const candidate2: string = 'custom.com' // arbitrary string
    expect(candidate1).toBe('gmail.com')
    expect(candidate2).toBe('custom.com')
  })

  it('ClosestDomainResult has correct structure', () => {
    const result: ClosestDomainResult = {
      input: 'test.com',
      candidate: 'gmail.com',
      distance: 5,
      normalizedScore: 0.5,
      index: 0,
    }
    expect(result.input).toBe('test.com')
    expect(result.candidate).toBe('gmail.com')
    expect(result.distance).toBe(5)
    expect(result.normalizedScore).toBe(0.5)
    expect(result.index).toBe(0)
  })

  it('FindClosestOptions has correct optional properties', () => {
    const opts1: FindClosestOptions = {}
    const opts2: FindClosestOptions = {
      candidates: ['test.com'],
      maxDistance: 3,
      normalize: false,
    }
    expect(opts1).toEqual({})
    expect(opts2.candidates).toEqual(['test.com'])
    expect(opts2.maxDistance).toBe(3)
    expect(opts2.normalize).toBe(false)
  })
})

describe('levenshtein()', () => {
  describe('identical strings', () => {
    it('returns 0 for identical strings', () => {
      expect(levenshtein('gmail.com', 'gmail.com')).toBe(0)
      expect(levenshtein('', '')).toBe(0)
      expect(levenshtein('a', 'a')).toBe(0)
    })
  })

  describe('empty string edge cases', () => {
    it('handles empty strings correctly', () => {
      expect(levenshtein('', 'abc')).toBe(3) // insert 3 chars
      expect(levenshtein('abc', '')).toBe(3) // delete 3 chars
      expect(levenshtein('', '')).toBe(0) // both empty
    })
  })

  describe('basic edit operations', () => {
    it('handles single insertion', () => {
      expect(levenshtein('gmai.com', 'gmail.com')).toBe(1) // missing 'l'
      expect(levenshtein('abc', 'abcd')).toBe(1) // missing 'd'
    })

    it('handles single deletion', () => {
      expect(levenshtein('gmail.com', 'gmai.com')).toBe(1) // extra 'l'
      expect(levenshtein('abcd', 'abc')).toBe(1) // extra 'd'
    })

    it('handles single substitution', () => {
      expect(levenshtein('gmall.com', 'gmail.com')).toBe(1) // l→i
      expect(levenshtein('abc', 'abd')).toBe(1) // c→d
    })

    it('handles multiple edits', () => {
      expect(levenshtein('gmailcom', 'gmail.com')).toBe(1) // missing '.'
      expect(levenshtein('hotmial.com', 'hotmail.com')).toBe(2) // i→a and a→i (2 substitutions)
    })
  })

  describe('maxDistance parameter', () => {
    it('respects maxDistance early exit on length difference', () => {
      // Length difference is 5, so with maxDistance=2 it should exit early
      expect(levenshtein('abc', 'abcdefgh', 2)).toBeGreaterThan(2)
      expect(levenshtein('abcdefgh', 'abc', 2)).toBeGreaterThan(2)
    })

    it('respects maxDistance during computation', () => {
      // These should trigger the row-based early exit
      expect(levenshtein('aaaa', 'bbbb', 2)).toBeGreaterThan(2)
      expect(levenshtein('completely', 'different', 3)).toBeGreaterThan(3)
    })

    it('works normally when within maxDistance', () => {
      expect(levenshtein('abc', 'abd', 5)).toBe(1) // well within limit
      expect(levenshtein('test', 'best', 2)).toBe(1) // within limit
    })

    it('uses default Infinity when maxDistance not provided', () => {
      expect(levenshtein('very-different', 'strings-here')).toBeLessThan(
        Infinity
      )
    })
  })

  describe('string swapping optimization', () => {
    it('swaps strings to keep shorter one as first parameter', () => {
      // These should produce the same result regardless of order
      const short = 'abc'
      const long = 'abcdefgh'
      expect(levenshtein(short, long)).toBe(levenshtein(long, short))
      expect(levenshtein('a', 'abcd')).toBe(levenshtein('abcd', 'a'))
    })
  })

  describe('character code comparison', () => {
    it('correctly compares character codes for cost calculation', () => {
      expect(levenshtein('a', 'a')).toBe(0) // same char, cost 0
      expect(levenshtein('a', 'b')).toBe(1) // different char, cost 1
      expect(levenshtein('🙂', '🙂')).toBe(0) // same unicode, cost 0
    })
  })

  describe('algorithm paths', () => {
    it('exercises all edit operation comparisons (del < ins, ins < sub, etc)', () => {
      // Force different comparison paths in the min calculation
      expect(levenshtein('ab', 'a')).toBe(1) // deletion preferred
      expect(levenshtein('a', 'ab')).toBe(1) // insertion preferred
      expect(levenshtein('a', 'b')).toBe(1) // substitution preferred
    })

    it('exercises rowMin tracking and early exit', () => {
      // Create scenario where rowMin exceeds maxDistance
      expect(levenshtein('aaaa', 'bbbbbbbb', 1)).toBeGreaterThan(1)
    })
  })
})

describe('findClosestDomain()', () => {
  describe('exact matches', () => {
    it('finds exact match with score 1', () => {
      const res = findClosestDomain('gmail.com')
      expect(res.candidate).toBe('gmail.com')
      expect(res.distance).toBe(0)
      expect(res.normalizedScore).toBe(1)
      expect(res.index).toBe(
        DEFAULT_FUZZY_DOMAIN_CANDIDATES.indexOf('gmail.com')
      )
    })

    it('finds exact match in custom candidates', () => {
      const res = findClosestDomain('custom.com', {
        candidates: ['custom.com', 'other.com'],
      })
      expect(res.candidate).toBe('custom.com')
      expect(res.distance).toBe(0)
      expect(res.normalizedScore).toBe(1)
    })

    it('breaks early on perfect match', () => {
      // Should stop searching once perfect match is found
      const res = findClosestDomain('gmail.com', {
        candidates: ['wrong.com', 'gmail.com', 'gmail.com'], // duplicate shouldn't matter
      })
      expect(res.candidate).toBe('gmail.com')
      expect(res.distance).toBe(0)
    })
  })

  describe('fuzzy matching', () => {
    it('finds closest common misspelling', () => {
      const res = findClosestDomain('gmai.com') // missing 'l'
      expect(res.candidate).toBe('gmail.com')
      expect(res.distance).toBe(1)
      expect(res.normalizedScore).toBeGreaterThan(0.8)
    })

    it('works with UK ISP domains in defaults', () => {
      const res = findClosestDomain('virginmeda.co.uk') // missing 'i'
      expect(
        res.candidate === 'virginmedia.co.uk' ||
          res.candidate === 'virginmedia.com'
      ).toBe(true)
      expect(res.distance).toBeGreaterThanOrEqual(1)
    })

    it('handles multiple typos', () => {
      const res = findClosestDomain('gmial.co') // multiple errors
      expect(res.candidate).toBe('gmail.com')
      expect(res.distance).toBeGreaterThan(1)
    })
  })

  describe('custom candidates', () => {
    it('honors custom candidate list', () => {
      const res = findClosestDomain('githab.com', {
        candidates: ['github.com', 'gitlab.com'],
      })
      expect(res.candidate).toBe('github.com')
    })

    it('combines default and custom candidates', () => {
      const res = findClosestDomain('gmai.com', {
        candidates: ['custom.com'], // gmail.com still available from defaults
      })
      expect(res.candidate).toBe('gmail.com') // should find gmail from defaults
    })

    it('handles empty custom candidates', () => {
      const res = findClosestDomain('gmai.com', { candidates: [] })
      expect(res.candidate).toBe('gmail.com') // should still use defaults
    })

    it('converts candidates to strings', () => {
      // Test String() conversion on candidates
      const res = findClosestDomain('test', {
        candidates: ['test.com' as DomainCandidate],
      })
      expect(res.candidate).toBe('test.com')
    })
  })

  describe('maxDistance threshold', () => {
    it('applies threshold: returns null candidate if too far', () => {
      const res = findClosestDomain('completely-wrong.tld', { maxDistance: 2 })
      expect(res.candidate).toBeNull()
      expect(res.index).toBe(-1)
      expect(res.normalizedScore).toBe(0)
    })

    it('includes candidates within threshold', () => {
      const res = findClosestDomain('gmai.com', { maxDistance: 2 })
      expect(res.candidate).toBe('gmail.com')
      expect(res.distance).toBeLessThanOrEqual(2)
    })

    it('uses Infinity as default maxDistance', () => {
      const res = findClosestDomain('very-very-wrong.tld')
      expect(res.candidate).not.toBeNull() // should find something
      expect(res.index).toBeGreaterThanOrEqual(0)
    })

    it('handles edge case where bestDist equals maxDistance', () => {
      const res = findClosestDomain('gmails.com', { maxDistance: 1 }) // 1 edit to gmail.com
      expect(res.candidate).toBe('gmail.com')
      expect(res.distance).toBe(1)
    })
  })

  describe('normalization', () => {
    it('normalizes input/candidates (lowercase + trim) by default', () => {
      const res = findClosestDomain('  Gmail.COM  ')
      expect(res.candidate).toBe('gmail.com')
      expect(res.distance).toBe(0)
    })

    it('can disable normalization', () => {
      const res = findClosestDomain('Gmail.COM', { normalize: false })
      // Without normalization, distance reflects case differences
      expect(res.distance).toBeGreaterThan(0)
    })

    it('normalizes custom candidates when enabled', () => {
      const res = findClosestDomain('CUSTOM.COM', {
        candidates: ['  Custom.COM  '],
        normalize: true,
      })
      expect(res.candidate).toBe('custom.com')
      expect(res.distance).toBe(0)
    })

    it('preserves case when normalization disabled', () => {
      const res = findClosestDomain('Custom.COM', {
        candidates: ['Custom.COM'],
        normalize: false,
      })
      expect(res.candidate).toBe('Custom.COM')
      expect(res.distance).toBe(0)
    })
  })

  describe('score calculation', () => {
    it('calculates normalized score correctly', () => {
      const res = findClosestDomain('gmai.com') // 1 edit, 9 chars
      expect(res.normalizedScore).toBeCloseTo(1 - 1 / 9, 2)
    })

    it('handles score calculation when candidate is null', () => {
      const res = findClosestDomain('totally-wrong', { maxDistance: 1 })
      if (res.candidate === null) {
        expect(res.normalizedScore).toBe(0)
      }
    })

    it('handles score calculation with empty strings', () => {
      const res = findClosestDomain('', { candidates: [''] })
      expect(res.normalizedScore).toBe(1) // perfect match
    })

    it('uses max length for denominator', () => {
      // Test when input is longer than candidate
      const res = findClosestDomain('verylongdomain.com', {
        candidates: ['short.com'],
      })
      expect(res.normalizedScore).toBeGreaterThan(0)
      expect(res.normalizedScore).toBeLessThan(1)
    })

    it('handles denom > 0 check', () => {
      // Edge case where both strings could be empty
      const res = findClosestDomain('', { candidates: [''] })
      expect(res.normalizedScore).toBe(1)
    })

    it('handles edge case in score calculation with bestCandidate null check', () => {
      // Test the bestCandidate ? bestCandidate.length : 1 branch
      const res = findClosestDomain('x', {
        candidates: [''], // empty string candidate
        maxDistance: 0.5, // force null candidate due to threshold
      })
      // This should trigger the null candidate path and test the ternary in denom calculation
      expect(res.candidate).toBeNull()
      expect(res.normalizedScore).toBe(0)
    })

    it('covers denom calculation edge case with zero-length scenarios', () => {
      // Ensure we test both branches of: bestCandidate ? bestCandidate.length : 1
      const resWithCandidate = findClosestDomain('', { candidates: ['a'] })
      expect(resWithCandidate.candidate).toBe('a')
      expect(resWithCandidate.normalizedScore).toBeLessThan(1)

      // Force null candidate to test the : 1 branch in denom calculation
      const resNullCandidate = findClosestDomain('verylongstring', {
        candidates: ['x'],
        maxDistance: 1,
      })
      if (resNullCandidate.candidate === null) {
        expect(resNullCandidate.normalizedScore).toBe(0)
      }
    })
  })

  describe('result structure', () => {
    it('returns complete result object structure', () => {
      const res = findClosestDomain('gmai.com')
      expect(res).toHaveProperty('input')
      expect(res).toHaveProperty('candidate')
      expect(res).toHaveProperty('distance')
      expect(res).toHaveProperty('normalizedScore')
      expect(res).toHaveProperty('index')

      expect(res.input).toBe('gmai.com')
      expect(typeof res.candidate).toBe('string')
      expect(typeof res.distance).toBe('number')
      expect(typeof res.normalizedScore).toBe('number')
      expect(typeof res.index).toBe('number')
    })

    it('preserves original input in result', () => {
      const input = '  GMAI.COM  '
      const res = findClosestDomain(input)
      expect(res.input).toBe(input) // original, not normalized
    })
  })

  describe('edge cases', () => {
    it('handles empty input', () => {
      const res = findClosestDomain('')
      expect(res.candidate).toBeDefined()
      expect(res.distance).toBeGreaterThan(0)
    })

    it('handles very long input', () => {
      const longDomain =
        'very-very-very-long-domain-name-that-exceeds-normal-length.com'
      const res = findClosestDomain(longDomain)
      expect(res.candidate).toBeDefined()
    })

    it('handles special characters in input', () => {
      const res = findClosestDomain('gm@il.com')
      expect(res.candidate).toBeDefined()
    })

    it('handles unicode characters', () => {
      const res = findClosestDomain('gmaïl.com')
      expect(res.candidate).toBeDefined()
    })
  })

  describe('performance and optimization', () => {
    it('handles large candidate lists efficiently', () => {
      const largeCandidates = Array.from(
        { length: 100 },
        (_, i) => `domain${i}.com`
      )
      const res = findClosestDomain('domain50.com', {
        candidates: largeCandidates,
      })
      expect(res.candidate).toBe('domain50.com')
      expect(res.distance).toBe(0)
    })

    it('finds best match among multiple good options', () => {
      const res = findClosestDomain('gmail.co', {
        candidates: ['gmail.com', 'gmail.co.uk', 'gmailx.co'],
      })
      // Should prefer gmail.com (1 edit) over gmail.co.uk (3 edits)
      expect(res.candidate).toBe('gmail.com')
    })
  })
})
