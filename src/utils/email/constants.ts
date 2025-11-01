import type { EmailBlockConfig } from './types'

/**
 * Default domain correction mappings for common email provider typos and variations.
 *
 * This object contains mappings from commonly misspelled or variant domain names
 * to their correct counterparts. It includes typos for major email providers
 * like Gmail, Hotmail, Outlook, Yahoo, iCloud, and others.
 *
 * @example
 * ```typescript
 * // "gamil.com" will be corrected to "gmail.com"
 * // "hotmial.com" will be corrected to "hotmail.com"
 * normaliseEmail('user@gamil.com') // Returns email normalised to 'user@gmail.com'
 * ```
 *
 * Categories included:
 * - Gmail variations (15 mappings)
 * - Hotmail variations (9 mappings)
 * - Outlook variations (9 mappings)
 * - Yahoo variations (9 mappings)
 * - iCloud variations (7 mappings)
 * - UK domain variations (6 mappings)
 * - Other providers (9 mappings)
 * - Business domains (3 mappings)
 * - Additional typos (4 mappings)
 */
export const DEFAULT_FIX_DOMAINS: Record<string, string> = {
  // Gmail variations
  'gamil.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'googlemail.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmali.com': 'gmail.com',
  'gail.com': 'gmail.com',
  'gmeil.com': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmail.cim': 'gmail.com',
  'gmail.vom': 'gmail.com',
  'gmail.c0m': 'gmail.com',
  'gmsil.com': 'gmail.com',

  // Hotmail variations
  'hotnail.com': 'hotmail.com',
  'hotmial.com': 'hotmail.com',
  'hotmali.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmil.com': 'hotmail.com',
  'hotmaill.com': 'hotmail.com',
  'hotmail.co': 'hotmail.com',
  'hotmail.con': 'hotmail.com',
  'hotmeil.com': 'hotmail.com',

  // Outlook variations
  'outlok.com': 'outlook.com',
  'outllok.com': 'outlook.com',
  'outlool.com': 'outlook.com',
  'outloook.com': 'outlook.com',
  'outlook.co': 'outlook.com',
  'outlook.con': 'outlook.com',
  'outlookl.com': 'outlook.com',
  'outook.com': 'outlook.com',
  'otlook.com': 'outlook.com',

  // Yahoo variations
  'yahho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'yahoo.co': 'yahoo.com',
  'yahoo.con': 'yahoo.com',
  'yohoo.com': 'yahoo.com',
  'yhoo.com': 'yahoo.com',
  'yahool.com': 'yahoo.com',
  'yaoo.com': 'yahoo.com',

  // iCloud variations
  'icloud.co': 'icloud.com',
  'icloud.con': 'icloud.com',
  'icould.com': 'icloud.com',
  'iclound.com': 'icloud.com',
  'iclod.com': 'icloud.com',
  'iclud.com': 'icloud.com',
  'icaloud.com': 'icloud.com',

  // UK domain variations
  'outlook.co,uk': 'outlook.co.uk',
  'hotmail.co,uk': 'hotmail.co.uk',
  'btinternet.co,uk': 'btinternet.co.uk',
  'gmail.co,uk': 'gmail.co.uk',
  'yahoo.co,uk': 'yahoo.co.uk',
  'live.co,uk': 'live.co.uk',

  // Other common providers
  'aol.co': 'aol.com',
  'aol.con': 'aol.com',
  'comcast.nte': 'comcast.net',
  'comcas.net': 'comcast.net',
  'verizon.nte': 'verizon.net',
  'verison.net': 'verizon.net',
  'sbcglobal.nte': 'sbcglobal.net',
  'earthlink.nte': 'earthlink.net',
  'cox.nte': 'cox.net',

  // Business/work emails
  'compan.com': 'company.com',
  'compnay.com': 'company.com',
  'corperation.com': 'corporation.com',

  // Additional common typos
  'live.co': 'live.com',
  'live.con': 'live.com',
  'msn.co': 'msn.com',
  'msn.con': 'msn.com',
}

/**
 * Default Top-Level Domain (TLD) correction mappings for common typos.
 *
 * This object contains mappings from commonly misspelled TLD endings
 * to their correct counterparts. It helps fix typos in email addresses
 * where users have mistyped the domain extension.
 *
 * @example
 * ```typescript
 * // ".con" will be corrected to ".com"
 * // ".co,uk" will be corrected to ".co.uk"
 * normaliseEmail('user@example.con') // Returns email normalised to 'user@example.com'
 * ```
 *
 * Categories included:
 * - .com variations (16 mappings): .cpm, .con, .ocm, .vom, etc.
 * - .net variations (10 mappings): .ne, .nt, .bet, .met, etc.
 * - .org variations (8 mappings): .ogr, .or, .og, .orh, etc.
 * - .edu variations (5 mappings): .ed, .eud, .deu, etc.
 * - .co.uk variations (9 mappings): .co,uk, .couk, .co.k, etc.
 * - Generic TLD variations (4 mappings): .inf → .info, .bi → .biz
 * - Mobile TLD variations (2 mappings): .mob → .mobi, .mobile → .mobi
 */
