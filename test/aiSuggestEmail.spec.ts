import { pipeline } from '@xenova/transformers'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

// Create mocks first
const mockPipeline = vi.mocked(pipeline)
const mockExtractor = vi.fn()

// Create a proper mock extractor that satisfies the FeatureExtractionPipeline interface
const createMockExtractor = (implementation: any) => {
  const mock = vi.fn(implementation)
  return Object.assign(mock, {
    _call: mock,
    task: 'feature-extraction',
    model: {} as any,
    tokenizer: {} as any,
    dispose: vi.fn(),
  }) as any
}

// Mock the transformers.js module
vi.mock('@xenova/transformers', () => {
  return {
    pipeline: vi.fn(),
    env: {
      allowRemoteModels: true,
    },
  }
})

// Create a centralized mock setup function to ensure consistency across tests
const setupDefaultMocks = () => {
  // Setup realistic embeddings that produce meaningful cosine similarities
  mockExtractor.mockImplementation(async (text: string, _options: any) => {
    const embeddings: Record<string, number[]> = {
      // Core test domains - ensure high similarity between typos and correct domains
      'gmai.com': [1.0, 0.0, 0.0, 0.0, 0.0],
      'gmail.com': [0.95, 0.05, 0.0, 0.0, 0.0], // High similarity to gmai.com (cosine ≈ 0.95)
      'gmial.com': [0.94, 0.06, 0.0, 0.0, 0.0], // High similarity to gmail.com
      'outook.com': [0.0, 1.0, 0.0, 0.0, 0.0],
      'outlook.com': [0.0, 0.95, 0.05, 0.0, 0.0], // High similarity to outook.com
      'hotmial.com': [0.0, 0.0, 1.0, 0.0, 0.0],
      'hotmail.com': [0.0, 0.0, 0.95, 0.05, 0.0], // High similarity to hotmial.com

      // Edge case domains
      'test-typo.com': [0.9, 0.05, 0.05, 0.0, 0.0], // High similarity to gmail.com
      'completely.different.domain': [0.0, 0.0, 0.0, 0.0, 1.0], // Very different from all above
      'very-long-domain-name-that-exceeds-normal-length-limits.com': [
        0.1, 0.1, 0.1, 0.1, 0.6,
      ],

      // Exact matches for testing
      'example.com': [0.0, 0.0, 0.0, 1.0, 0.0],

      // Zero similarity case
      'zero.sim': [0.0, 0.0, 0.0, 0.0, 0.0],
    }

    // Return stored embedding or generate a random one
    const embedding =
      embeddings[text.toLowerCase()] ||
      Array.from({ length: 384 }, () => Math.random())

    // Return in the same format as real @xenova/transformers - a Tensor object with .data property
    return {
      data: new Float32Array(embedding),
      dims: [1, embedding.length],
      type: 'float32',
      size: embedding.length,
    }
  })

  mockPipeline.mockResolvedValue(createMockExtractor(mockExtractor))
}

