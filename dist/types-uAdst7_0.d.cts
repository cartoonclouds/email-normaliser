//#region src/utils/email/constants.d.ts
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
declare const DEFAULT_FIX_DOMAINS: Record<string, string>;
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
declare const DEFAULT_FIX_TLDS: Record<string, string>;
/**
 * Transliteration map for converting common international characters to ASCII.
 */
declare const TRANSLITERATION_MAP: Record<string, string>;
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
declare const DEFAULT_BLOCKLIST: EmailBlockConfig;
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
declare const EmailValidationCodes: Readonly<{
  /** Email address passed all validation checks */
  readonly VALID: "VALID";
  /** Email input was empty or only whitespace */
  readonly EMPTY: "EMPTY";
  /** Email format does not match valid email structure */
  readonly INVALID_FORMAT: "INVALID_FORMAT";
  /** Email domain is in the configured blocklist */
  readonly BLOCKLISTED: "BLOCKLISTED";
  /** Email domain matches a known typo in the corrections list */
  readonly INVALID_DOMAIN: "INVALID_DOMAIN";
  /** Email TLD matches a known typo in the corrections list */
  readonly INVALID_TLD: "INVALID_TLD";
  /** Email contains non-ASCII characters when ASCII-only mode is enabled */
  readonly NON_ASCII_CHARACTERS: "NON_ASCII_CHARACTERS";
  /** Email domain has a suggested correction based on fuzzy matching */
  readonly DOMAIN_SUGGESTION: "DOMAIN_SUGGESTION";
}>;
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
type EmailValidationCode = (typeof EmailValidationCodes)[keyof typeof EmailValidationCodes];
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
declare const EmailChangeCodes: Readonly<{
  /** Email input was empty or only whitespace */
  readonly EMPTY: "empty";
  /** Email was blocked by the configured blocklist */
  readonly BLOCKED_BY_LIST: "blocked_by_list";
  /** Replaced obfuscated "at" and "dot" text with @ and . symbols */
  readonly DEOBFUSCATED_AT_AND_DOT: "deobfuscated_at_and_dot";
  /** Applied domain and TLD typo corrections from the fix mappings */
  readonly FIXED_DOMAIN_AND_TLD_TYPOS: "fixed_domain_and_tld_typos";
  /** Applied fuzzy domain matching to correct likely domain typos */
  readonly FUZZY_DOMAIN_CORRECTION: "fuzzy_domain_correction";
  /** Email format was invalid and could not be normalised */
  readonly INVALID_EMAIL_SHAPE: "invalid_email_shape";
  /** Converted domain part to lowercase */
  readonly LOWERCASED_DOMAIN: "lowercased_domain";
  /** Converted Unicode symbols (＠, ．, 。) to ASCII equivalents */
  readonly NORMALISED_UNICODE_SYMBOLS: "normalised_unicode_symbols";
  /** Removed display names, comments, or angle bracket formatting */
  readonly STRIPPED_DISPLAY_NAME_AND_COMMENTS: "stripped_display_name_and_comments";
  /** Cleaned up spacing, punctuation, and formatting issues */
  readonly TIDIED_PUNCTUATION_AND_SPACING: "tidied_punctuation_and_spacing";
  /** Converted non-ASCII characters to ASCII equivalents or removed them */
  readonly CONVERTED_TO_ASCII: "converted_to_ascii";
}>;
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
type EmailChangeCode = (typeof EmailChangeCodes)[keyof typeof EmailChangeCodes];
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
declare const DEFAULT_FUZZY_DOMAIN_CANDIDATES: readonly ["gmail.com", "outlook.com", "hotmail.com", "live.com", "msn.com", "icloud.com", "me.com", "mac.com", "yahoo.com", "yahoo.co.uk", "googlemail.com", "proton.me", "fastmail.com", "zoho.com", "btinternet.co.uk", "talktalk.net", "talktalk.co.uk", "sky.com", "sky.co.uk", "virginmedia.com", "virginmedia.co.uk", "blueyonder.co.uk", "ntlworld.com", "ntlworld.co.uk"];
//#endregion
//#region src/utils/email/types.d.ts
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
type ValidationResult = {
  /** Whether this specific validation check passed */
  isValid: boolean;
  /** The specific validation code that was triggered */
  validationCode: EmailValidationCode;
  /** Human-readable explanation of the validation result */
  validationMessage: string;
  /** Domain suggestion information (only present for DOMAIN_SUGGESTION validation code) */
  suggestion?: {
    /** The original domain from the email */
    originalDomain: string;
    /** The suggested corrected domain */
    suggestedDomain: string;
    /** Confidence score for the suggestion (0-1, where 1 is highest confidence) */
    confidence: number;
  };
};
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
type ValidationResults = ValidationResult[];
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
type EmailBlockConfig = {
  block?: {
    /**
     * Exact match patterns.
     */
    exact?: string[];
    /**
     * Suffix match patterns.
     *
     * E.g. ".example" matches "user@example", "user@sub.example", etc.
     */
    suffix?: string[];
    /**
     * Wildcard patterns (*, ** supported).
     *
     * E.g. "*.mailinator.com" matches "user@123.mailinator.com"
     * E.g. "*.disposable.*" matches "user@temp.disposable.email"
     */
    wildcard?: string[];
    /**
     * TLD-only match patterns.
     *
     * E.g. ".zip", ".example" to block those TLDs.
     */
    tlds?: string[];
  };
  allow?: {
    /**
     * Exact match patterns that override the block list.
     *
     * E.g. if you block "*.example.com" but want to allow "company.example.com"
     */
    exact?: string[];
  };
};
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
type EmailValidationOptions = {
  /**
   * Blocklist configuration for email validation.
   *
   * @default DEFAULT_BLOCKLIST
   */
  blocklist?: EmailBlockConfig;
  /**
   * Fix common domain typos configuration.
   *
   * @default DEFAULT_FIX_DOMAINS
   */
  fixDomains?: Record<string, string>;
  /**
   * Fix common TLD typos configuration.
   *
   * @default DEFAULT_FIX_TLDS
   */
  fixTlds?: Record<string, string>;
  /**
   * Whether to allow only ASCII characters in email addresses.
   *
   * When `true` (default), non-ASCII characters will be considered invalid.
   * When `false`, international characters are allowed.
   *
   * @default true
   */
  asciiOnly?: boolean;
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
    enabled?: boolean;
    /**
     * Maximum edit distance for domain suggestions.
     * Lower values are more restrictive, higher values allow more distant matches.
     *
     * @default 2
     */
    maxDistance?: number;
    /**
     * Minimum confidence score (0-1) for domain suggestions.
     * Higher values only suggest very confident matches.
     *
     * @default 0.7
     */
    minConfidence?: number;
    /**
     * Additional domain candidates for fuzzy matching.
     * These will be combined with the built-in DEFAULT_FUZZY_DOMAIN_CANDIDATES list.
     *
     * @default DEFAULT_FUZZY_DOMAIN_CANDIDATES
     */
    candidates?: string[];
    /**
     * Additional fuzzy matching options passed to findClosestDomain.
     */
    findClosestOptions?: Omit<FindClosestOptions, 'candidates' | 'maxDistance'>;
  };
};
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
type EmailNormResult = {
  /** The normalised email address, or null if normalization failed */
  email: string | null;
  /** Whether the final normalised email passes validation */
  valid: boolean;
  /** Human-readable descriptions of all changes made during normalization */
  changes: string[];
  /** Machine-readable codes for all changes made during normalization */
  changeCodes: EmailChangeCode[];
};
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
type EmailNormOptions = {
  /**
   * Whether to enable normalization.
   *
   * @default true
   */
  enabled?: boolean;
  /**
   * Blocklist configuration for email validation (merges with default).
   *
   * @default DEFAULT_BLOCKLIST
   */
  blocklist?: EmailBlockConfig;
  /**
   * Fix common domain typos (merges with default).
   *
   * @default DEFAULT_FIX_DOMAINS
   */
  fixDomains?: Record<string, string>;
  /**
   * Fix common TLD typos (merges with default).
   *
   * @default DEFAULT_FIX_TLDS
   */
  fixTlds?: Record<string, string>;
  /**
   * Whether to allow only ASCII characters in email addresses.
   *
   * When `true` (default), non-ASCII characters will be considered invalid and
   * the normalization process will attempt to remove or transliterate them.
   * When `false`, international characters are allowed.
   *
   * @default true
   */
  asciiOnly?: boolean;
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
    enabled?: boolean;
    /**
     * Maximum edit distance for domain corrections.
     * Lower values are more restrictive, higher values allow more distant matches.
     *
     * @default 5
     */
    maxDistance?: number;
    /**
     * Minimum confidence score (0-1) for domain corrections.
     * Higher values only apply very confident corrections.
     *
     * @default 0.8
     */
    minConfidence?: number;
    /**
     * Additional domain candidates for fuzzy matching.
     * These will be combined with the built-in DEFAULT_FUZZY_DOMAIN_CANDIDATES list.
     *
     * @default []
     */
    candidates?: string[];
    /**
     * Additional fuzzy matching options passed to findClosestDomain.
     */
    findClosestOptions?: Omit<FindClosestOptions, 'candidates' | 'maxDistance'>;
  };
};
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
type EmailFixResult = {
  /** The transformed email string after applying the fix */
  out: string;
  /** Whether any changes were made during the transformation */
  changed: boolean;
};
/**
 * A domain candidate that can be used for fuzzy matching.
 *
 * Type derived from the DEFAULT_FUZZY_DOMAIN_CANDIDATES array to ensure type safety.
 */
