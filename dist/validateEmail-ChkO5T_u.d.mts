import { d as ValidationResults, r as EmailBlockConfig, s as EmailValidationOptions, v as EmailValidationCode } from "./types-BsQSkf80.mjs";

//#region src/utils/email/validateEmail.d.ts

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
//#endregion
export { looksLikeEmail as a, isEmpty as i, checkDomain as n, validateEmail as o, checkTld as r, validationCodeToReason as s, blocklisted as t };
//# sourceMappingURL=validateEmail-ChkO5T_u.d.mts.map