import type { FeatureExtractionPipeline } from '@xenova/transformers'
import { env, pipeline } from '@xenova/transformers'

import { DEFAULT_AI_EMBEDDING_CANDIDATES } from './constants'
import type { AiEmailOptions, AiEmailSuggestion } from './types'

// Configure transformers.js
// Allow remote models in test environment, otherwise use local only
env.allowRemoteModels =
  process.env.NODE_ENV === 'test' || process.env.ALLOW_REMOTE_MODELS === 'true'
env.allowLocalModels = true
env.cacheDir = './public/models' // where models are cached
// and point ORT WASM to your local /onnx/ if you're using the browser backend
// env.backends.onnx.wasm.wasmPaths = '/onnx/'

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null
const cache = new Map<string, Float32Array>()

async function getExtractor(model: string) {
  if (!extractorPromise) {
    extractorPromise = pipeline('feature-extraction', model)
  }
  return extractorPromise
}

function cosine(a: Float32Array, b: Float32Array): number {
  let dot = 0,
    na = 0,
    nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-12)
}

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_) =>
    new Array<number>(b.length + 1).fill(0)
  )
  for (let i = 0; i <= a.length; i++) dp[i][0] = i
  for (let j = 0; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // del
        dp[i][j - 1] + 1, // ins
        dp[i - 1][j - 1] + cost // sub
      )
    }
  }
  return dp[a.length][b.length]
}

/**
 * Get a domain suggestion using transformer embeddings vs a curated list.
 * Returns null if we’re not confident enough.
 */
export async function aiSuggestEmailDomain(
  domain: string,
  options: AiEmailOptions = {}
): Promise<AiEmailSuggestion | null> {
  const d = domain.toLowerCase().trim()
  if (!d || !/[a-z]/i.test(d)) return null

  const model = options.model ?? 'Xenova/all-MiniLM-L6-v2'
  const threshold = options.threshold ?? 0.82
  const maxEdits = options.maxEdits ?? 2
  const candidates = (
    options.candidates && options.candidates.length
      ? options.candidates
      : DEFAULT_AI_EMBEDDING_CANDIDATES
  ).map((x) => x.toLowerCase())

  const extractor = await getExtractor(model)

  async function embed(text: string): Promise<Float32Array> {
    if (cache.has(text)) return cache.get(text)!
    const output = await extractor(text, {
      pooling: 'mean',
      normalize: true,
    })

    // Both real @xenova/transformers and our mocks return Tensor objects with .data property
    if (output && typeof output === 'object' && 'data' in output) {
      const arr = Array.from(output.data as Float32Array)
      const v = new Float32Array(arr)
      cache.set(text, v)
      return v
    }

    throw new Error(
      `Unexpected output format from feature extraction: expected Tensor object with .data property`
    )
  }

  const q = await embed(d)
  let best: { cand: string; sim: number } | null = null

  for (const cand of candidates) {
    const v = await embed(cand)
    const sim = cosine(q, v)
    if (!best || sim > best.sim) best = { cand, sim }
  }

  if (!best || best.sim < threshold) return null

  // Extra guard: small edit distance (prevents semantically close but structurally different)
  if (levenshtein(d, best.cand) > maxEdits) return null

  return {
    suggestion: best.cand,
    confidence: best.sim,
    reason: 'embedding_similarity',
  }
}

// Export cache clearing function for testing
export function __clearCache() {
  extractorPromise = null
  cache.clear()
}
