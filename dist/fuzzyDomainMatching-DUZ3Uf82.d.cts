import { c as FindClosestOptions, t as ClosestDomainResult } from "./types-uAdst7_0.cjs";

//#region src/utils/email/fuzzyDomainMatching.d.ts

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
declare function levenshtein(a: string, b: string, maxDistance?: number): number;
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
declare function findClosestDomain(input: string, opts?: FindClosestOptions): ClosestDomainResult;
//#endregion
export { levenshtein as n, findClosestDomain as t };
//# sourceMappingURL=fuzzyDomainMatching-DUZ3Uf82.d.cts.map