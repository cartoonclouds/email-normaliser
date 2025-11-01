/**
 * Type definitions for the email validation and normalization system.
 *
 * This file contains all shared type definitions used across the email
 * processing modules including validation, normalization, fuzzy matching,
 * AI suggestions, and Vue composables.
 */
import type {
  DEFAULT_FUZZY_DOMAIN_CANDIDATES,
  EmailChangeCode,
  EmailValidationCode,
} from './constants'

// --- Validation Types ---

/**
 * Individual validation result for a specific validation check.
 *
 * Contains the validation status, the specific validation code that was triggered,
 * and a human-readable message explaining the validation result. For domain
 * suggestion validation results, includes the suggested domain correction.
 *
 * @example
 * ```typescript
 * const result: ValidationResult = {
 *   isValid: false,
 *   validationCode: EmailValidationCodes.INVALID_FORMAT,
 *   validationMessage: 'Email is not in a valid format.'
 * }
 *
 * const suggestionResult: ValidationResult = {
 *   isValid: false,
 *   validationCode: EmailValidationCodes.DOMAIN_SUGGESTION,
 *   validationMessage: 'Did you mean: user@gmail.com?',
 *   suggestion: {
 *     originalDomain: 'gmai.com',
 *     suggestedDomain: 'gmail.com',
 *     confidence: 0.89
 *   }
 * }
 * ```
 */
export type ValidationResult = {
  /** Whether this specific validation check passed */
  isValid: boolean
  /** The specific validation code that was triggered */
  validationCode: EmailValidationCode
  /** Human-readable explanation of the validation result */
  validationMessage: string
  /** Domain suggestion information (only present for DOMAIN_SUGGESTION validation code) */
  suggestion?: {
    /** The original domain from the email */
    originalDomain: string
    /** The suggested corrected domain */
    suggestedDomain: string
    /** Confidence score for the suggestion (0-1, where 1 is highest confidence) */
    confidence: number
  }
}

/**
 * Array of validation results from all validation checks performed on an email address.
 *
 * If the email is valid, this will contain a single ValidationResult with isValid: true.
 * If the email is invalid, this will contain one or more ValidationResult objects
 * describing each validation failure.
 *
 * @example
 * ```typescript
 * const results: ValidationResults = validateEmail('invalid@')
 * // results = [{
 * //   isValid: false,
 * //   validationCode: 'INVALID_FORMAT',
 * //   validationMessage: 'Email is not in a valid format.'
 * // }]
 * ```
 */
export type ValidationResults = ValidationResult[]

/**
 * Block/allow configuration for domains and TLDs.
 *
 * You can combine exact, suffix, wildcard and TLD rules, and then punch holes
 * via `allow.exact`. Values are compared case-insensitively.
 *
 * @example
 * ```ts
 * const cfg: EmailBlockConfig = {
 *   block: {
 *     exact: ['example.com', 'test.local'],
 *     suffix: ['.invalid', '.local'],
 *     wildcard: ['*.mailinator.com', '*.disposable.*'],
 *     tlds: ['.zip', '.example']
 *   },
 *   allow: { exact: ['my-team.example.com'] }
 * };
 * ```
 *
 * @example
 * ```ts
 * // Checking a domain against the config:
 * isBlocked('user@mailinator.com', cfg)  // → true (wildcard)
 * isBlocked('boss@my-team.example.com', cfg) // → false (allow.exact)
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
     * E.g. ".example" matches "user@example", "user@sub.example", etc.
     */
    suffix?: string[]
    /**
     * Wildcard patterns (*, ** supported).
     *
     * E.g. "*.mailinator.com" matches "user@123.mailinator.com"
     * E.g. "*.disposable.*" matches "user@temp.disposable.email"
     */
    wildcard?: string[]
    /**
     * TLD-only match patterns.
     *
     * E.g. ".zip", ".example" to block those TLDs.
     */
    tlds?: string[]
  }
  allow?: {
    /**
     * Exact match patterns that override the block list.
     *
     * E.g. if you block "*.example.com" but want to allow "company.example.com"
     */
    exact?: string[]
  }
}

/**
 * Configuration options for email validation.
 *
 * Allows customization of the validation process by providing custom
 * domain corrections, TLD corrections, blocklist rules, ASCII-only validation,
 * and fuzzy domain matching for intelligent suggestions.
 *
 * @example
 * ```typescript
 * const options: EmailValidationOptions = {
 *   fixDomains: { 'mytypo.com': 'correct.com' },
 *   fixTlds: { '.typo': '.com' },
 *   blocklist: {
 *     block: { exact: ['unwanted.domain'] }
 *   },
 *   asciiOnly: true,
 *   fuzzyMatching: {
 *     enabled: true,
 *     maxDistance: 2,
 *     minConfidence: 0.7
 *   }
 * }
 * ```
 */
