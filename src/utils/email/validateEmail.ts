import {
  DEFAULT_BLOCKLIST,
  DEFAULT_FIX_DOMAINS,
  DEFAULT_FIX_TLDS,
} from './constants'
import type { EmailBlockConfig } from './normaliseEmail'

// --- types -------------------------------------------------------
export const EmailValidationCodes = Object.freeze({
  VALID: 'VALID',
  EMPTY: 'EMPTY',
  INVALID_FORMAT: 'INVALID_FORMAT',
  BLOCKLISTED: 'BLOCKLISTED',
  INVALID_DOMAIN: 'INVALID_DOMAIN',
  INVALID_TLD: 'INVALID_TLD',
} as const)

export type EmailValidationCode =
  (typeof EmailValidationCodes)[keyof typeof EmailValidationCodes]

type ValidationResult = {
  isValid: boolean
  validationCode: EmailValidationCode
  validationMessage: string
}

type ValidationResults = ValidationResult[]

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

    case EmailValidationCodes.VALID:
      return 'Email is valid.'

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
function isEmpty(raw: string): boolean {
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
  // ^                                    : start of string
  // [a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]       : first character cannot be a dot
  // [a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]*     : followed by zero or more valid characters (including dots)
  // @                                    : literal @ symbol
  // [a-zA-Z0-9]                          : domain must start with alphanumeric
  // ([a-zA-Z0-9-]*[a-zA-Z0-9])?         : optional middle part (alphanumeric + hyphens, ending with alphanumeric)
  // (\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)* : zero or more dot-separated parts
  // \.                                   : literal dot before TLD
  // [a-zA-Z]{2,3}                        : two or three alphabetic characters (strict TLD check)
  // $                                    : end of string

  // Check for consecutive dots first
  if (s.includes('..')) {
    return false
  }

  const m = s.match(
    /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-][a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]*@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,3}$/
  )

  return !!m
}

/**
 * Check if email domain matches any in the provided domains map.
 *
 * @param {string} email
 * @param {Record<string, string>} domains
 * @returns {boolean}
 */
function checkDomain(email: string, domains: Record<string, string>): boolean {
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
function checkTld(email: string, tlds: string[]): boolean {
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
 * Validate an email address and return validation results.
 *
 * @param {string} email
 * @returns {ValidationResults}
 */
export function validateEmail(email: string): ValidationResults {
  const validationResults: ValidationResults = []

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

  if (checkDomain(email, DEFAULT_FIX_DOMAINS)) {
    validationResults.push({
      isValid: false,
      validationCode: EmailValidationCodes.INVALID_DOMAIN,
      validationMessage: validationCodeToReason(
        EmailValidationCodes.INVALID_DOMAIN
      ) as string,
    })
  }

  if (checkTld(email, Object.keys(DEFAULT_FIX_TLDS))) {
    validationResults.push({
      isValid: false,
      validationCode: EmailValidationCodes.INVALID_TLD,
      validationMessage: validationCodeToReason(
        EmailValidationCodes.INVALID_TLD
      ) as string,
    })
  }

  // Check if email domain is blocklisted
  if (blocklisted(email, DEFAULT_BLOCKLIST)) {
    validationResults.push({
      isValid: false,
      validationCode: EmailValidationCodes.BLOCKLISTED,
      validationMessage: validationCodeToReason(
        EmailValidationCodes.BLOCKLISTED
      ) as string,
    })
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