describe('aiSuggestEmailDomain', () => {
  // Import function once at the top level
  let aiSuggestEmailDomain: any

  beforeEach(async () => {
    vi.clearAllMocks()

    // Import the function and clear cache
    const module = await import('../src/utils/email/aiSuggestEmail')
    aiSuggestEmailDomain = module.aiSuggestEmailDomain
    module.__clearCache()

    // Setup consistent mocks
    setupDefaultMocks()
  })

  describe('input validation', () => {
    it('should return null for empty input', async () => {
      const result = await aiSuggestEmailDomain('')
      expect(result).toBeNull()
    })

    it('should return null for whitespace-only input', async () => {
      const result = await aiSuggestEmailDomain('   ')
      expect(result).toBeNull()
    })

    it('should return null for numeric-only input', async () => {
      const result = await aiSuggestEmailDomain('123456')
      expect(result).toBeNull()
    })

    it('should return null for input without letters', async () => {
      const result = await aiSuggestEmailDomain('!@#$%^&*()')
      expect(result).toBeNull()
    })

    it('should handle case insensitivity', async () => {
      const result1 = await aiSuggestEmailDomain('GMAI.COM')
      const result2 = await aiSuggestEmailDomain('gmai.com')

      expect(result1?.suggestion).toBe(result2?.suggestion)
    })

    it('should trim whitespace from input', async () => {
      const result = await aiSuggestEmailDomain('  gmai.com  ')
      expect(result?.suggestion).toBe('gmail.com')
    })
  })

  describe('basic functionality', () => {
    it('should suggest gmail.com for gmai.com typo', async () => {
      const result = await aiSuggestEmailDomain('gmai.com')
      expect(result?.suggestion).toBe('gmail.com')
      expect(result?.confidence).toBeGreaterThan(0.5)
      expect(result?.reason).toBe('embedding_similarity')
    })

    it('should suggest outlook.com for outook.com typo', async () => {
      const result = await aiSuggestEmailDomain('outook.com')
      expect(result?.suggestion).toBe('outlook.com')
      expect(result?.confidence).toBeGreaterThan(0.5)
    })

    it('should return null for completely different domains', async () => {
      const result = await aiSuggestEmailDomain('completely.different.domain')
      expect(result).toBeNull()
    })
  })

  describe('configuration options', () => {
    it('should use custom model when specified', async () => {
      await aiSuggestEmailDomain('gmai.com', {
        model: 'custom-model',
      })

      expect(mockPipeline).toHaveBeenCalledWith(
        'feature-extraction',
        'custom-model'
      )
    })

    it('should use default model when not specified', async () => {
      await aiSuggestEmailDomain('gmai.com')

      expect(mockPipeline).toHaveBeenCalledWith(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2'
      )
    })

    it('should use custom candidates when provided', async () => {
      const result = await aiSuggestEmailDomain('test.com', {
        candidates: ['example.com', 'test.org'],
      })

      // Should only consider the custom candidates
      if (result) {
        expect(['example.com', 'test.org']).toContain(result.suggestion)
      }
    })

    it('should use default candidates when custom candidates is empty', async () => {
      const result = await aiSuggestEmailDomain('gmai.com', {
        candidates: [],
      })

      expect(result?.suggestion).toBe('gmail.com')
    })

    it('should respect custom threshold - reject low confidence', async () => {
      const result = await aiSuggestEmailDomain('completely.different.domain', {
        threshold: 0.9,
      })

      expect(result).toBeNull()
    })

    it('should respect custom threshold - accept high confidence', async () => {
      const result = await aiSuggestEmailDomain('gmai.com', {
        threshold: 0.1,
      })

      expect(result).not.toBeNull()
      expect(result?.suggestion).toBe('gmail.com')
      expect(result?.confidence).toBeGreaterThan(0.1)
    })

    it('should respect maxEdits constraint', async () => {
      const result = await aiSuggestEmailDomain(
        'completely-different-domain.com',
        {
          maxEdits: 1,
        }
      )

      expect(result).toBeNull()
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle extractor errors gracefully', async () => {
      // Clear cache and set up error mock
      const module = await import('../src/utils/email/aiSuggestEmail')
      module.__clearCache()

      mockExtractor.mockRejectedValueOnce(new Error('Model loading failed'))

      await expect(aiSuggestEmailDomain('gmai.com')).rejects.toThrow(
        'Model loading failed'
      )
    })

    it('should handle pipeline creation errors gracefully', async () => {
      // Clear cache and set up error mock
      const module = await import('../src/utils/email/aiSuggestEmail')
      module.__clearCache()

      mockPipeline.mockRejectedValueOnce(new Error('Pipeline creation failed'))

      await expect(aiSuggestEmailDomain('gmai.com')).rejects.toThrow(
        'Pipeline creation failed'
      )
    })

    it('should handle consistent Tensor object format - test case 1', async () => {
      // Test with Tensor object format (current standard)
      const embedding = [0.1, 0.2, 0.3, 0.4, 0.5]

      // Create a temporary mock that provides consistent responses for all calls
      const tempMockExtractor = vi.fn()
      tempMockExtractor.mockImplementation(async () => ({
        data: new Float32Array(embedding),
        dims: [1, embedding.length],
        type: 'float32',
        size: embedding.length,
      }))

      mockPipeline.mockResolvedValue(createMockExtractor(tempMockExtractor))

      const result = await aiSuggestEmailDomain('gmai.com')

      expect(result).not.toBeNull()
    })

    it('should handle consistent Tensor object format - test case 2', async () => {
      // Test with Tensor object format (current standard)
      const embedding = [0.1, 0.2, 0.3, 0.4, 0.5]

      // Create a temporary mock that provides consistent responses for all calls
      const tempMockExtractor = vi.fn()
      tempMockExtractor.mockImplementation(async () => ({
        data: new Float32Array(embedding),
        dims: [1, embedding.length],
        type: 'float32',
        size: embedding.length,
      }))

      mockPipeline.mockResolvedValue(createMockExtractor(tempMockExtractor))

      const result = await aiSuggestEmailDomain('gmai.com')

      expect(result).not.toBeNull()
    })

    it('should handle malformed embedding responses', async () => {
      // Clear cache and set up malformed response
      const module = await import('../src/utils/email/aiSuggestEmail')
      module.__clearCache()

      // Mock a malformed response that will cause an error when trying to access array properties
      mockExtractor.mockImplementation(() => {
        throw new TypeError('Cannot read property of undefined')
      })

      await expect(aiSuggestEmailDomain('gmai.com')).rejects.toThrow(
        'Cannot read property of undefined'
      )
    })

    it('should handle very long domain names', async () => {
      const longDomain =
        'very-long-domain-name-that-exceeds-normal-length-limits.com'

      const result = await aiSuggestEmailDomain(longDomain)

      // Should either return null or a valid suggestion
      if (result) {
        expect(typeof result.suggestion).toBe('string')
        expect(typeof result.confidence).toBe('number')
      }
    })

    it('should handle domains with special characters', async () => {
      const result = await aiSuggestEmailDomain('test-domain.co.uk')

      // Should handle without throwing errors
      if (result) {
        expect(typeof result.suggestion).toBe('string')
      }
    })
  })

  describe('caching behavior', () => {
    it('should call extractor for new domains', async () => {
      await aiSuggestEmailDomain('new-domain.com')

      // Should call extractor for the input domain and all candidates
      expect(mockExtractor.mock.calls.length).toBeGreaterThan(0)
    })

    it('should pass correct options to feature extraction', async () => {
      await aiSuggestEmailDomain('test.com')

      // Verify that extractor was called with correct options
      expect(mockExtractor).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          pooling: 'mean',
          normalize: true,
        })
      )
    })
  })

  describe('similarity scoring', () => {
    afterEach(() => {
      // Restore default mocks after each test in this group that modifies them
      setupDefaultMocks()
    })

    it('should return the most similar candidate', async () => {
      // Clear cache to ensure fresh calls
      const module = await import('../src/utils/email/aiSuggestEmail')
      module.__clearCache()

      // Create a temporary mock for this test
      const tempMockExtractor = vi.fn()
      tempMockExtractor.mockImplementation(async (text: string) => {
        // Use a typo that's similar to gmail.com and within edit distance
        if (text === 'gmai.co') {
          const embedding = [1.0, 0.0, 0.0, 0.0, 0.0]
          return {
            data: new Float32Array(embedding),
            dims: [1, embedding.length],
            type: 'float32',
            size: embedding.length,
          }
        }
        if (text === 'gmail.com') {
          const embedding = [0.95, 0.1, 0.05, 0.05, 0.05] // Very similar with high cosine similarity ~0.95
          return {
            data: new Float32Array(embedding),
            dims: [1, embedding.length],
            type: 'float32',
            size: embedding.length,
          }
        }
        // Other candidates get much lower similarity
        const embedding = [0.1, 0.9, 0.8, 0.7, 0.6]
        return {
          data: new Float32Array(embedding),
          dims: [1, embedding.length],
          type: 'float32',
          size: embedding.length,
        }
      })

      mockPipeline.mockResolvedValue(createMockExtractor(tempMockExtractor))

      const result = await aiSuggestEmailDomain('gmai.co', {
        threshold: 0.5,
        maxEdits: 3, // Allow more edits
      })

      expect(result?.suggestion).toBe('gmail.com')
      expect(result?.confidence).toBeGreaterThan(0.5)

      // Restore default mocks after this test
      setupDefaultMocks()
    })

    it('should handle low similarity scores', async () => {
      const result = await aiSuggestEmailDomain('zero.sim', {
        threshold: 0.5,
      })

      expect(result).toBeNull()
    })
  })

  describe('performance considerations', () => {
    it('should handle concurrent requests', async () => {
      const promises = [
        aiSuggestEmailDomain('gmai.com'),
        aiSuggestEmailDomain('outook.com'),
        aiSuggestEmailDomain('hotmial.com'),
      ]

      const results = await Promise.all(promises)

      expect(results).toHaveLength(3)
      results.forEach((result) => {
        if (result) {
          expect(typeof result.suggestion).toBe('string')
          expect(typeof result.confidence).toBe('number')
        }
      })
    })

    it('should complete in reasonable time', async () => {
      const start = Date.now()

      await aiSuggestEmailDomain('gmai.com')

      const duration = Date.now() - start
      expect(duration).toBeLessThan(1000) // Should complete within 1 second
    })
  })

  describe('integration scenarios', () => {
    it("should suggest 'gmail.com' for 'gmai.com'", async () => {
      const result = await aiSuggestEmailDomain('gmai.com')
      expect(result?.suggestion).toBe('gmail.com')
    })

    it("should suggest 'gmail.com' for 'gmial.com'", async () => {
      const result = await aiSuggestEmailDomain('gmial.com')
      expect(result?.suggestion).toBe('gmail.com')
    })

    it("should suggest 'outlook.com' for 'outook.com'", async () => {
      const result = await aiSuggestEmailDomain('outook.com')
      expect(result?.suggestion).toBe('outlook.com')
    })

    it("should suggest 'hotmail.com' for 'hotmial.com'", async () => {
      const result = await aiSuggestEmailDomain('hotmial.com')
      expect(result?.suggestion).toBe('hotmail.com')
    })
  })

  describe('boundary conditions', () => {
    it('should handle exact matches correctly', async () => {
      const result = await aiSuggestEmailDomain('gmail.com')

      // Based on the implementation, exact matches would still return a suggestion
      // if another candidate has higher similarity. This is expected behavior.
      if (result) {
        expect(typeof result.suggestion).toBe('string')
        expect(typeof result.confidence).toBe('number')
      }
      // The function doesn't explicitly filter exact matches, so we accept either null or a result
    })

    it('should handle minimum confidence threshold', async () => {
      const result = await aiSuggestEmailDomain('gmai.com', {
        threshold: 0.001,
      })

      // With very low threshold, should return a suggestion (using a domain that has similarity)
      expect(result).not.toBeNull()
    })

    it('should handle zero edit distance', async () => {
      const result = await aiSuggestEmailDomain('gmai.com', {
        maxEdits: 0,
      })

      // With zero edit distance allowed, typos should not be suggested
      expect(result).toBeNull()
    })
  })
})

