import {
  DEFAULT_BLOCKLIST,
  DEFAULT_FIX_DOMAINS,
  DEFAULT_FIX_TLDS,
  DEFAULT_FUZZY_DOMAIN_CANDIDATES,
  type EmailValidationCode,
  EmailValidationCodes,
} from './constants'
import { findClosestDomain } from './fuzzyDomainMatching'
import type {
  EmailBlockConfig,
  EmailValidationOptions,
  FindClosestOptions,
  ValidationResult,
  ValidationResults,
} from './types'

// --- helpers -------------------------------------------------------

// --- helpers -------------------------------------------------------

/**
 * Convert a validation code to a human-readable reason.
 *
 * @param {EmailValidationCode} code
 * @returns {string | null}
 */
export function validationCodeToReason(
  code: EmailValidationCode
): string | null {
  switch (code) {
    case EmailValidationCodes.EMPTY:
      return 'Email is empty.'

    case EmailValidationCodes.INVALID_FORMAT:
      return 'Email is not in a valid format.'

    case EmailValidationCodes.BLOCKLISTED:
      return 'Email domain is blocklisted.'

    case EmailValidationCodes.INVALID_DOMAIN:
      return 'Email domain is invalid.'

    case EmailValidationCodes.INVALID_TLD:
      return 'Email top-level domain (TLD) is invalid.'

    case EmailValidationCodes.NON_ASCII_CHARACTERS:
      return 'Email contains non-ASCII characters.'

    case EmailValidationCodes.VALID:
      return 'Email is valid.'

    case EmailValidationCodes.DOMAIN_SUGGESTION:
      return 'Email domain has a suggested correction.'

    default:
      console.debug(`Unknown validation code: ${code as string}`)

      return null
  }
}

/**
 * Check if a string is empty.
 *
 * @param {string} raw
 * @returns {boolean}
 */
export function isEmpty(raw: string): boolean {
  const s = String(raw || '').trim()

  return s.length === 0
}

/**
 * Check if email domain is blocklisted.
 *
 * @see DEFAULT_BLOCKLIST
 * @param {string} email - The full email address
 * @param {EmailBlockConfig} cfg
 * @returns {boolean}
 */
