import * as vue from 'vue';

/**
 * Type definitions for the email validation and normalization system.
 *
 * This file contains all shared type definitions used across the email
 * processing modules including validation, normalization, fuzzy matching,
 * AI suggestions, and Vue composables.
 */

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
type AiEmailSuggestion = {
    /** The suggested domain correction */
    suggestion: string;
    /** Confidence score for the suggestion (0-1) */
    confidence: number;
    /** Method used to generate the suggestion */
    reason: 'embedding_similarity';
};
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
type AiEmailOptions = {
    /** Custom candidate domains for suggestions */
    candidates?: string[];
    /** Transformer model to use for embeddings */
    model?: string;
    /** Minimum confidence threshold for suggestions */
    threshold?: number;
    /** Maximum edit distance to consider */
    maxEdits?: number;
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
/**
 * Options for AI-powered email normalization.
 *
 * Extends EmailNormOptions with AI functionality for intelligent domain suggestions.
 */
type EmailNormOptionsAI = EmailNormOptions & {
    /** AI-powered domain suggestion configuration */
    ai?: {
        /** Whether to enable AI domain suggestions */
        enabled?: boolean;
        /** Transformer model to use for embeddings */
        model?: string;
        /** Custom candidate domains for suggestions */
        candidates?: string[];
        /** Minimum confidence threshold for suggestions */
        threshold?: number;
        /** Maximum edit distance to consider */
        maxEdits?: number;
    };
};
type EmailNormResultAI = EmailNormResult & {
    ai?: {
        domain: string;
        confidence: number;
        reason: 'embedding_similarity';
    };
};

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
declare const DEFAULT_AI_EMBEDDING_CANDIDATES: readonly ["gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "live.com", "msn.com", "icloud.com", "me.com", "mac.com", "yahoo.com", "yahoo.co.uk", "proton.me", "fastmail.com", "zoho.com", "btinternet.co.uk", "virginmedia.com", "virginmedia.co.uk", "blueyonder.co.uk", "ntlworld.com", "ntlworld.co.uk", "talktalk.net", "talktalk.co.uk", "sky.com", "sky.co.uk", "salesforce.com", "atlassian.com", "slack.com", "github.com"];

/**
 * Convert email change code to human-readable reason.
 *
 * @param {EmailChangeCode} code
 * @returns {string | null}
 */
declare function changeCodeToReason(code: EmailChangeCode): string | null;
/**
 * Normalise and validate an email address.
 *
 * @param {string} raw
 * @param {EmailNormOptions} opts
 * @returns {EmailNormResult}
 */
declare function normaliseEmail(raw: string, opts?: EmailNormOptions): EmailNormResult;
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
declare function normaliseEmailWithAI(raw: string, opts?: EmailNormOptionsAI): Promise<EmailNormResultAI>;

/**
 * Convert a validation code to a human-readable reason.
 *
 * @param {EmailValidationCode} code
 * @returns {string | null}
 */
declare function validationCodeToReason(code: EmailValidationCode): string | null;
/**
 * Check if a string is empty.
 *
 * @param {string} raw
 * @returns {boolean}
 */
declare function isEmpty(raw: string): boolean;
/**
 * Check if email domain is blocklisted.
 *
 * @see DEFAULT_BLOCKLIST
 * @param {string} email - The full email address
 * @param {EmailBlockConfig} cfg
 * @returns {boolean}
 */
declare function blocklisted(email: string, cfg: EmailBlockConfig): boolean;
/**
 * Quick check if string looks like an email shape.
 *
 * @param {string} s
 * @returns {boolean}
 */
declare function looksLikeEmail(s: string): boolean;
/**
 * Check if email domain matches any in the provided domains map.
 *
 * @param {string} email
 * @param {Record<string, string>} domains
 * @returns {boolean}
 */
declare function checkDomain(email: string, domains: Record<string, string>): boolean;
/**
 * Check if email TLD matches any in the provided TLDs list.
 *
 * @param {string} email
 * @param {string[]} tlds
 * @returns {boolean}
 */
declare function checkTld(email: string, tlds: string[]): boolean;
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
declare function validateEmail(email: string, options?: EmailValidationOptions): ValidationResults;

/**
 * Get a domain suggestion using transformer embeddings vs a curated list.
 * Returns null if we’re not confident enough.
 */
declare function aiSuggestEmailDomain(domain: string, options?: AiEmailOptions): Promise<AiEmailSuggestion | null>;
declare function __clearCache(): void;

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

/**
 * Vue composable for email normalization and validation.
 *
 * Provides reactive email processing with automatic normalization, validation,
 * and optional auto-formatting. Returns reactive references and helper functions
 * to manage email input state.
 *
 * @param {string} initial - Initial email value (default: '')
 * @param {UseEmailOptions} opts - Configuration options
 * @returns {object} Email composable interface
 * @returns {Ref<string>} returns.value - Reactive email input value
 * @returns {ComputedRef<string | null>} returns.email - normalised email address
 * @returns {ComputedRef<boolean>} returns.valid - Whether the email is valid
 * @returns {ComputedRef<string[]>} returns.changes - List of changes made during normalization
 * @returns {ComputedRef<EmailNormResult>} returns.result - Full normalization result
 * @returns {Function} returns.apply - Apply normalised email to the input value
 * @returns {Function} returns.validate - Manually trigger validation
 */
declare function useEmail(initial?: string, opts?: UseEmailOptions): {
    value: vue.Ref<string, string>;
    email: vue.ComputedRef<string | null>;
    valid: vue.ComputedRef<boolean>;
    changes: vue.ComputedRef<string[]>;
    apply: () => void;
    validate: () => boolean;
};

/**
 * Email directive configurations
 *
 * Usage:
 * <input v-email="{ autoFormat: true, previewSelector: '#emailPreview' }" />
 * <input v-email="{ onnormalised: (result) => console.log(result) }" />
 */
type EmailOpts = EmailNormOptions & {
    /**
     * Automatically format the email input value on input/blur events
     *
     * @default false
     */
    autoFormat?: boolean;
    /**
     * Auto format events to listen to.
     *
     * @default { onInput: true, onBlur: true }
     */
    autoFormatEvents?: {
        onInput?: boolean;
        onBlur?: boolean;
    };
    /**
     * CSS selector for an element to preview the normalised email and its validity
     */
    previewSelector?: string;
    /**
     * Callback function called when the email is normalised
     *
     * @param {ReturnType<typeof normaliseEmail>} r The result of the normalization
     * @returns void
     */
    onnormalised?: (r: ReturnType<typeof normaliseEmail>) => void;
};
/**
 * Vue directive for normalizing and validating email inputs.
 *
 * Usage:
 * <input v-email="{ autoFormat: true, previewSelector: '#emailPreview' }" />
 * <input v-email="{ onnormalised: (result) => console.log(result) }" />
 *
 * The directive emits a 'directive:email:normalised' event when email normalization is complete.
 *
 * @param {HTMLInputElement} el The element the directive is bound to
 * @param {DirectiveBinding<EmailOpts>} binding The directive binding
 * @returns {void}
 */
declare const _default: {
    mounted(el: HTMLInputElement, binding: {
        value?: EmailOpts;
    }): void;
    /**
     * Runs the normalisation process and updates the email directive's options and preview element.
     *
     * @param {HTMLInputElement} el The element the directive is bound to
     * @param {DirectiveBinding<EmailOpts>} binding The directive binding
     * @returns {void}
     */
    updated(el: HTMLInputElement, binding: {
        value?: EmailOpts;
    }): void;
    /**
     * Cleans up event listeners and state when the directive is unbound.
     *
     * @param {HTMLInputElement} el The element the directive is bound to
     * @returns {void}
     */
    beforeUnmount(el: HTMLInputElement): void;
};

export { type AiEmailOptions, type AiEmailSuggestion, type ClosestDomainResult, DEFAULT_AI_EMBEDDING_CANDIDATES, DEFAULT_BLOCKLIST, DEFAULT_FIX_DOMAINS, DEFAULT_FIX_TLDS, DEFAULT_FUZZY_DOMAIN_CANDIDATES, type DomainCandidate, type EmailBlockConfig, type EmailChangeCode, EmailChangeCodes, _default as EmailDirective, type EmailFixResult, type EmailNormOptions, type EmailNormOptionsAI, type EmailNormResult, type EmailNormResultAI, type EmailOpts, type EmailValidationCode, EmailValidationCodes, type EmailValidationOptions, type FindClosestOptions, type UseEmailOptions, type ValidationResult, type ValidationResults, __clearCache, aiSuggestEmailDomain, blocklisted, changeCodeToReason, checkDomain, checkTld, findClosestDomain, isEmpty, levenshtein, looksLikeEmail, normaliseEmail, normaliseEmailWithAI, useEmail, validateEmail, validationCodeToReason };
