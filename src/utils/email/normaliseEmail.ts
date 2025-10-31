import {
  DEFAULT_BLOCKLIST,
  DEFAULT_FIX_DOMAINS,
  DEFAULT_FIX_TLDS,
} from './constants'

// --- types and constants ------------------------------------------

/**
 * Result object returned by the email normalization process.
 *
 * Contains the normalized email address, validation status, and detailed
 * information about all transformations that were applied during processing.
 *
 * @example
 * ```typescript
 * const result = normaliseEmail('User@GMAIL.CO')
 * // result = {
 * //   email: 'User@gmail.com',
 * //   valid: true,
 * //   changes: ['Corrected common domain or TLD typos', 'Lowercased domain part'],
 * //   changeCodes: ['fixed_domain_and_tld_typos', 'lowercased_domain']
 * // }
 * ```
 */
export type EmailNormResult = {
  /** The normalized email address, or null if normalization failed */
  email: string | null
  /** Whether the final normalized email passes validation */
  valid: boolean
  /** Human-readable descriptions of all changes made during normalization */
  changes: string[]
  /** Machine-readable codes for all changes made during normalization */
  changeCodes: EmailChangeCode[]
}

/**
 * Enumeration of all possible email normalization change codes.
 *
 * These machine-readable codes represent specific transformations that can be
 * applied during the email normalization process. Each code corresponds to a
 * specific step in the normalization pipeline.
 *
 * @example
 * ```typescript
 * const result = normaliseEmail('User (comment) at gmail dot com')
 * // result.changeCodes might include:
 * // ['stripped_display_name_and_comments', 'deobfuscated_at_and_dot', 'lowercased_domain']
 * ```
 */
export const EmailChangeCodes = Object.freeze({
  /** Email input was empty or only whitespace */
  EMPTY: 'empty',
  /** Email was blocked by the configured blocklist */
  BLOCKED_BY_LIST: 'blocked_by_list',
  /** Replaced obfuscated "at" and "dot" text with @ and . symbols */
  DEOBFUSCATED_AT_AND_DOT: 'deobfuscated_at_and_dot',
  /** Applied domain and TLD typo corrections from the fix mappings */
  FIXED_DOMAIN_AND_TLD_TYPOS: 'fixed_domain_and_tld_typos',
  /** Email format was invalid and could not be normalized */
  INVALID_EMAIL_SHAPE: 'invalid_email_shape',
  /** Converted domain part to lowercase */
  LOWERCASED_DOMAIN: 'lowercased_domain',
  /** Converted Unicode symbols (＠, ．, 。) to ASCII equivalents */
  NORMALIZED_UNICODE_SYMBOLS: 'normalized_unicode_symbols',
  /** Removed display names, comments, or angle bracket formatting */
  STRIPPED_DISPLAY_NAME_AND_COMMENTS: 'stripped_display_name_and_comments',
  /** Cleaned up spacing, punctuation, and formatting issues */
  TIDIED_PUNCTUATION_AND_SPACING: 'tidied_punctuation_and_spacing',
} as const)

/**
 * Type representing any valid email change code from the EmailChangeCodes enumeration.
 *
 * This is a union type of all possible change code values that can be returned
 * during email normalization.
 */
export type EmailChangeCode =
  (typeof EmailChangeCodes)[keyof typeof EmailChangeCodes]

/**
 * Configuration object for email domain and pattern blocking.
 *
 * Defines rules for blocking unwanted email addresses using various matching
 * strategies including exact matches, suffix patterns, wildcard patterns, and
 * TLD-based blocking. Also supports allowlist overrides.
 *
 * @example
 * ```typescript
 * const blockConfig: EmailBlockConfig = {
 *   block: {
 *     exact: ['spam.com', 'fake.domain'],
 *     suffix: ['.temp', '.test'],
 *     wildcard: ['*.mailinator.*', '*.throwaway.*'],
 *     tlds: ['.invalid', '.test']
 *   },
 *   allow: {
 *     exact: ['important.test'] // Override block rules for specific domains
 *   }
 * }
 * ```
 */
export type EmailBlockConfig = {
  block?: {
    /**
     * Exact match patterns.
     */
    exact?: string[]
    /**
     * Suffix match patterns.
     *
     * E.g. ".example" matches "user@example", "
     */
    suffix?: string[]
    /**
     * Wildcard match patterns.
     *
     * E.g. "*.mailinator.com" matches "abc.mailinator.com", "xyz.mailinator.com.au", etc.
     */
    wildcard?: string[]
    /**
     * Top-level domains to block.
     *
     * E.g. ".test", ".invalid"
     */
    tlds?: string[]
  }
  /** Allowlist configuration that overrides block rules for specific domains */
  allow?: {
    /** Exact domain matches that should be allowed despite being in block rules */
    exact?: string[]
  }
}