export const DEFAULT_FIX_TLDS: Record<string, string> = {
  // Common .com typos
  '.cpm': '.com',
  '.con': '.com',
  '.ocm': '.com',
  '.vom': '.com',
  '.co': '.com',
  '.cm': '.com',
  '.om': '.com',
  '.cmo': '.com',
  '.comm': '.com',
  '.comn': '.com',
  '.c0m': '.com',
  '.cim': '.com',
  '.xom': '.com',
  '.fom': '.com',
  '.dom': '.com',
  '.coom': '.com',

  // Common .net typos
  '.ne': '.net',
  '.nt': '.net',
  '.bet': '.net',
  '.met': '.net',
  '.jet': '.net',
  '.nett': '.net',
  '.netr': '.net',
  '.het': '.net',
  '.nwt': '.net',
  '.nte': '.net',

  // Common .org typos
  '.ogr': '.org',
  '.or': '.org',
  '.og': '.org',
  '.orh': '.org',
  '.orgg': '.org',
  '.orgr': '.org',
  '.0rg': '.org',
  '.prg': '.org',

  // Common .edu typos
  '.ed': '.edu',
  '.eud': '.edu',
  '.deu': '.edu',
  '.eduu': '.edu',
  '.wdu': '.edu',

  // UK domain variations
  '.co,uk': '.co.uk',
  '.couk': '.co.uk',
  '.co.k': '.co.uk',
  '.co.u': '.co.uk',
  '.c.uk': '.co.uk',
  '.co.ik': '.co.uk',
  '.co.ul': '.co.uk',
  '.co.ukk': '.co.uk',
  '.cou.k': '.co.uk',

  // Generic TLD typos
  '.inf': '.info',
  '.inof': '.info',
  '.bi': '.biz',
  '.bizz': '.biz',

  // Mobile/new TLD typos
  '.mob': '.mobi',
  '.mobile': '.mobi',
}

/**
 * Default email blocklist configuration to prevent invalid or unwanted email addresses.
 *
 * This configuration defines patterns for blocking certain types of email addresses,
 * including test domains, temporary email services, and example domains that should
 * not be used in production environments.
 *
 * @example
 * ```typescript
 * // These emails will be blocked:
 * normaliseEmail('user@example.com')      // blocked by exact match
 * normaliseEmail('user@test.mailinator.com') // blocked by wildcard pattern
 * normaliseEmail('user@domain.test')      // blocked by TLD
 * ```
 *
 * Blocking categories:
 * - **Exact domains** (5 entries): Specific domains like example.com, test.com
 * - **Suffix patterns** (2 entries): Domains ending with .example, .test
 * - **Wildcard patterns** (3 entries): Pattern matching for temporary email services
 * - **Blocked TLDs** (4 entries): Top-level domains like .test, .invalid, .example
 *
 * The configuration also supports an allowlist that can override blocked domains
 * for specific exceptions when needed.
 */
export const DEFAULT_BLOCKLIST: EmailBlockConfig = {
  block: {
    exact: [
      'example.com',
      'test.com',
      'mailinator.com',
      '10minutemail.com',
      'guerrillamail.com',
    ],
    suffix: ['.example', '.test'],
    wildcard: ['*.mailinator.com', '*.tempmail.*', '*.discard.email'],
    tlds: ['.test', '.invalid', '.example', '.localhost'],
  },
  allow: { exact: [] },
}

// --- Email Validation Codes -----------------------------------------------

/**
 * Enumeration of all possible email validation result codes.
 *
 * These codes represent the different validation states an email address
 * can have during the validation process. Each code corresponds to a
 * specific validation check.
 *
 * @example
 * ```typescript
 * const results = validateEmail('user@invalid-domain')
 * // results[0].validationCode might be EmailValidationCodes.INVALID_DOMAIN
 * ```
 */
export const EmailValidationCodes = Object.freeze({
  /** Email address passed all validation checks */
  VALID: 'VALID',
  /** Email input was empty or only whitespace */
  EMPTY: 'EMPTY',
  /** Email format does not match valid email structure */
  INVALID_FORMAT: 'INVALID_FORMAT',
  /** Email domain is in the configured blocklist */
  BLOCKLISTED: 'BLOCKLISTED',
  /** Email domain matches a known typo in the corrections list */
  INVALID_DOMAIN: 'INVALID_DOMAIN',
  /** Email TLD matches a known typo in the corrections list */
  INVALID_TLD: 'INVALID_TLD',
  /** Email contains non-ASCII characters when ASCII-only mode is enabled */
  NON_ASCII_CHARACTERS: 'NON_ASCII_CHARACTERS',
  /** Email domain has a suggested correction based on fuzzy matching */
  DOMAIN_SUGGESTION: 'DOMAIN_SUGGESTION',
} as const)

