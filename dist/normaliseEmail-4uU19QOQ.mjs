import { a as DEFAULT_FIX_TLDS, i as DEFAULT_FIX_DOMAINS, l as TRANSLITERATION_MAP, o as DEFAULT_FUZZY_DOMAIN_CANDIDATES, r as DEFAULT_BLOCKLIST, s as EmailChangeCodes, t as findClosestDomain } from "./fuzzyDomainMatching-CT2IH0-D.mjs";
import { a as looksLikeEmail, i as isEmpty, t as blocklisted } from "./validateEmail-mE6v21HI.mjs";

//#region src/utils/email/normaliseEmail.ts
/**
* Normalise fullwidth/Unicode variants of @ and .
*
* @param {string} s
* @returns {EmailFixResult}
*/
function toAsciiLike(s) {
	const out = s.replace(/[＠]/g, "@").replace(/[．。]/g, ".");
	return {
		out,
		changed: out !== s
	};
}
/**
* Remove or transliterate non-ASCII characters from email string.
*
* This function attempts basic transliteration for common international
* characters and removes characters that can't be converted to ASCII.
*
* @param {string} s
* @returns {EmailFixResult}
*/
function toAsciiOnly(s) {
	const original = s;
	let out = s;
	for (const [nonAscii, ascii] of Object.entries(TRANSLITERATION_MAP)) out = out.replace(new RegExp(nonAscii, "g"), ascii);
	out = out.replace(/[^ -~]/g, "");
	return {
		out,
		changed: out !== original
	};
}
/**
* Strip display name and comments from email string.
*
* @param {string} s
* @returns {EmailFixResult}
*/
function stripDisplayNameAndComments(s) {
	let out = s;
	const m = out.match(/<\s*([^>]+)\s*>/);
	if (m) out = m[1];
	const t = out.replace(/\s*\([^)]*\)\s*/g, "");
	return {
		out: t,
		changed: t !== s
	};
}
/**
* Deobfuscate common "at" and "dot" substitutions.
*
* @param {string} s
* @returns {EmailFixResult}
*/
function deobfuscate(s) {
	const original = s;
	let out = s;
	out = out.replace(/[([{]\s*at\s*[)\]}]/gi, "@");
	out = out.replace(/\s+at\s+/gi, "@");
	out = out.replace(/[([{]\s*d[0o]t\s*[)\]}]/gi, ".");
	out = out.replace(/\s+d[0o]t\s+/gi, ".");
	out = out.replace(/@{2,}/g, "@");
	return {
		out,
		changed: out !== original
	};
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
function tidyPunctuation(s) {
	const original = s;
	let out = s.trim();
	out = out.replace(/[;,.]+$/g, "");
	out = out.replace(/^[;,.]+/g, "");
	out = out.replace(/\s*@\s*/g, "@").replace(/\s*\.\s*/g, ".");
	out = out.replace(/@\./g, "@");
	const idx = out.indexOf("@");
	if (idx !== -1) out = `${out.slice(0, idx)}@${out.slice(idx + 1).replace(/,/g, ".")}`;
	out = out.replace(/\.{2,}/g, ".");
	return {
		out,
		changed: out !== original
	};
}
/**
* Apply domain and TLD fix maps to email string.
*
* @param {string} email
* @param { domains: Record<string, string>, tlds: Record<string, string> } maps
* @returns {EmailFixResult}
*/
function applyMaps(email, maps) {
	const idx = email.lastIndexOf("@");
	if (idx < 0) return {
		out: email,
		changed: false
	};
	let local = email.slice(0, idx);
	let domain = email.slice(idx + 1);
	const originalDomain = domain;
	domain = domain.toLowerCase();
	if (maps.domains[domain]) domain = maps.domains[domain];
	for (const [bad, good] of Object.entries(maps.tlds)) if (domain.endsWith(bad)) domain = domain.slice(0, domain.length - bad.length) + good;
	const originalLocal = local;
	local = local.replace(/^"(.*)"$/, "$1");
	return {
		out: `${local}@${domain}`,
		changed: domain !== originalDomain.toLowerCase() || local !== originalLocal
	};
}
/**
* Convert email change code to human-readable reason.
*
* @param {EmailChangeCode} code
* @returns {string | null}
*/
function changeCodeToReason(code) {
	switch (code) {
		case EmailChangeCodes.NORMALISED_UNICODE_SYMBOLS: return "Replaced unicode symbols.";
		case EmailChangeCodes.INVALID_EMAIL_SHAPE: return "Invalid email format.";
		case EmailChangeCodes.STRIPPED_DISPLAY_NAME_AND_COMMENTS: return "Removed display name or comments.";
		case EmailChangeCodes.DEOBFUSCATED_AT_AND_DOT: return "Fixed obfuscated \"at\" or \"dot\" substitutions.";
		case EmailChangeCodes.TIDIED_PUNCTUATION_AND_SPACING: return "Tidied punctuation and spacing.";
		case EmailChangeCodes.FIXED_DOMAIN_AND_TLD_TYPOS: return "Corrected common domain or TLD typos.";
		case EmailChangeCodes.FUZZY_DOMAIN_CORRECTION: return "Corrected domain using fuzzy matching.";
		case EmailChangeCodes.LOWERCASED_DOMAIN: return "Lowercased domain part.";
		case EmailChangeCodes.BLOCKED_BY_LIST: return "Email is blocked.";
		case EmailChangeCodes.CONVERTED_TO_ASCII: return "Converted non-ASCII characters to ASCII.";
		default:
			globalThis.console.warn(`Unknown email change code: ${code}`);
			return null;
	}
}
/**
* Map an array of email change codes to human-readable reasons.
*
* @param {EmailChangeCode[]} codes
* @returns {string[]}
*/
function mapChangeCodesToReason(codes) {
	return codes.map(changeCodeToReason).filter((r) => r !== null);
}
/**
* Perform fuzzy domain correction for email normalization.
*
* Analyzes the email address and applies domain corrections
* based on fuzzy string matching with confidence scoring.
*
* @param {string} email - The email address to analyze
* @param {NonNullable<EmailNormOptions['fuzzyMatching']>} config - Fuzzy matching configuration
* @returns {{ correctedEmail: string; wasChanged: boolean }} Result with corrected email and change flag
*
* @example
* ```typescript
* const result = performFuzzyDomainNormalization('user@gmaiil.com', {
*   enabled: true,
*   minConfidence: 0.8
* })
*
* if (result.wasChanged) {
*   console.log(`Corrected: ${result.correctedEmail}`) // "user@gmail.com"
* }
* ```
*/
function performFuzzyDomainNormalization(email, config) {
	if (!config.enabled || !looksLikeEmail(email)) return {
		correctedEmail: email,
		wasChanged: false
	};
	const atIndex = email.lastIndexOf("@");
	if (atIndex === -1) return {
		correctedEmail: email,
		wasChanged: false
	};
	const localPart = email.slice(0, atIndex);
	const domainPart = email.slice(atIndex + 1);
	const allCandidates = config.candidates ? [...DEFAULT_FUZZY_DOMAIN_CANDIDATES, ...config.candidates] : [...DEFAULT_FUZZY_DOMAIN_CANDIDATES];
	const result = findClosestDomain(domainPart, {
		maxDistance: config.maxDistance ?? 5,
		candidates: allCandidates,
		...config.findClosestOptions || {}
	});
	const minConfidence = config.minConfidence ?? .8;
	if (result.candidate && result.candidate !== domainPart.toLowerCase() && result.normalisedScore >= minConfidence && result.distance > 0) {
		const correctedEmail = `${localPart}@${result.candidate}`;
		if (correctedEmail !== email) return {
			correctedEmail,
			wasChanged: true
		};
	}
	return {
		correctedEmail: email,
		wasChanged: false
	};
}
/**
* Normalise and validate an email address.
*
* @param {string} raw
* @param {EmailNormOptions} options
* @returns {EmailNormResult}
*/
function normaliseEmail(raw, options = {}) {
	const changes = [];
	let s = String(raw || "").trim();
	const asciiOnly = options.asciiOnly ?? true;
	if (!(options.enabled ?? true)) return {
		email: s,
		valid: true,
		changes,
		changeCodes: []
	};
	if (isEmpty(s)) return {
		email: s,
		valid: false,
		changes,
		changeCodes: []
	};
	{
		const r = toAsciiLike(s);
		if (r.changed) {
			s = r.out;
			changes.push(EmailChangeCodes.NORMALISED_UNICODE_SYMBOLS);
		}
	}
	{
		const r = stripDisplayNameAndComments(s);
		if (r.changed) {
			s = r.out;
			changes.push(EmailChangeCodes.STRIPPED_DISPLAY_NAME_AND_COMMENTS);
		}
	}
	{
		const r = deobfuscate(s);
		if (r.changed) {
			s = r.out;
			changes.push(EmailChangeCodes.DEOBFUSCATED_AT_AND_DOT);
		}
	}
	{
		const r = tidyPunctuation(s);
		if (r.changed) {
			s = r.out;
			changes.push(EmailChangeCodes.TIDIED_PUNCTUATION_AND_SPACING);
		}
	}
	{
		const r = applyMaps(s, {
			domains: {
				...DEFAULT_FIX_DOMAINS,
				...options.fixDomains || {}
			},
			tlds: {
				...DEFAULT_FIX_TLDS,
				...options.fixTlds || {}
			}
		});
		if (r.changed) {
			s = r.out;
			changes.push(EmailChangeCodes.FIXED_DOMAIN_AND_TLD_TYPOS);
		}
	}
	const fuzzyConfig = options.fuzzyMatching;
	if (fuzzyConfig) {
		const fuzzyResult = performFuzzyDomainNormalization(s, fuzzyConfig);
		if (fuzzyResult.wasChanged) {
			s = fuzzyResult.correctedEmail;
			changes.push(EmailChangeCodes.FUZZY_DOMAIN_CORRECTION);
		}
	}
	if (asciiOnly) {
		const r = toAsciiOnly(s);
		if (r.changed) {
			s = r.out;
			changes.push(EmailChangeCodes.CONVERTED_TO_ASCII);
		}
	}
	const at = s.indexOf("@");
	if (at > -1) {
		const next = `${s.slice(0, at)}@${s.slice(at + 1).toLowerCase()}`;
		if (next !== s) {
			s = next;
			changes.push(EmailChangeCodes.LOWERCASED_DOMAIN);
		}
	}
	const cfg = options.blocklist || DEFAULT_BLOCKLIST;
	if (blocklisted(s, cfg)) return {
		email: s,
		valid: false,
		changeCodes: [...changes, EmailChangeCodes.BLOCKED_BY_LIST],
		changes: mapChangeCodesToReason([...changes, EmailChangeCodes.BLOCKED_BY_LIST])
	};
	if (!looksLikeEmail(s)) {
		changes.push(EmailChangeCodes.INVALID_EMAIL_SHAPE);
		return {
			email: s,
			valid: false,
			changeCodes: [...changes, EmailChangeCodes.INVALID_EMAIL_SHAPE],
			changes: mapChangeCodesToReason([...changes, EmailChangeCodes.INVALID_EMAIL_SHAPE])
		};
	}
	return {
		email: s,
		valid: true,
		changeCodes: changes,
		changes: mapChangeCodesToReason(changes)
	};
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

//#endregion
export { normaliseEmail as n, changeCodeToReason as t };
//# sourceMappingURL=normaliseEmail-4uU19QOQ.mjs.map