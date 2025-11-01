import { aiSuggestEmailDomain } from './aiSuggestEmail'
import {
  DEFAULT_BLOCKLIST,
  DEFAULT_FIX_DOMAINS,
  DEFAULT_FIX_TLDS,
  DEFAULT_FUZZY_DOMAIN_CANDIDATES,
  type EmailChangeCode,
  EmailChangeCodes,
} from './constants'
import { findClosestDomain } from './fuzzyDomainMatching'
import type {
  AiEmailOptions,
  EmailFixResult,
  EmailNormOptions,
  EmailNormOptionsAI,
  EmailNormResult,
  EmailNormResultAI,
  FindClosestOptions,
} from './types'
import { blocklisted, isEmpty, looksLikeEmail } from './validateEmail'

// --- helpers -------------------------------------------------------

/**
 * Normalise fullwidth/Unicode variants of @ and .
 *
 * @param {string} s
 * @returns {EmailFixResult}
 */
function toAsciiLike(s: string): EmailFixResult {
  const out = s.replace(/[＠]/g, '@').replace(/[．。]/g, '.')

  return {
    out,
    changed: out !== s,
  }
}

/**
 * Remove or transliterate non-ASCII characters from email string.
 *
 * This function attempts basic transliteration for common international
 * characters and removes characters that can't be converted to ASCII.
 *
 * @param {string} s
 * @returns {EmailFixResult}
 */
function toAsciiOnly(s: string): EmailFixResult {
  const original = s
  let out = s

  // Basic transliteration map for common international characters
  const transliterationMap: Record<string, string> = {
    // Latin characters with diacritics
    à: 'a',
    á: 'a',
    â: 'a',
    ã: 'a',
    ä: 'a',
    å: 'a',
    æ: 'ae',
    ç: 'c',
    è: 'e',
    é: 'e',
    ê: 'e',
    ë: 'e',
    ì: 'i',
    í: 'i',
    î: 'i',
    ï: 'i',
    ñ: 'n',
    ò: 'o',
    ó: 'o',
    ô: 'o',
    õ: 'o',
    ö: 'o',
    ø: 'o',
    ù: 'u',
    ú: 'u',
    û: 'u',
    ü: 'u',
    ý: 'y',
    ÿ: 'y',
    ß: 'ss',
    // Uppercase versions
    À: 'A',
    Á: 'A',
    Â: 'A',
    Ã: 'A',
    Ä: 'A',
    Å: 'A',
    Æ: 'AE',
    Ç: 'C',
    È: 'E',
    É: 'E',
    Ê: 'E',
    Ë: 'E',
    Ì: 'I',
    Í: 'I',
    Î: 'I',
    Ï: 'I',
    Ñ: 'N',
    Ò: 'O',
    Ó: 'O',
    Ô: 'O',
    Õ: 'O',
    Ö: 'O',
    Ø: 'O',
    Ù: 'U',
    Ú: 'U',
    Û: 'U',
    Ü: 'U',
    Ý: 'Y',
  }

  // Apply transliteration
  for (const [nonAscii, ascii] of Object.entries(transliterationMap)) {
    out = out.replace(new RegExp(nonAscii, 'g'), ascii)
  }

  // Remove any remaining non-ASCII characters (printable ASCII range)
  out = out.replace(/[^ -~]/g, '')

  return {
    out,
    changed: out !== original,
  }
}

/**
 * Strip display name and comments from email string.
 *
 * @param {string} s
 * @returns {EmailFixResult}
 */
function stripDisplayNameAndComments(s: string): EmailFixResult {
  let out = s
  const m = out.match(/<\s*([^>]+)\s*>/)

  if (m) {
    out = m[1]
  }

  // remove (comments)
  const t = out.replace(/\s*\([^)]*\)\s*/g, '')

  return {
    out: t,
    changed: t !== s,
  }
}

/**
 * Deobfuscate common "at" and "dot" substitutions.
 *
 * @param {string} s
 * @returns {EmailFixResult}
 */