type DomainCandidate = (typeof DEFAULT_FUZZY_DOMAIN_CANDIDATES)[number];
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
type ClosestDomainResult = {
  /** The input domain that was matched against */
  input: string;
  /** The best matching candidate domain, or null if no suitable match found */
  candidate: string | null;
  /** Edit distance to the best candidate (0 = exact match) */
  distance: number;
  /** normalised similarity score (0-1, where 1 = exact match) */
  normalisedScore: number;
  /** Index of the candidate in the candidates array (-1 if no match) */
  index: number;
};
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
type FindClosestOptions = {
  /** Array of candidate domains to match against */
  candidates?: string[];
  /**
   * Optional max acceptable edit distance. If no candidate is at or under this
   * distance, `candidate` will be null and `index` = -1. If omitted, always returns the best.
   *
   * A common heuristic is `Math.ceil(max(input.length, candidate.length) * 0.25)`
   */
  maxDistance?: number;
  /**
   * Pre-normalise (lowercase/trim) both input and candidates. Default true.
   */
  normalise?: boolean;
};
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
type UseEmailOptions = EmailNormOptions & {
  /** Whether to automatically apply normalization to the input value */
  autoFormat?: boolean;
};
//#endregion
export { EmailChangeCodes as _, EmailNormOptions as a, TRANSLITERATION_MAP as b, FindClosestOptions as c, ValidationResults as d, DEFAULT_BLOCKLIST as f, EmailChangeCode as g, DEFAULT_FUZZY_DOMAIN_CANDIDATES as h, EmailFixResult as i, UseEmailOptions as l, DEFAULT_FIX_TLDS as m, DomainCandidate as n, EmailNormResult as o, DEFAULT_FIX_DOMAINS as p, EmailBlockConfig as r, EmailValidationOptions as s, ClosestDomainResult as t, ValidationResult as u, EmailValidationCode as v, EmailValidationCodes as y };
//# sourceMappingURL=types-uAdst7_0.d.cts.map