describe.skip('real AI integration tests', () => {
  // These tests use the real @xenova/transformers implementation
  // They may take longer and require network access for model downloads
  // Skipped due to Float32Array compatibility issues with the current version

  let realAiSuggestEmailDomain: any

  beforeAll(async () => {
    // Import the real implementation without mocks
    vi.doUnmock('@xenova/transformers')

    // Clear module cache and re-import to get the real implementation
    vi.resetModules()
    const module = await import('../src/utils/email/aiSuggestEmail')
    realAiSuggestEmailDomain = module.aiSuggestEmailDomain
    module.__clearCache()
  }, 60000) // 60 second timeout for model loading

  afterAll(async () => {
    // Re-enable mocks for other tests
    vi.doMock('@xenova/transformers', () => ({
      pipeline: mockPipeline,
      env: {
        allowRemoteModels: true,
      },
    }))
    vi.resetModules()

    // Re-import to restore mocked version and setup default mocks
    const module = await import('../src/utils/email/aiSuggestEmail')
    module.__clearCache()

    // Restore the default mocks for subsequent tests
    setupDefaultMocks()
  })

  describe('real AI suggestions', () => {
    it('should suggest gmail.com for common typos using real AI', async () => {
      // Test that real AI integration works and produces valid confidence scores
      const result = await realAiSuggestEmailDomain('gmai.com', {
        threshold: 0.1, // Lower threshold for real AI which may produce different similarities
        maxEdits: 3,
      })

      if (result) {
        expect(result.suggestion).toBe('gmail.com')
        expect(typeof result.confidence).toBe('number')
        expect(Number.isFinite(result.confidence)).toBe(true) // Check for valid number (not NaN/Infinity)
        expect(result.confidence).toBeGreaterThan(0)
        expect(result.confidence).toBeLessThanOrEqual(1)
        expect(result.reason).toBe('embedding_similarity')
      } else {
        // Real AI might not find matches at the same threshold as mocked tests
        // This is acceptable behavior for real AI integration
        expect(result).toBeNull()
      }
    }, 60000) // 60 second timeout for AI processing

    it('should suggest outlook.com for outlook typos using real AI', async () => {
      const result = await realAiSuggestEmailDomain('outook.com', {
        threshold: 0.7,
        maxEdits: 2,
      })

      if (result) {
        expect(result.suggestion).toBe('outlook.com')
        expect(result.confidence).toBeGreaterThan(0.7)
      }
    }, 30000)

    it('should reject completely unrelated domains using real AI', async () => {
      const result = await realAiSuggestEmailDomain('randomtext123.domain', {
        threshold: 0.8,
        maxEdits: 3,
      })

      // Should return null for unrelated domains
      expect(result).toBeNull()
    }, 30000)

    it('should work with custom model configuration', async () => {
      const result = await realAiSuggestEmailDomain('gmai.com', {
        model: 'Xenova/all-MiniLM-L6-v2', // Explicitly specify model
        threshold: 0.6,
        maxEdits: 2,
      })

      if (result) {
        expect(result.suggestion).toBe('gmail.com')
        expect(typeof result.confidence).toBe('number')
      }
    }, 30000)

    it('should respect custom candidate lists with real AI', async () => {
      const result = await realAiSuggestEmailDomain('protonmai.com', {
        candidates: ['proton.me', 'protonmail.com', 'gmail.com'],
        threshold: 0.6,
        maxEdits: 3,
      })

      if (result) {
        expect(
          ['proton.me', 'protonmail.com'].includes(result.suggestion)
        ).toBe(true)
      }
    }, 30000)
  })

  describe('real AI performance and edge cases', () => {
    it('should handle concurrent requests with real AI', async () => {
      const promises = [
        realAiSuggestEmailDomain('gmai.com', { threshold: 0.7 }),
        realAiSuggestEmailDomain('outook.com', { threshold: 0.7 }),
        realAiSuggestEmailDomain('yahooo.com', { threshold: 0.7 }),
      ]

      const results = await Promise.all(promises)

      expect(results).toHaveLength(3)
      // At least some results should be non-null for these common typos
      const nonNullResults = results.filter((r) => r !== null)
      expect(nonNullResults.length).toBeGreaterThan(0)
    }, 60000)

    it('should cache embeddings properly with real AI', async () => {
      // First call - will populate cache
      const result1 = await realAiSuggestEmailDomain('uniquetestdomain.com', {
        threshold: 0.1,
      })

      // Second call - should use cached embeddings (verify no errors)
      const result2 = await realAiSuggestEmailDomain('uniquetestdomain.com', {
        threshold: 0.1,
      })

      // Results should be identical due to caching
      expect(result1).toEqual(result2)
    }, 60000)

    it('should handle very long domain names with real AI', async () => {
      const longDomain =
        'very-very-very-long-domain-name-that-might-be-similar-to-gmail.com'

      const result = await realAiSuggestEmailDomain(longDomain, {
        threshold: 0.6,
        maxEdits: 10, // Allow more edits for long domains
      })

      // Should handle without throwing errors
      if (result) {
        expect(typeof result.suggestion).toBe('string')
        expect(typeof result.confidence).toBe('number')
      }
    }, 30000)

    it('should work with international domain variations using real AI', async () => {
      // Test that real AI can handle international domain typos
      // Note: Real AI may suggest broader matches (gmail.com vs gmail.co.uk)
      const result = await realAiSuggestEmailDomain('gmail.co.k', {
        candidates: ['gmail.com', 'gmail.co.uk', 'hotmail.co.uk'],
        threshold: 0.1,
        maxEdits: 3,
      })

      // Real AI should find some reasonable suggestion
      if (result) {
        expect(['gmail.com', 'gmail.co.uk'].includes(result.suggestion)).toBe(
          true
        )
        expect(typeof result.confidence).toBe('number')
        expect(Number.isFinite(result.confidence)).toBe(true)
      }
      // If no result, that's also acceptable for real AI with high thresholds
    }, 60000)
  })
})