function deobfuscate(s: string): EmailFixResult {
  const original = s
  let out = s

  // Replace "at" with @ only when it's a standalone word or properly bracketed
  // This prevents replacing "at" within legitimate domain names like "mailinator.com"

  // Handle bracketed patterns first: [at], {at}, (at) -> @
  out = out.replace(/[([{]\s*at\s*[)\]}]/gi, '@')
  // Handle spaced patterns: " at " -> @
  out = out.replace(/\s+at\s+/gi, '@')

  // Handle bracketed dot patterns: [dot], {dot}, (dot) -> .
  out = out.replace(/[([{]\s*d[0o]t\s*[)\]}]/gi, '.')
  // Handle spaced dot patterns: " dot " -> .
  out = out.replace(/\s+d[0o]t\s+/gi, '.')

  // collapse multiple @ to a single @ (keep the first)
  out = out.replace(/@{2,}/g, '@')

  return {
    out,
    changed: out !== original,
  }
}

/**
 * Tidy up punctuation and spacing in email string.
 *
 * E.g. trims spaces, removes trailing commas/semicolons/dots,
 * compresses spaces around @ and ., replaces commas in domain part,
 * and collapses repeating dots.
 *
 * @param {string} s
 * @returns {EmailFixResult}
 */
function tidyPunctuation(s: string): EmailFixResult {
  const original = s
  let out = s.trim()
  // strip trailing comma/semicolon/dot
  out = out.replace(/[;,.]+$/g, '')
  // strip leading comma/semicolon/dot
  out = out.replace(/^[;,.]+/g, '')
  // compress whitespace around @ and .
  out = out.replace(/\s*@\s*/g, '@').replace(/\s*\.\s*/g, '.')
  // remove . after @
  out = out.replace(/@\./g, '@')
  // replace commas in domain part: a@gmail,com -> a@gmail.com
  const idx = out.indexOf('@')

  if (idx !== -1) {
    const local = out.slice(0, idx)
    const domain = out.slice(idx + 1).replace(/,/g, '.')
    out = `${local}@${domain}`
  }

  // replace repeating dots to one dot: "a..b" -> "a.b"
  out = out.replace(/\.{2,}/g, '.')

  return {
    out,
    changed: out !== original,
  }
}

/**
 * Apply domain and TLD fix maps to email string.
 *
 * @param {string} email
 * @param { domains: Record<string, string>, tlds: Record<string, string> } maps
 * @returns {EmailFixResult}
 */
function applyMaps(
  email: string,
  maps: {
    domains: Record<string, string>
    tlds: Record<string, string>
  }
): EmailFixResult {
  const idx = email.lastIndexOf('@')

  if (idx < 0) {
    return {
      out: email,
      changed: false,
    }
  }

  let local = email.slice(0, idx)
  let domain = email.slice(idx + 1)
  const originalDomain = domain

  // lowercase domain for predictability in mapping
  domain = domain.toLowerCase()

  // domain exact map
  if (maps.domains[domain]) {
    domain = maps.domains[domain]
  }

  // tld fixes (operate on the rightmost tld-ish substring)
  for (const [bad, good] of Object.entries(maps.tlds)) {
    if (domain.endsWith(bad)) {
      domain = domain.slice(0, domain.length - bad.length) + good
    }
  }

  // normalise casing of local minimally: keep as-is but trim quotes
  const originalLocal = local
  local = local.replace(/^"(.*)"$/, '$1')

  const out = `${local}@${domain}`

  // Check if actual changes were made beyond just lowercasing
  const domainMapsChanged = domain !== originalDomain.toLowerCase()
  const localChanged = local !== originalLocal

  return {
    out,
    changed: domainMapsChanged || localChanged,
  }
}

/**
 * Convert email change code to human-readable reason.
 *
 * @param {EmailChangeCode} code
 * @returns {string | null}
 */
export function changeCodeToReason(code: EmailChangeCode): string | null {
  switch (code) {
    case EmailChangeCodes.NORMALISED_UNICODE_SYMBOLS:
      return 'Replaced unicode symbols.'

    case EmailChangeCodes.INVALID_EMAIL_SHAPE:
      return 'Invalid email format.'

    case EmailChangeCodes.STRIPPED_DISPLAY_NAME_AND_COMMENTS:
      return 'Removed display name or comments.'

    case EmailChangeCodes.DEOBFUSCATED_AT_AND_DOT:
      return 'Fixed obfuscated "at" or "dot" substitutions.'

    case EmailChangeCodes.TIDIED_PUNCTUATION_AND_SPACING:
      return 'Tidied punctuation and spacing.'

    case EmailChangeCodes.FIXED_DOMAIN_AND_TLD_TYPOS:
      return 'Corrected common domain or TLD typos.'

    case EmailChangeCodes.FUZZY_DOMAIN_CORRECTION:
      return 'Corrected domain using fuzzy matching.'

    case EmailChangeCodes.LOWERCASED_DOMAIN:
      return 'Lowercased domain part.'

    case EmailChangeCodes.BLOCKED_BY_LIST:
      return 'Email is blocked.'

    case EmailChangeCodes.CONVERTED_TO_ASCII:
      return 'Converted non-ASCII characters to ASCII.'

    default:
      globalThis.console.warn(`Unknown email change code: ${code as string}`)

      return null
  }
}