export type EmailValidationOptions = {
  /**
   * Blocklist configuration for email validation.
   *
   * @default DEFAULT_BLOCKLIST
   */
  blocklist?: EmailBlockConfig
  /**
   * Fix common domain typos configuration.
   *
   * @default DEFAULT_FIX_DOMAINS
   */
  fixDomains?: Record<string, string>
  /**
   * Fix common TLD typos configuration.
   *
   * @default DEFAULT_FIX_TLDS
   */
  fixTlds?: Record<string, string>
  /**
   * Whether to allow only ASCII characters in email addresses.
   *
   * When `true` (default), non-ASCII characters will be considered invalid.
   * When `false`, international characters are allowed.
   *
   * @default true
   */
  asciiOnly?: boolean
  /**
   * Configuration for fuzzy domain matching.
   *
   * When enabled, provides intelligent domain suggestions for typos.
   */
  fuzzyMatching?: {
    /**
     * Whether to enable fuzzy domain matching.
     *
     * @default false
     */
    enabled?: boolean
    /**
     * Maximum edit distance for domain suggestions.
     * Lower values are more restrictive, higher values allow more distant matches.
     *
     * @default 2
     */
    maxDistance?: number
    /**
     * Minimum confidence score (0-1) for domain suggestions.
     * Higher values only suggest very confident matches.
     *
     * @default 0.7
     */
    minConfidence?: number
    /**
     * Additional domain candidates for fuzzy matching.
     * These will be combined with the built-in DEFAULT_FUZZY_DOMAIN_CANDIDATES list.
     *
     * @default DEFAULT_FUZZY_DOMAIN_CANDIDATES
     */
    candidates?: string[]
    /**
     * Additional fuzzy matching options passed to findClosestDomain.
     */
    findClosestOptions?: Omit<FindClosestOptions, 'candidates' | 'maxDistance'>
  }
}

// --- Normalization Types ---

/**
 * The result of email normalization containing the processed email and metadata.
 *
 * @example
 * ```typescript
 * const result = normaliseEmail('  User+tag@GMaÍl.com  ');
 * // result.email → 'user@gmail.com'
 * // result.valid → true
 * // result.changes → ["trimmed whitespace", "lowercased", "fixed common domain typo: gmai → gmail", "removed non-ASCII: É → E"]
 * // result.changeCodes → ["TRIM", "LOWERCASE", "FIX_DOMAIN_TYPO", "NON_ASCII_REMOVED"]
 * ```
 */
export type EmailNormResult = {
  /** The normalised email address, or null if normalization failed */
  email: string | null
  /** Whether the final normalised email passes validation */
  valid: boolean
  /** Human-readable descriptions of all changes made during normalization */
  changes: string[]
  /** Machine-readable codes for all changes made during normalization */
  changeCodes: EmailChangeCode[]
}

/**
 * Options that influence normalisation behaviour.
 *
 * All maps are merged with sensible defaults (see constants). Set `asciiOnly`
 * to `false` to accept internationalised mail addresses (IDN/UTF-8 local-parts).
 *
 * @example
 * ```ts
 * const opts: EmailNormOptions = {
 *   blocklist: { block: { wildcard: ['*.throwaway.*'] } },
 *   fixDomains: { 'gmai.com': 'gmail.com' },
 *   fixTlds: { '.con': '.com' },
 *   asciiOnly: true
 * };
 *
 * const r = normaliseEmail('José@exämple.con', opts);
 * // → "jose@example.com"
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
  /**
   * Whether to allow only ASCII characters in email addresses.
   *
   * When `true` (default), non-ASCII characters will be considered invalid and
   * the normalization process will attempt to remove or transliterate them.
   * When `false`, international characters are allowed.
   *
   * @default true
   */
  asciiOnly?: boolean
  /**
   * Fuzzy domain matching configuration for intelligent domain corrections.
   *
   * When enabled, applies fuzzy string matching to detect and correct
   * potential domain typos that aren't covered by the exact fix mappings.
   */
  fuzzyMatching?: {
    /**
     * Whether to enable fuzzy domain matching.
     *
     * @default false
     */
    enabled?: boolean
    /**
     * Maximum edit distance for domain corrections.
     * Lower values are more restrictive, higher values allow more distant matches.
     *
     * @default 5
     */
    maxDistance?: number
    /**
     * Minimum confidence score (0-1) for domain corrections.
     * Higher values only apply very confident corrections.
     *
     * @default 0.8
     */
    minConfidence?: number
    /**
     * Additional domain candidates for fuzzy matching.
     * These will be combined with the built-in DEFAULT_FUZZY_DOMAIN_CANDIDATES list.
     *
     * @default []
     */
    candidates?: string[]
    /**
     * Additional fuzzy matching options passed to findClosestDomain.
     */
    findClosestOptions?: Omit<FindClosestOptions, 'candidates' | 'maxDistance'>
  }
}

/**
 * Result object returned by individual email transformation functions.
 *
 * Used internally by normalization helper functions to indicate whether
 * a specific transformation was applied and what the resulting string is.
 *
 * @example
 * ```typescript
 * const result: EmailFixResult = toAsciiLike('ｊｏｈｎ＠ｅｘａｍｐｌｅ．ｃｏｍ');
 * // result.out    → "john@example.com"
 * // result.changed → true
 * ```
 */