/**
 * Configuration options for email normalization behavior.
 *
 * Allows customization of the normalization process by providing custom
 * domain corrections, TLD corrections, and blocklist rules that will be
 * merged with the default configurations.
 *
 * @example
 * ```typescript
 * const options: EmailNormOptions = {
 *   fixDomains: { 'mytypo.com': 'correct.com' },
 *   fixTlds: { '.typo': '.com' },
 *   blocklist: {
 *     block: { exact: ['unwanted.domain'] }
 *   }
 * }
 * ```
 */
export type EmailNormOptions = {
  /**
   * Blocklist configuration for email validation (merges with default).
   *
   * @default DEFAULT_BLOCKLIST
   */
  blocklist?: EmailBlockConfig
  /**
   * Fix common domain typos (merges with default).
   *
   * @default DEFAULT_FIX_DOMAINS
   */
  fixDomains?: Record<string, string>
  /**
   * Fix common TLD typos (merges with default).
   *
   * @default DEFAULT_FIX_TLDS
   */
  fixTlds?: Record<string, string>
}

/**
 * Result object returned by individual email transformation functions.
 *
 * Used internally by normalization helper functions to indicate whether
 * a specific transformation was applied and what the resulting string is.
 *
 * @example
 * ```typescript
 * const result = toAsciiLike('user＠domain．com')
 * // result = { out: 'user@domain.com', changed: true }
 * ```
 */
export type EmailFixResult = {
  /** The transformed email string after applying the fix */
  out: string
  /** Whether any changes were made during the transformation */
  changed: boolean
}

// --- helpers -------------------------------------------------------

/**
 * Normalize fullwidth/Unicode variants of @ and .
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

  // normalize casing of local minimally: keep as-is but trim quotes
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
 * Check if email domain is blocklisted.
 *
 * @see DEFAULT_BLOCKLIST
 * @param {string} email - The full email address
 * @param {EmailBlockConfig} cfg
 * @returns {boolean}
 */
function blocklisted(email: string, cfg: EmailBlockConfig): boolean {
  // Extract domain from email
  const atIndex = email.lastIndexOf('@')
  if (atIndex === -1) {
    return false // No @ symbol, not a valid email format
  }

  const domain = email.slice(atIndex + 1)
  const d = domain.toLowerCase()

  // allowlist overrides
  const allowExact = (cfg.allow?.exact ?? []).map((s) => s.toLowerCase())
  if (allowExact.includes(d)) {
    return false
  }

  // exact
  const exact = (cfg.block?.exact ?? []).map((s) => s.toLowerCase())
  if (exact.includes(d)) {
    return true
  }

  // tlds
  for (const t of cfg.block?.tlds ?? []) {
    const tt = t.toLowerCase()
    if (tt && d.endsWith(tt)) {
      return true
    }
  }

  // suffix
  for (const s of cfg.block?.suffix ?? []) {
    const ss = s.toLowerCase()
    if (ss && d.endsWith(ss)) {
      return true
    }
  }

  // wildcard
  for (const w of cfg.block?.wildcard ?? []) {
    const pat = String(w).toLowerCase()

    if (!pat) {
      continue
    }

    // fnmatch-like simple convert
    // * -> .*
    // ? -> .
    // escape other regex chars
    const re = new RegExp(
      '^' +
        pat
          .replace(/[.+^${}()|[\]\\]/g, '\\$&')
          .replace(/\*/g, '.*')
          .replace(/\?/g, '.') +
        '$',
      'i'
    )

    if (re.test(d)) {
      return true
    }
  }

  // explicit example/test base domains
  if (/@(example|test)\./i.test(`@${d}`)) {
    return true
  }

  return false
}

/**
 * Quick check if string looks like an email shape.
 *
 * @param {string} s
 * @returns {boolean}
 */
function looksLikeEmail(s: string): boolean {
  // Explain regex:
  // ^                 : start of string
  // [^@\s"<>]+        : one or more characters that are not @, whitespace, " or <
  // @                 : literal @ symbol
  // [A-Za-z0-9.-]+    : one or more alphanumeric characters, dots or hyphens
  // \.                : literal dot
  // [A-Za-z]{2,}      : two or more alphabetic characters
  const m = s.match(/^[^@\s"<>;,)(]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)

  return !!m
}

/**
 * Convert email change code to human-readable reason.
 *
 * @param {EmailChangeCode} code
 * @returns {string | null}
 */
export function changeCodeToReason(code: EmailChangeCode): string | null {
  switch (code) {
    case EmailChangeCodes.NORMALIZED_UNICODE_SYMBOLS:
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

    case EmailChangeCodes.LOWERCASED_DOMAIN:
      return 'Lowercased domain part.'

    case EmailChangeCodes.BLOCKED_BY_LIST:
      return 'Email is blocked.'

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

// --- main ----------------------------------------------------------

/**
 * Normalize and validate an email address.
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

  if (s === '') {
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
      changes.push(EmailChangeCodes.NORMALIZED_UNICODE_SYMBOLS)
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

  // blocklist check
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