export function blocklisted(email: string, cfg: EmailBlockConfig): boolean {
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
export function looksLikeEmail(s: string): boolean {
  // More permissive email validation that allows:
  // - International characters in local part
  // - TLDs of 2+ characters (including newer TLDs like .evil, .tech, etc.)
  // - Basic structure validation: local@domain.tld

  // Check for consecutive dots first
  if (s.includes('..')) {
    return false
  }

  // Basic structure check: must have exactly one @ and at least one dot after @
  const atIndex = s.indexOf('@')
  if (atIndex === -1 || s.indexOf('@', atIndex + 1) !== -1) {
    return false // No @ or multiple @
  }

  const local = s.slice(0, atIndex)
  const domain = s.slice(atIndex + 1)

  // Local part must not be empty and not start/end with dot
  if (!local || local.startsWith('.') || local.endsWith('.')) {
    return false
  }

  // Check for invalid characters in local part using regex
  // Matches: space, quote, angle brackets, semicolon, comma, parentheses, square brackets, curly brackets
  if (/[ "<>;,()[\]{}]/.test(local)) {
    return false
  }

  // Domain must not be empty
  if (!domain) {
    return false
  }

  // Check for invalid characters in domain using regex
  // Matches: space, semicolon, comma, parentheses, plus, square brackets, curly brackets, angle brackets, underscore
  if (/[ ;,(){}<>_+[\]]/.test(domain)) {
    return false
  }

  // Domain must have at least one dot and not start/end with dot or hyphen
  if (!/\./.test(domain) || /^[.-]|[.-]$/.test(domain)) {
    return false
  }

  // TLD must be at least 2 characters and contain only letters
  const tldMatch = domain.match(/\.([a-zA-Z]{2,})$/)
  if (!tldMatch) {
    return false
  }

  return true
}

/**
 * Check if email domain matches any in the provided domains map.
 *
 * @param {string} email
 * @param {Record<string, string>} domains
 * @returns {boolean}
 */
export function checkDomain(
  email: string,
  domains: Record<string, string>
): boolean {
  const idx = email.lastIndexOf('@')

  if (idx < 0) {
    return false
  }

  let domain = email.slice(idx + 1)

  // lowercase domain for predictability in mapping
  domain = domain.toLowerCase()

  // domain exact map
  return !!domains[domain]
}

/**
 * Check if email TLD matches any in the provided TLDs list.
 *
 * @param {string} email
 * @param {string[]} tlds
 * @returns {boolean}
 */
export function checkTld(email: string, tlds: string[]): boolean {
  const idx = email.lastIndexOf('@')

  if (idx < 0) {
    return false
  }

  let domain = email.slice(idx + 1)

  // lowercase domain for predictability in mapping
  domain = domain.toLowerCase()

  // check if domain ends with any of the invalid TLDs
  return tlds.some((tld) => {
    // Handle TLDs that already include the dot prefix
    if (tld.startsWith('.')) {
      return domain.endsWith(tld)
    }
    // Handle TLDs without dot prefix
    return domain.endsWith(`.${tld}`)
  })
}

/**
 * Check if a string contains non-ASCII characters.
 *
 * @param {string} text - The text to check
 * @returns True if the text contains non-ASCII characters
 */
function hasNonAsciiCharacters(text: string): boolean {
  return /[^\x20-\x7E]/.test(text)
}

/**
 * Perform fuzzy domain matching for email validation suggestions.
 *
 * Analyzes the email address and provides domain correction suggestions
 * based on fuzzy string matching with confidence scoring.
 *
 * @param {string} email - The email address to analyze
 * @param {NonNullable<EmailValidationOptions['fuzzyMatching']>} config - Fuzzy matching configuration
 * @returns {ValidationResult | null} Validation result with domain suggestion or null if no suggestion
 *
 * @example
 * ```typescript
 * const suggestion = performFuzzyDomainValidation('user@gmaiil.com', {
 *   enabled: true,
 *   minConfidence: 0.7
 * })
 *
 * if (suggestion) {
 *   console.log(suggestion.validationMessage) // "Did you mean: user@gmail.com?"
 *   console.log(suggestion.suggestion?.confidence) // 0.89
 * }
 * ```
 */
function performFuzzyDomainValidation(
  email: string,
  config: NonNullable<EmailValidationOptions['fuzzyMatching']>
): ValidationResult | null {
  // Early return if not enabled or email doesn't look valid
  if (!config.enabled || !looksLikeEmail(email)) {
    return null
  }

  const atIndex = email.lastIndexOf('@')
  if (atIndex === -1) {
    return null
  }

  const localPart = email.slice(0, atIndex)
  const domainPart = email.slice(atIndex + 1)

  // Combine default candidates with any custom candidates provided
  const allCandidates = config.candidates
    ? [...DEFAULT_FUZZY_DOMAIN_CANDIDATES, ...config.candidates]
    : [...DEFAULT_FUZZY_DOMAIN_CANDIDATES] // Convert readonly array to mutable array

  const fuzzyOptions: FindClosestOptions = {
    maxDistance: config.maxDistance ?? 5, // Increased default to allow for more distant matches
    candidates: allCandidates,
    ...(config.findClosestOptions || {}),
  }

  const result = findClosestDomain(domainPart, fuzzyOptions)
  const minConfidence = config.minConfidence ?? 0.7

  // Only suggest if we found a candidate, it's different from input, and meets confidence threshold
  if (
    result.candidate &&
    result.candidate !== domainPart.toLowerCase() &&
    result.normalizedScore >= minConfidence &&
    result.distance > 0
  ) {
    const suggestedEmail = `${localPart}@${result.candidate}`
    return {
      isValid: false,
      validationCode: EmailValidationCodes.DOMAIN_SUGGESTION,
      validationMessage: `Did you mean: ${suggestedEmail}?`,
      suggestion: {
        originalDomain: domainPart,
        suggestedDomain: result.candidate,
        confidence: result.normalizedScore,
      },
    }
  }

  return null
}

/**
 * Validate an email address and return validation results.
 *
 * Performs comprehensive validation including:
 * - Format validation (basic email structure)
 * - Domain validation (common typos and corrections)
 * - TLD validation (top-level domain corrections)
 * - Blocklist checking (known bad domains)
 * - ASCII-only validation (when enabled)
 * - Fuzzy domain matching for intelligent suggestions (when enabled)
 *
 * @param {string} email - The email address to validate
 * @param {EmailValidationOptions} options - Optional validation configuration
 * @returns {ValidationResults}
 *
 * @example
 * ```typescript
 * const results = validateEmail('user@example.com')
 * // Basic validation with defaults
 *
 * const customResults = validateEmail('user@typo.co', {
 *   fixTlds: { '.co': '.com' },
 *   asciiOnly: true
 * })
 * // Custom validation with TLD correction and ASCII-only
 *
 * const fuzzyResults = validateEmail('user@gmai.com', {
 *   fuzzyMatching: {
 *     enabled: true,
 *     maxDistance: 2,
 *     minConfidence: 0.7
 *   }
 * })
 * // Fuzzy validation with domain suggestions: suggests gmail.com
 * ```
 */
export function validateEmail(
  email: string,
  options: EmailValidationOptions = {}
): ValidationResults {
  const validationResults: ValidationResults = []

  // Merge provided options with defaults (except blocklist which completely replaces)
  const fixDomains = { ...DEFAULT_FIX_DOMAINS, ...(options.fixDomains || {}) }
  const fixTlds = { ...DEFAULT_FIX_TLDS, ...(options.fixTlds || {}) }
  const blocklist = options.blocklist || DEFAULT_BLOCKLIST
  const asciiOnly = options.asciiOnly ?? true

  if (isEmpty(email)) {
    validationResults.push({
      isValid: false,
      validationCode: EmailValidationCodes.EMPTY,
      validationMessage: validationCodeToReason(
        EmailValidationCodes.EMPTY
      ) as string,
    })
  }

  if (!looksLikeEmail(email)) {
    validationResults.push({
      isValid: false,
      validationCode: EmailValidationCodes.INVALID_FORMAT,
      validationMessage: validationCodeToReason(
        EmailValidationCodes.INVALID_FORMAT
      ) as string,
    })
  }

  if (checkDomain(email, fixDomains)) {
    validationResults.push({
      isValid: false,
      validationCode: EmailValidationCodes.INVALID_DOMAIN,
      validationMessage: validationCodeToReason(
        EmailValidationCodes.INVALID_DOMAIN
      ) as string,
    })
  }

  if (checkTld(email, Object.keys(fixTlds))) {
    validationResults.push({
      isValid: false,
      validationCode: EmailValidationCodes.INVALID_TLD,
      validationMessage: validationCodeToReason(
        EmailValidationCodes.INVALID_TLD
      ) as string,
    })
  }

  // Check if email domain is blocklisted
  if (blocklisted(email, blocklist)) {
    validationResults.push({
      isValid: false,
      validationCode: EmailValidationCodes.BLOCKLISTED,
      validationMessage: validationCodeToReason(
        EmailValidationCodes.BLOCKLISTED
      ) as string,
    })
  }

  // Check for non-ASCII characters if asciiOnly option is enabled
  if (asciiOnly && hasNonAsciiCharacters(email)) {
    validationResults.push({
      isValid: false,
      validationCode: EmailValidationCodes.NON_ASCII_CHARACTERS,
      validationMessage: validationCodeToReason(
        EmailValidationCodes.NON_ASCII_CHARACTERS
      ) as string,
    })
  }

  // Perform fuzzy domain matching if enabled and email has basic structure
  const fuzzyConfig = options.fuzzyMatching
  if (fuzzyConfig) {
    const fuzzyResult = performFuzzyDomainValidation(email, fuzzyConfig)
    if (fuzzyResult) {
      validationResults.push(fuzzyResult)
    }
  }

  return validationResults.length
    ? validationResults
    : [
        {
          isValid: true,
          validationCode: EmailValidationCodes.VALID,
          validationMessage: validationCodeToReason(
            EmailValidationCodes.VALID
          ) as string,
        },
      ]
}