export type EmailFixResult = {
  /** The transformed email string after applying the fix */
  out: string
  /** Whether any changes were made during the transformation */
  changed: boolean
}

// --- Fuzzy Domain Matching Types ---

/**
 * A domain candidate that can be used for fuzzy matching.
 *
 * Type derived from the DEFAULT_FUZZY_DOMAIN_CANDIDATES array to ensure type safety.
 */
export type DomainCandidate = (typeof DEFAULT_FUZZY_DOMAIN_CANDIDATES)[number]

/**
 * Result of finding the closest domain match using fuzzy matching.
 *
 * @example
 * ```typescript
 * const result: ClosestDomainResult = {
 *   input: 'gmai.com',
 *   candidate: 'gmail.com',
 *   distance: 1,
 *   normalisedScore: 0.89,
 *   index: 0
 * }
 * ```
 */
export type ClosestDomainResult = {
  /** The input domain that was matched against */
  input: string
  /** The best matching candidate domain, or null if no suitable match found */
  candidate: string | null
  /** Edit distance to the best candidate (0 = exact match) */
  distance: number
  /** normalised similarity score (0-1, where 1 = exact match) */
  normalisedScore: number
  /** Index of the candidate in the candidates array (-1 if no match) */
  index: number
}

/**
 * Options for fuzzy domain matching.
 *
 * @example
 * ```typescript
 * const options: FindClosestOptions = {
 *   candidates: ['gmail.com', 'googlemail.com'],
 *   maxDistance: 2,
 *   normalise: true
 * }
 *
 * const result = findClosestDomain('gmai.com', options);
 * ```
 */
export type FindClosestOptions = {
  /** Array of candidate domains to match against */
  candidates?: string[]
  /**
   * Optional max acceptable edit distance. If no candidate is at or under this
   * distance, `candidate` will be null and `index` = -1. If omitted, always returns the best.
   *
   * A common heuristic is `Math.ceil(max(input.length, candidate.length) * 0.25)`
   */
  maxDistance?: number
  /**
   * Pre-normalise (lowercase/trim) both input and candidates. Default true.
   */
  normalise?: boolean
}

// --- AI Suggestion Types ---

/**
 * AI-powered email domain suggestion result.
 *
 * @example
 * ```typescript
 * const suggestion: AiEmailSuggestion = {
 *   suggestion: 'gmail.com',
 *   confidence: 0.92,
 *   reason: 'embedding_similarity'
 * }
 * ```
 */
export type AiEmailSuggestion = {
  /** The suggested domain correction */
  suggestion: string
  /** Confidence score for the suggestion (0-1) */
  confidence: number
  /** Method used to generate the suggestion */
  reason: 'embedding_similarity'
}

/**
 * Configuration options for AI-powered email suggestions.
 *
 * @example
 * ```typescript
 * const options: AiEmailOptions = {
 *   candidates: ['gmail.com', 'outlook.com'],
 *   model: 'Xenova/all-MiniLM-L6-v2',
 *   threshold: 0.8,
 *   maxEdits: 3
 * }
 * ```
 */
export type AiEmailOptions = {
  /** Custom candidate domains for suggestions */
  candidates?: string[]
  /** Transformer model to use for embeddings */
  model?: string
  /** Minimum confidence threshold for suggestions */
  threshold?: number
  /** Maximum edit distance to consider */
  maxEdits?: number
}

// --- Composable Types ---

/**
 * Configuration options for the Vue email composable.
 *
 * Extends EmailNormOptions with additional Vue-specific features.
 *
 * @example
 * ```typescript
 * const options: UseEmailOptions = {
 *   autoFormat: true,
 *   fixDomains: { 'gmai.com': 'gmail.com' },
 *   blocklist: {
 *     block: { exact: ['spam.com'] }
 *   }
 * }
 * ```
 */
export type UseEmailOptions = EmailNormOptions & {
  /** Whether to automatically apply normalization to the input value */
  autoFormat?: boolean
}

/**
 * Options for AI-powered email normalization.
 *
 * Extends EmailNormOptions with AI functionality for intelligent domain suggestions.
 */
export type EmailNormOptionsAI = EmailNormOptions & {
  /** AI-powered domain suggestion configuration */
  ai?: {
    /** Whether to enable AI domain suggestions */
    enabled?: boolean
    /** Transformer model to use for embeddings */
    model?: string
    /** Custom candidate domains for suggestions */
    candidates?: string[]
    /** Minimum confidence threshold for suggestions */
    threshold?: number
    /** Maximum edit distance to consider */
    maxEdits?: number
  }
}

export type EmailNormResultAI = EmailNormResult & {
  ai?: {
    // present only if a suggestion is available
    domain: string
    confidence: number
    reason: 'embedding_similarity'
  }
}