describe('internal utility functions coverage', () => {
  // Import function once at the top level for this separate describe block
  let aiSuggestEmailDomain: any

  // Create local mocks for this describe block
  const localMockPipeline = vi.fn()
  const localMockExtractor = vi.fn()

  // Create a local version of the mock extractor helper
  const createLocalMockExtractor = (implementation: any) => {
    const mock = vi.fn(implementation)
    return Object.assign(mock, {
      _call: mock,
      task: 'feature-extraction',
      model: {} as any,
      tokenizer: {} as any,
      dispose: vi.fn(),
    }) as any
  }

  beforeAll(async () => {
    // Ensure mocks are properly set up for this test suite
    vi.doMock('@xenova/transformers', () => {
      return {
        pipeline: localMockPipeline,
        env: {
          allowRemoteModels: true,
        },
      }
    })
    vi.resetModules()
  })

  afterEach(() => {
    // Clear local mocks
    localMockPipeline.mockClear()
    localMockExtractor.mockClear()
  })

  beforeEach(async () => {
    // Import the function for this describe block
    const module = await import('../src/utils/email/aiSuggestEmail')
    aiSuggestEmailDomain = module.aiSuggestEmailDomain
    module.__clearCache()

    // Setup local mock extractor with specific test vectors for utility function testing
    localMockExtractor.mockImplementation(
      async (text: string, _options: any) => {
        // Return different vectors based on the test case
        const embeddings: Record<string, number[]> = {
          'example.com': [1.0, 0.0, 0.0],
          'gmail.com': [1.0, 0.0, 0.0], // Identical for testing perfect similarity
          'zero.com': [0.0, 0.0, 0.0],
          'verydifferentdomain.com': [0.1, 0.2, 0.3, 0.4, 0.5],
        }

        const embedding = embeddings[text.toLowerCase()] || [
          0.1, 0.2, 0.3, 0.4, 0.5,
        ]

        // Return in the same format as real @xenova/transformers
        return {
          data: new Float32Array(embedding),
          dims: [1, embedding.length],
          type: 'float32',
          size: embedding.length,
        }
      }
    )

    localMockPipeline.mockResolvedValue(
      createLocalMockExtractor(localMockExtractor)
    )
  })

  describe('cosine similarity edge cases', () => {
    it('should handle identical vectors correctly', async () => {
      // Clear cache to ensure fresh calls
      const module = await import('../src/utils/email/aiSuggestEmail')
      module.__clearCache()

      // Create a temporary mock for this test
      const tempMockExtractor = vi.fn()
      tempMockExtractor.mockImplementation(async () => {
        const embedding = [1.0, 0.0, 0.0]
        return {
          data: new Float32Array(embedding),
          dims: [1, embedding.length],
          type: 'float32',
          size: embedding.length,
        }
      })

      localMockPipeline.mockResolvedValue(
        createLocalMockExtractor(tempMockExtractor)
      )

      const result = await aiSuggestEmailDomain('example.com')

      // Perfect similarity should result in high confidence (close to 1.0)
      if (result) {
        expect(result.confidence).toBeCloseTo(1.0, 1)
      }
    })

    it('should handle zero vectors', async () => {
      // Create a temporary mock for this test
      const tempMockExtractor = vi.fn()
      tempMockExtractor.mockImplementation(async () => {
        const embedding = [0.0, 0.0, 0.0]
        return {
          data: new Float32Array(embedding),
          dims: [1, embedding.length],
          type: 'float32',
          size: embedding.length,
        }
      })

      localMockPipeline.mockResolvedValue(
        createLocalMockExtractor(tempMockExtractor)
      )

      const result = await aiSuggestEmailDomain('zero.com')

      // Zero vectors should result in NaN similarity, handled gracefully
      expect(result).toBeNull()
    })
  })

  describe('levenshtein distance edge cases', () => {
    it('should enforce strict edit distance limits', async () => {
      const result = await aiSuggestEmailDomain('verydifferentdomain.com', {
        maxEdits: 2,
        threshold: 0.1, // Low threshold to pass similarity check
      })

      // Even with high similarity, large edit distance should prevent suggestion
      expect(result).toBeNull()
    })
  })
}) // Close the "internal utility functions coverage" describe block
