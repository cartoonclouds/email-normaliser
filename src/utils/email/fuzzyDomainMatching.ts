import { DEFAULT_FUZZY_DOMAIN_CANDIDATES } from './constants'
import type {
  ClosestDomainResult,
  DomainCandidate,
  FindClosestOptions,
} from './types'

/**
 * Compute Levenshtein distance (edit distance) between two ASCII-ish strings.
 * Optimized with two rolling rows; optional early exit with `maxDistance`.
 *
 * @example
 * levenshtein('gmai.com', 'gmail.com') // -> 1
 *
 * @param {string} a The first string
 * @param {string} b The second string
 * @param {number} [maxDistance=Infinity] Optional max distance for early exit
 * @returns {number} The Levenshtein distance between the two strings
 */
export function levenshtein(
  a: string,
  b: string,
  maxDistance = Infinity
): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  // Cheap bound: if length delta already exceeds the threshold, bail early.
  const lenDiff = Math.abs(a.length - b.length)
  if (lenDiff > maxDistance) return maxDistance + 1

  // Ensure a is the shorter string to keep memory small.
  if (a.length > b.length) [a, b] = [b, a]

  const aLen = a.length
  const bLen = b.length

  let prev = new Array(aLen + 1)
  let curr = new Array(aLen + 1)

  for (let i = 0; i <= aLen; i++) prev[i] = i

  for (let j = 1; j <= bLen; j++) {
    const bj = b.charCodeAt(j - 1)
    curr[0] = j

    // Track the smallest value in this row to early-exit if it already exceeds maxDistance
    let rowMin = curr[0]

    for (let i = 1; i <= aLen; i++) {
      const cost = a.charCodeAt(i - 1) === bj ? 0 : 1
      const del = prev[i] + 1
      const ins = curr[i - 1] + 1
      const sub = prev[i - 1] + cost
      const v = del < ins ? (del < sub ? del : sub) : ins < sub ? ins : sub
      curr[i] = v
      if (v < rowMin) rowMin = v
    }

    if (rowMin > maxDistance) return maxDistance + 1
    ;[prev, curr] = [curr, prev]
  }

  return prev[aLen]
}

/**
 * Find the closest domain from a list of candidates using Levenshtein distance.
 *
 * @example
 * findClosestDomain('gmai.com')
 * // → gmail.com (distance 1, score ~0.88)
 *
 * @example
 * findClosestDomain('virginmeda.co.uk', { maxDistance: 3 })
 * // → virginmedia.co.uk (distance 1, score ~0.92)
 *
 * @param {string} input The input domain to match
 * @param {FindClosestOptions} [opts={}] Options for finding the closest domain
 * @returns {ClosestDomainResult} The closest domain result
 */
export function findClosestDomain(
  input: string,
  opts: FindClosestOptions = {}
): ClosestDomainResult {
  const {
    candidates = DEFAULT_FUZZY_DOMAIN_CANDIDATES as Readonly<DomainCandidate[]>,
    maxDistance = Infinity,
    normalise = true,
  } = opts
  const combinedCandidates: string[] = [
    ...DEFAULT_FUZZY_DOMAIN_CANDIDATES,
    ...candidates,
  ]

  const norm = (s: string) => (normalise ? s.trim().toLowerCase() : s)
  const q = norm(input)

  let bestIdx = -1
  let bestCandidate: string | null = null
  let bestDist = Number.POSITIVE_INFINITY

  for (let i = 0; i < combinedCandidates.length; i++) {
    const c = norm(String(combinedCandidates[i]))
    const dist = levenshtein(q, c, maxDistance)
    if (dist < bestDist) {
      bestDist = dist
      bestCandidate = c
      bestIdx = i
      if (bestDist === 0) break // perfect match, can stop
    }
  }

  // Enforce threshold if provided
  if (bestDist > maxDistance) {
    return {
      input,
      candidate: null,
      distance: bestDist,
      normalisedScore: 0,
      index: -1,
    }
  }

  const denom = Math.max(q.length, bestCandidate ? bestCandidate.length : 1)
  const normalisedScore = denom > 0 ? 1 - bestDist / denom : 1

  return {
    input,
    candidate: bestCandidate,
    distance: bestDist,
    normalisedScore,
    index: bestIdx,
  }
}