/**
 * Map an array of email change codes to human-readable reasons.
 *
 * @param {EmailChangeCode[]} codes
 * @returns {string[]}
 */
function mapChangeCodesToReason(codes: EmailChangeCode[]): string[] {
  return codes.map(changeCodeToReason).filter((r): r is string => r !== null)
}

/**
 * Perform fuzzy domain correction for email normalization.
 *
 * Analyzes the email address and applies domain corrections
 * based on fuzzy string matching with confidence scoring.
 *
 * @param {string} email - The email address to analyze
 * @param {NonNullable<EmailNormOptions['fuzzyMatching']>} config - Fuzzy matching configuration
 * @returns {{ correctedEmail: string; wasChanged: boolean }} Result with corrected email and change flag
 *
 * @example
 * ```typescript
 * const result = performFuzzyDomainNormalization('user@gmaiil.com', {
 *   enabled: true,
 *   minConfidence: 0.8
 * })
 *
 * if (result.wasChanged) {
 *   console.log(`Corrected: ${result.correctedEmail}`) // "user@gmail.com"
 * }
 * ```
 */
function performFuzzyDomainNormalization(
  email: string,
  config: NonNullable<EmailNormOptions['fuzzyMatching']>
): { correctedEmail: string; wasChanged: boolean } {
  // Early return if not enabled or email doesn't look valid
  if (!config.enabled || !looksLikeEmail(email)) {
    return { correctedEmail: email, wasChanged: false }
  }

  const atIndex = email.lastIndexOf('@')
  if (atIndex === -1) {
    return { correctedEmail: email, wasChanged: false }
  }

  const localPart = email.slice(0, atIndex)
  const domainPart = email.slice(atIndex + 1)

  // Combine default candidates with any custom candidates provided
  const allCandidates = config.candidates
    ? [...DEFAULT_FUZZY_DOMAIN_CANDIDATES, ...config.candidates]
    : [...DEFAULT_FUZZY_DOMAIN_CANDIDATES]

  const fuzzyOptions: FindClosestOptions = {
    maxDistance: config.maxDistance ?? 5,
    candidates: allCandidates,
    ...(config.findClosestOptions || {}),
  }

  const result = findClosestDomain(domainPart, fuzzyOptions)
  const minConfidence = config.minConfidence ?? 0.8

  // Only apply correction if we found a candidate, it's different from input, and meets confidence threshold
  if (
    result.candidate &&
    result.candidate !== domainPart.toLowerCase() &&
    result.normalisedScore >= minConfidence &&
    result.distance > 0
  ) {
    const correctedEmail = `${localPart}@${result.candidate}`
    if (correctedEmail !== email) {
      return { correctedEmail, wasChanged: true }
    }
  }

  return { correctedEmail: email, wasChanged: false }
}

// --- main ----------------------------------------------------------

/**
 * Normalise and validate an email address.
 *
 * @param {string} raw
 * @param {EmailNormOptions} opts
 * @returns {EmailNormResult}
 */
