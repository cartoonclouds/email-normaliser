import { a as EmailNormOptions, g as EmailChangeCode, o as EmailNormResult } from "./types-uAdst7_0.cjs";

//#region src/utils/email/normaliseEmail.d.ts

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
 * @param {EmailNormOptions} options
 * @returns {EmailNormResult}
 */
declare function normaliseEmail(raw: string, options?: EmailNormOptions): EmailNormResult;
//#endregion
export { normaliseEmail as n, changeCodeToReason as t };
//# sourceMappingURL=normaliseEmail-D8mB0tAe.d.cts.map