/**
 * Type representing any valid email validation code from the EmailValidationCodes enumeration.
 *
 * This is a union type of all possible validation code values that can be returned
 * during email validation.
 *
 * @example
 * ```ts
 * function isFormatError(code: EmailValidationCode) {
 *   return code === EmailValidationCodes.INVALID_FORMAT;
 * }
 * ```
 */
export type EmailValidationCode =
  (typeof EmailValidationCodes)[keyof typeof EmailValidationCodes]

// --- Email Change Codes ---------------------------------------------------

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
  /** Applied fuzzy domain matching to correct likely domain typos */
  FUZZY_DOMAIN_CORRECTION: 'fuzzy_domain_correction',
  /** Email format was invalid and could not be normalised */
  INVALID_EMAIL_SHAPE: 'invalid_email_shape',
  /** Converted domain part to lowercase */
  LOWERCASED_DOMAIN: 'lowercased_domain',
  /** Converted Unicode symbols (＠, ．, 。) to ASCII equivalents */
  NORMALISED_UNICODE_SYMBOLS: 'normalised_unicode_symbols',
  /** Removed display names, comments, or angle bracket formatting */
  STRIPPED_DISPLAY_NAME_AND_COMMENTS: 'stripped_display_name_and_comments',
  /** Cleaned up spacing, punctuation, and formatting issues */
  TIDIED_PUNCTUATION_AND_SPACING: 'tidied_punctuation_and_spacing',
  /** Converted non-ASCII characters to ASCII equivalents or removed them */
  CONVERTED_TO_ASCII: 'converted_to_ascii',
} as const)

/**
 * Machine-readable code for a single normalization change.
 *
 * This is the union of the values from `EmailChangeCodes`. Use it to build
 * analytics, filtering, or to toggle UI badges without stringly-typed checks.
 *
 * @example
 * ```ts
 * function hasAsciiFix(r: EmailNormResult) {
 *   return r.changeCodes.includes(EmailChangeCodes.CONVERTED_TO_ASCII as EmailChangeCode);
 * }
 * ```
 */
export type EmailChangeCode =
  (typeof EmailChangeCodes)[keyof typeof EmailChangeCodes]

/**
 * Default list of popular email domains used for fuzzy domain matching.
 *
 * This readonly array contains a curated list of common email service provider
 * domains. It is used as the default candidate list for fuzzy matching algorithms
 * to suggest corrections for misspelled or mistyped email domains.
 *
 * @example
 * ```typescript
 * // "gmai.com" will be suggested as "gmail.com"
 * const suggestion = findClosestDomain('gmai.com', DEFAULT_FUZZY_DOMAIN_CANDIDATES);
 * console.log(suggestion); // { domain: 'gmail.com', distance: 1 }
 * ```
 */
export const DEFAULT_FUZZY_DOMAIN_CANDIDATES = [
  // Global majors
  'gmail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',

  // Apple
  'icloud.com',
  'me.com',
  'mac.com',

  // Yahoo (global + UK)
  'yahoo.com',
  'yahoo.co.uk',

  // Google legacy alias
  'googlemail.com',

  // Privacy & indie providers
  'proton.me',
  'fastmail.com',
  'zoho.com',

  // Popular UK ISPs (still seen in the wild)
  'btinternet.co.uk',
  'talktalk.net',
  'talktalk.co.uk',
  'sky.com',
  'sky.co.uk',
  'virginmedia.com',
  'virginmedia.co.uk',
  'blueyonder.co.uk',
  'ntlworld.com',
  'ntlworld.co.uk',
] as const

/**
 * Default list of email domains used for AI embedding-based domain suggestions.
 *
 * This readonly array contains a comprehensive list of common email service provider
 * domains plus popular SaaS/corporate domains. It is used as the default candidate
 * list for AI-powered domain suggestion algorithms that use transformer embeddings
 * to find semantically similar domain names.
 *
 * The list includes consumer email providers, UK ISPs, and common business domains
 * that users might be trying to type when they make typos.
 *
 * @example
 * ```typescript
 * // "gmial.com" will be suggested as "gmail.com" using embedding similarity
 * const suggestion = await aiSuggestEmailDomain('gmial.com', {
 *   candidates: DEFAULT_AI_EMBEDDING_CANDIDATES
 * });
 * console.log(suggestion); // { suggestion: 'gmail.com', confidence: 0.85, reason: 'embedding_similarity' }
 * ```
 */
export const DEFAULT_AI_EMBEDDING_CANDIDATES = [
  // Consumer email providers
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
  // UK ISPs
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
  // Common SaaS/corporate domains
  'salesforce.com',
  'atlassian.com',
  'slack.com',
  'github.com',
] as const