export function normaliseEmail(
  raw: string,
  opts: EmailNormOptions = {}
): EmailNormResult {
  const changes: EmailChangeCode[] = []
  let s = String(raw || '').trim()

  const asciiOnly = opts.asciiOnly ?? true

  if (isEmpty(s)) {
    return {
      email: s,
      valid: false,
      changes,
      changeCodes: [],
    }
  }

  {
    const r = toAsciiLike(s)
    if (r.changed) {
      s = r.out
      changes.push(EmailChangeCodes.NORMALISED_UNICODE_SYMBOLS)
    }
  }

  {
    const r = stripDisplayNameAndComments(s)
    if (r.changed) {
      s = r.out
      changes.push(EmailChangeCodes.STRIPPED_DISPLAY_NAME_AND_COMMENTS)
    }
  }

  {
    const r = deobfuscate(s)
    if (r.changed) {
      s = r.out
      changes.push(EmailChangeCodes.DEOBFUSCATED_AT_AND_DOT)
    }
  }

  {
    const r = tidyPunctuation(s)
    if (r.changed) {
      s = r.out
      changes.push(EmailChangeCodes.TIDIED_PUNCTUATION_AND_SPACING)
    }
  }

  {
    const r = applyMaps(s, {
      domains: { ...DEFAULT_FIX_DOMAINS, ...(opts.fixDomains || {}) },
      tlds: { ...DEFAULT_FIX_TLDS, ...(opts.fixTlds || {}) },
    })
    if (r.changed) {
      s = r.out
      changes.push(EmailChangeCodes.FIXED_DOMAIN_AND_TLD_TYPOS)
    }
  }

  // Apply fuzzy domain matching if enabled
  const fuzzyConfig = opts.fuzzyMatching
  if (fuzzyConfig) {
    const fuzzyResult = performFuzzyDomainNormalization(s, fuzzyConfig)
    if (fuzzyResult.wasChanged) {
      s = fuzzyResult.correctedEmail
      changes.push(EmailChangeCodes.FUZZY_DOMAIN_CORRECTION)
    }
  }

  // Convert to ASCII only if requested
  if (asciiOnly) {
    const r = toAsciiOnly(s)
    if (r.changed) {
      s = r.out
      changes.push(EmailChangeCodes.CONVERTED_TO_ASCII)
    }
  }

  // lowercase domain
  const at = s.indexOf('@')
  if (at > -1) {
    const local = s.slice(0, at)
    const domain = s.slice(at + 1).toLowerCase()
    const next = `${local}@${domain}`
    if (next !== s) {
      s = next
      changes.push(EmailChangeCodes.LOWERCASED_DOMAIN)
    }
  }

  // blocklist check (before shape validation to ensure blocklist takes priority)
  const cfg = opts.blocklist || DEFAULT_BLOCKLIST
  if (blocklisted(s, cfg)) {
    return {
      email: s,
      valid: false,
      changeCodes: [...changes, EmailChangeCodes.BLOCKED_BY_LIST],
      changes: mapChangeCodesToReason([
        ...changes,
        EmailChangeCodes.BLOCKED_BY_LIST,
      ]),
    }
  }

  // quick shape validation
  if (!looksLikeEmail(s)) {
    changes.push(EmailChangeCodes.INVALID_EMAIL_SHAPE)

    return {
      email: s,
      valid: false,
      changeCodes: [...changes, EmailChangeCodes.INVALID_EMAIL_SHAPE],
      changes: mapChangeCodesToReason([
        ...changes,
        EmailChangeCodes.INVALID_EMAIL_SHAPE,
      ]),
    }
  }

  return {
    email: s,
    valid: true,
    changeCodes: changes,
    changes: mapChangeCodesToReason(changes),
  }
}

/**
 * # Valid Email Address Characters
 *
 * ## Local Part (before the @ symbol)
 *
 * ### Alphanumeric characters:
 * - Letters: `a-z A-Z` (case insensitive)
 * - Numbers: `0-9`
 *
 * ### Special characters allowed:
 * - Dot: `.` (but not at the beginning, end, or consecutively)
 * - Hyphen: `-`
 * - Underscore: `_`
 * - Plus: `+`
 * - Equals: `=`
 *
 * ### Additional characters (when quoted):
 * When the local part is enclosed in double quotes, these additional characters are allowed:
 * - Space: ` `
 * - Exclamation: `!`
 * - Hash: `#`
 * - Dollar: `$`
 * - Percent: `%`
 * - Ampersand: `&`
 * - Apostrophe: `'`
 * - Asterisk: `*`
 * - Forward slash: `/`
 * - Question mark: `?`
 * - Caret: `^`
 * - Backtick: `` ` ``
 * - Left brace: `{`
 * - Pipe: `|`
 * - Right brace: `}`
 * - Tilde: `~`
 *
 * ## Domain Part (after the @ symbol)
 *
 * ### Alphanumeric characters:
 * - Letters: `a-z A-Z` (case insensitive)
 * - Numbers: `0-9`
 *
 * ### Special characters:
 * - Hyphen: `-` (not at the beginning or end of a domain label)
 * - Dot: `.` (as a separator between domain labels)
 *
 * ## Complete Character Set Summary
 *
 * For practical email validation, the commonly accepted characters are:
 *
 * **Local part:** `a-z A-Z 0-9 . - _ +`
 *
 * **Domain part:** `a-z A-Z 0-9 . -`
 *
 * **Required separator:** `@`
 *
 * ## Regex Pattern Example
 *
 * Here's a TypeScript regex pattern for basic email validation that covers the most commonly used characters:
 *
 * ```typescript
 * const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
 * ```
 *
 * ## Important Notes
 *
 * 1. **International characters:** Modern email systems support internationalized domain names (IDN) and may accept Unicode characters
 * 2. **Length limits:** Local part max 64 characters, domain part max 253 characters
 * 3. **Practical vs. theoretical:** While the RFC allows many special characters when quoted, most email providers and validation systems use a more restrictive set
 * 4. **Case sensitivity:** Email addresses are generally treated as case-insensitive, though technically the local part can be case-sensitive
 *
 * For most web applications, focusing on the basic alphanumeric characters plus `.-_+` for the local part and `.-` for the domain part will cover 99%+ of real-world email addresses.
 */

