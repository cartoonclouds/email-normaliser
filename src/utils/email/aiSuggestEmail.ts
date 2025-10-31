import type { FeatureExtractionPipeline } from '@xenova/transformers'
import { env, pipeline } from '@xenova/transformers'

export type AiEmailSuggestion = {
  suggestion: string
  confidence: number
  reason: 'embedding_similarity'
}
export type AiEmailOptions = {
  candidates?: string[]
  model?: string
  threshold?: number
  maxEdits?: number
}

const DEFAULT_CANDIDATES = [
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'yahoo.com',
  'yahoo.co.uk',
  'proton.me',
  'fastmail.com',
  'zoho.com',
  'btinternet.co.uk',
  'virginmedia.com',
  'virginmedia.co.uk',
  'blueyonder.co.uk',
  'ntlworld.com',
  'ntlworld.co.uk',
  'talktalk.net',
  'talktalk.co.uk',
  'sky.com',
  'sky.co.uk',
  'salesforce.com',
  'atlassian.com',
  'slack.com',
  'github.com',
]

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null
const cache = new Map<string, Float32Array>()

env.allowRemoteModels = true

/**
 * Get or create a feature extraction pipeline for the specified model.
 *
 * @param {string} model - The model identifier for the feature extraction pipeline
 * @returns {Promise<FeatureExtractionPipeline>} The feature extraction pipeline
 */
async function getExtractor(model: string) {
  if (!extractorPromise)
    extractorPromise = pipeline('feature-extraction', model)
  return extractorPromise
}

/**
 * Calculate the cosine similarity between two vectors.
 *
 * @param {Float32Array} a - First vector
 * @param {Float32Array} b - Second vector
 * @returns {number} Cosine similarity score between 0 and 1
 */
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

/**
 * Calculate the Levenshtein distance between two strings.
 *
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} The minimum number of single-character edits needed to transform one string into the other
 */
function levenshtein(a: string, b: string): number {
  const m = a.length,
    n = b.length
  const dp = Array.from({ length: m + 1 }, (_) => new Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++) {
      const c = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + c
      )
    }
  return dp[m][n]
}

/**
 * Suggest a corrected email domain using AI-based semantic similarity.
 *
 * Uses transformer embeddings to find the most similar domain from a list of candidates.
 * Combines both semantic similarity (cosine similarity of embeddings) and edit distance
 * to provide intelligent domain suggestions for misspelled email addresses.
 *
 * @param {string} domain - The potentially misspelled email domain
 * @param {AiEmailOptions} options - Configuration options for the suggestion algorithm
 * @param {string[]} options.candidates - List of valid domains to suggest from (defaults to common providers)
 * @param {string} options.model - Transformer model to use for embeddings (default: 'Xenova/all-MiniLM-L6-v2')
 * @param {number} options.threshold - Minimum similarity threshold for suggestions (default: 0.82)
 * @param {number} options.maxEdits - Maximum edit distance to consider (default: 2)
 * @returns {Promise<AiEmailSuggestion | null>} Suggestion object with corrected domain and confidence, or null if no good match
 */
export async function aiSuggestEmailDomain(
  domain: string,
  options: AiEmailOptions = {}
): Promise<AiEmailSuggestion | null> {
  const d = domain.toLowerCase().trim()
  if (!d || !/^[a-z0-9.-]+$/.test(d)) return null
  const model = options.model ?? 'Xenova/all-MiniLM-L6-v2'
  const threshold = options.threshold ?? 0.82
  const maxEdits = options.maxEdits ?? 2
  const candidates = (
    options.candidates && options.candidates.length
      ? options.candidates
      : DEFAULT_CANDIDATES
  ).map((x) => x.toLowerCase())

  const extractor = await getExtractor(model)
  async function embed(t: string) {
    if (cache.has(t)) return cache.get(t)!
    const out = (await extractor(t, {
      pooling: 'mean',
      normalize: true,
    })) as any
    const arr = Array.isArray(out[0]) ? out[0] : out
    const v = new Float32Array(arr)
    cache.set(t, v)
    return v
  }
  const q = await embed(d)
  let best: { cand: string; sim: number } | null = null
  for (const cand of candidates) {
    const v = await embed(cand)
    const sim = cosine(q, v)
    if (!best || sim > best.sim) best = { cand, sim }
  }
  if (!best || best.sim < threshold) return null
  if (levenshtein(d, best.cand) > maxEdits) return null
  return {
    suggestion: best.cand,
    confidence: best.sim,
    reason: 'embedding_similarity',
  }
}
