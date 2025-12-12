import { a as DEFAULT_FIX_TLDS, c as EmailValidationCodes, i as DEFAULT_FIX_DOMAINS, o as DEFAULT_FUZZY_DOMAIN_CANDIDATES, r as DEFAULT_BLOCKLIST, t as findClosestDomain } from "./fuzzyDomainMatching-CT2IH0-D.mjs";

//#region src/utils/email/validateEmail.ts
/**
* Convert a validation code to a human-readable reason.
*
* @param {EmailValidationCode} code
* @returns {string | null}
*/
function validationCodeToReason(code) {
	switch (code) {
		case EmailValidationCodes.EMPTY: return "Email is empty.";
		case EmailValidationCodes.INVALID_FORMAT: return "Email is not in a valid format.";
		case EmailValidationCodes.BLOCKLISTED: return "Email domain is blocklisted.";
		case EmailValidationCodes.INVALID_DOMAIN: return "Email domain is invalid.";
		case EmailValidationCodes.INVALID_TLD: return "Email top-level domain (TLD) is invalid.";
		case EmailValidationCodes.NON_ASCII_CHARACTERS: return "Email contains non-ASCII characters.";
		case EmailValidationCodes.VALID: return "Email is valid.";
		case EmailValidationCodes.DOMAIN_SUGGESTION: return "Email domain has a suggested correction.";
		default:
			console.debug(`Unknown validation code: ${code}`);
			return null;
	}
}
/**
* Check if a string is empty.
*
* @param {string} raw
* @returns {boolean}
*/
function isEmpty(raw) {
	return String(raw || "").trim().length === 0;
}
/**
* Check if email domain is blocklisted.
*
* @see DEFAULT_BLOCKLIST
* @param {string} email - The full email address
* @param {EmailBlockConfig} cfg
* @returns {boolean}
*/
function blocklisted(email, cfg) {
	const atIndex = email.lastIndexOf("@");
	if (atIndex === -1) return false;
	const d = email.slice(atIndex + 1).toLowerCase();
	if ((cfg.allow?.exact ?? []).map((s) => s.toLowerCase()).includes(d)) return false;
	if ((cfg.block?.exact ?? []).map((s) => s.toLowerCase()).includes(d)) return true;
	for (const t of cfg.block?.tlds ?? []) {
		const tt = t.toLowerCase();
		if (tt && d.endsWith(tt)) return true;
	}
	for (const s of cfg.block?.suffix ?? []) {
		const ss = s.toLowerCase();
		if (ss && d.endsWith(ss)) return true;
	}
	for (const w of cfg.block?.wildcard ?? []) {
		const pat = String(w).toLowerCase();
		if (!pat) continue;
		if (new RegExp("^" + pat.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".") + "$", "i").test(d)) return true;
	}
	if (/@(example|test)\./i.test(`@${d}`)) return true;
	return false;
}
/**
* Quick check if string looks like an email shape.
*
* @param {string} s
* @returns {boolean}
*/
function looksLikeEmail(s) {
	if (s.includes("..")) return false;
	const atIndex = s.indexOf("@");
	if (atIndex === -1 || s.indexOf("@", atIndex + 1) !== -1) return false;
	const local = s.slice(0, atIndex);
	const domain = s.slice(atIndex + 1);
	if (!local || local.startsWith(".") || local.endsWith(".")) return false;
	if (/[ "<>;,()[\]{}]/.test(local)) return false;
	if (!domain) return false;
	if (/[ ;,(){}<>_+[\]]/.test(domain)) return false;
	if (!/\./.test(domain) || /^[.-]|[.-]$/.test(domain)) return false;
	if (!domain.match(/\.([a-zA-Z]{2,})$/)) return false;
	return true;
}
/**
* Check if email domain matches any in the provided domains map.
*
* @param {string} email
* @param {Record<string, string>} domains
* @returns {boolean}
*/
function checkDomain(email, domains) {
	const idx = email.lastIndexOf("@");
	if (idx < 0) return false;
	let domain = email.slice(idx + 1);
	domain = domain.toLowerCase();
	return !!domains[domain];
}
/**
* Check if email TLD matches any in the provided TLDs list.
*
* @param {string} email
* @param {string[]} tlds
* @returns {boolean}
*/
function checkTld(email, tlds) {
	const idx = email.lastIndexOf("@");
	if (idx < 0) return false;
	let domain = email.slice(idx + 1);
	domain = domain.toLowerCase();
	return tlds.some((tld) => {
		if (tld.startsWith(".")) return domain.endsWith(tld);
		return domain.endsWith(`.${tld}`);
	});
}
/**
* Check if a string contains non-ASCII characters.
*
* @param {string} text - The text to check
* @returns True if the text contains non-ASCII characters
*/
function hasNonAsciiCharacters(text) {
	return /[^\x20-\x7E]/.test(text);
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
function performFuzzyDomainValidation(email, config) {
	if (!config.enabled || !looksLikeEmail(email)) return null;
	const atIndex = email.lastIndexOf("@");
	if (atIndex === -1) return null;
	const localPart = email.slice(0, atIndex);
	const domainPart = email.slice(atIndex + 1);
	const allCandidates = config.candidates ? [...DEFAULT_FUZZY_DOMAIN_CANDIDATES, ...config.candidates] : [...DEFAULT_FUZZY_DOMAIN_CANDIDATES];
	const result = findClosestDomain(domainPart, {
		maxDistance: config.maxDistance ?? 5,
		candidates: allCandidates,
		...config.findClosestOptions || {}
	});
	const minConfidence = config.minConfidence ?? .7;
	if (result.candidate && result.candidate !== domainPart.toLowerCase() && result.normalisedScore >= minConfidence && result.distance > 0) {
		const suggestedEmail = `${localPart}@${result.candidate}`;
		return {
			isValid: false,
			validationCode: EmailValidationCodes.DOMAIN_SUGGESTION,
			validationMessage: `Did you mean: ${suggestedEmail}?`,
			suggestion: {
				originalDomain: domainPart,
				suggestedDomain: result.candidate,
				confidence: result.normalisedScore
			}
		};
	}
	return null;
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
function validateEmail(email, options = {}) {
	const validationResults = [];
	const fixDomains = {
		...DEFAULT_FIX_DOMAINS,
		...options.fixDomains || {}
	};
	const fixTlds = {
		...DEFAULT_FIX_TLDS,
		...options.fixTlds || {}
	};
	const blocklist = options.blocklist || DEFAULT_BLOCKLIST;
	const asciiOnly = options.asciiOnly ?? true;
	if (isEmpty(email)) validationResults.push({
		isValid: false,
		validationCode: EmailValidationCodes.EMPTY,
		validationMessage: validationCodeToReason(EmailValidationCodes.EMPTY)
	});
	if (!looksLikeEmail(email)) validationResults.push({
		isValid: false,
		validationCode: EmailValidationCodes.INVALID_FORMAT,
		validationMessage: validationCodeToReason(EmailValidationCodes.INVALID_FORMAT)
	});
	if (checkDomain(email, fixDomains)) validationResults.push({
		isValid: false,
		validationCode: EmailValidationCodes.INVALID_DOMAIN,
		validationMessage: validationCodeToReason(EmailValidationCodes.INVALID_DOMAIN)
	});
	if (checkTld(email, Object.keys(fixTlds))) validationResults.push({
		isValid: false,
		validationCode: EmailValidationCodes.INVALID_TLD,
		validationMessage: validationCodeToReason(EmailValidationCodes.INVALID_TLD)
	});
	if (blocklisted(email, blocklist)) validationResults.push({
		isValid: false,
		validationCode: EmailValidationCodes.BLOCKLISTED,
		validationMessage: validationCodeToReason(EmailValidationCodes.BLOCKLISTED)
	});
	if (asciiOnly && hasNonAsciiCharacters(email)) validationResults.push({
		isValid: false,
		validationCode: EmailValidationCodes.NON_ASCII_CHARACTERS,
		validationMessage: validationCodeToReason(EmailValidationCodes.NON_ASCII_CHARACTERS)
	});
	const fuzzyConfig = options.fuzzyMatching;
	if (fuzzyConfig) {
		const fuzzyResult = performFuzzyDomainValidation(email, fuzzyConfig);
		if (fuzzyResult) validationResults.push(fuzzyResult);
	}
	return validationResults.length ? validationResults : [{
		isValid: true,
		validationCode: EmailValidationCodes.VALID,
		validationMessage: validationCodeToReason(EmailValidationCodes.VALID)
	}];
}

//#endregion
export { looksLikeEmail as a, isEmpty as i, checkDomain as n, validateEmail as o, checkTld as r, validationCodeToReason as s, blocklisted as t };
//# sourceMappingURL=validateEmail-mE6v21HI.mjs.map