/**
 * Async version: uses the same normalization flow and, if invalid (or dubious),
 * queries transformers.js embeddings to suggest a domain.
 *
 * @example
 * const result = await normaliseEmailWithAI("user@gmai.com", {
 *   ai: {
 *     enabled: true,
 *     model: "Xenova/all-MiniLM-L6-v2",
 *     candidates: ["gmail.com", "googlemail.com"],
 *     threshold: 0.8,
 *     maxEdits: 2,
 *   },
 * });
 * if (result.valid) {
 *   console.log(`Normalized email: ${result.email}`);
 * } else if (result.ai) {
 *   console.log(`Did you mean: ${result.email.split('@')[0]}@${result.ai.domain}? (confidence: ${result.ai.confidence})`);
 * }
 * ```
 *
 * @param {string} raw
 * @param {EmailNormOptionsAI} opts
 * @returns {Promise<EmailNormResultAI>}
 */
export async function normaliseEmailWithAI(
  raw: string,
  opts: EmailNormOptionsAI = {}
): Promise<EmailNormResultAI> {
  const base = normaliseEmail(raw, opts) // run your existing, synchronous logic first

  // If already valid, optionally still verify domain against candidates and attach ai meta (no change)
  if (base.valid || !opts.ai?.enabled) {
    return base as EmailNormResultAI
  }

  const at = String(raw).lastIndexOf('@')
  if (at < 0) return base as EmailNormResultAI

  const domainRaw = String(raw).slice(at + 1)
  const aiOpts: AiEmailOptions = {
    model: opts.ai?.model,
    candidates: opts.ai?.candidates,
    threshold: opts.ai?.threshold,
    maxEdits: opts.ai?.maxEdits,
  }

  try {
    const hit = await aiSuggestEmailDomain(domainRaw, aiOpts)
    if (!hit) return base as EmailNormResultAI

    // Don't auto-accept if the domain is blocklisted
    const cfg = opts.blocklist
    const blocked = cfg
      ? ((): boolean => {
          const d = hit.suggestion.toLowerCase()
          const exact = (cfg.block?.exact ?? []).map((s: string) =>
            s.toLowerCase()
          )
          if (exact.includes(d)) return true
          for (const t of cfg.block?.tlds ?? [])
            if (d.endsWith(String(t).toLowerCase())) return true
          for (const s of cfg.block?.suffix ?? [])
            if (d.endsWith(String(s).toLowerCase())) return true
          for (const w of cfg.block?.wildcard ?? []) {
            const re = new RegExp(
              '^' +
                String(w)
                  .toLowerCase()
                  .replace(/[.+^${}()|[\]\\]/g, '\\$&')
                  .replace(/\*/g, '.*')
                  .replace(/\?/g, '.') +
                '$',
              'i'
            )
            if (re.test(d)) return true
          }
          return false
        })()
      : false

    if (blocked) return base as EmailNormResultAI

    // Provide suggestion (UI can display “Did you mean local@<suggestion>?”)
    return {
      ...base,
      ai: {
        domain: hit.suggestion,
        confidence: hit.confidence,
        reason: hit.reason,
      },
    }
  } catch {
    return base as EmailNormResultAI
  }
}
