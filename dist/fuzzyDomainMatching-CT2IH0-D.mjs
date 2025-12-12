//#region src/utils/email/constants.ts
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
const DEFAULT_FIX_DOMAINS = {
	"gamil.com": "gmail.com",
	"gnail.com": "gmail.com",
	"gmail.co": "gmail.com",
	"googlemail.com": "gmail.com",
	"gmial.com": "gmail.com",
	"gmai.com": "gmail.com",
	"gmaill.com": "gmail.com",
	"gmali.com": "gmail.com",
	"gail.com": "gmail.com",
	"gmeil.com": "gmail.com",
	"gmail.con": "gmail.com",
	"gmail.cim": "gmail.com",
	"gmail.vom": "gmail.com",
	"gmail.c0m": "gmail.com",
	"gmsil.com": "gmail.com",
	"hotnail.com": "hotmail.com",
	"hotmial.com": "hotmail.com",
	"hotmali.com": "hotmail.com",
	"hotmai.com": "hotmail.com",
	"hotmil.com": "hotmail.com",
	"hotmaill.com": "hotmail.com",
	"hotmail.co": "hotmail.com",
	"hotmail.con": "hotmail.com",
	"hotmeil.com": "hotmail.com",
	"outlok.com": "outlook.com",
	"outllok.com": "outlook.com",
	"outlool.com": "outlook.com",
	"outloook.com": "outlook.com",
	"outlook.co": "outlook.com",
	"outlook.con": "outlook.com",
	"outlookl.com": "outlook.com",
	"outook.com": "outlook.com",
	"otlook.com": "outlook.com",
	"yahho.com": "yahoo.com",
	"yahooo.com": "yahoo.com",
	"yaho.com": "yahoo.com",
	"yahoo.co": "yahoo.com",
	"yahoo.con": "yahoo.com",
	"yohoo.com": "yahoo.com",
	"yhoo.com": "yahoo.com",
	"yahool.com": "yahoo.com",
	"yaoo.com": "yahoo.com",
	"icloud.co": "icloud.com",
	"icloud.con": "icloud.com",
	"icould.com": "icloud.com",
	"iclound.com": "icloud.com",
	"iclod.com": "icloud.com",
	"iclud.com": "icloud.com",
	"icaloud.com": "icloud.com",
	"outlook.co,uk": "outlook.co.uk",
	"hotmail.co,uk": "hotmail.co.uk",
	"btinternet.co,uk": "btinternet.co.uk",
	"gmail.co,uk": "gmail.co.uk",
	"yahoo.co,uk": "yahoo.co.uk",
	"live.co,uk": "live.co.uk",
	"aol.co": "aol.com",
	"aol.con": "aol.com",
	"comcast.nte": "comcast.net",
	"comcas.net": "comcast.net",
	"verizon.nte": "verizon.net",
	"verison.net": "verizon.net",
	"sbcglobal.nte": "sbcglobal.net",
	"earthlink.nte": "earthlink.net",
	"cox.nte": "cox.net",
	"compan.com": "company.com",
	"compnay.com": "company.com",
	"corperation.com": "corporation.com",
	"live.co": "live.com",
	"live.con": "live.com",
	"msn.co": "msn.com",
	"msn.con": "msn.com"
};
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
const DEFAULT_FIX_TLDS = {
	".cpm": ".com",
	".con": ".com",
	".ocm": ".com",
	".vom": ".com",
	".co": ".com",
	".cm": ".com",
	".om": ".com",
	".cmo": ".com",
	".comm": ".com",
	".comn": ".com",
	".c0m": ".com",
	".cim": ".com",
	".xom": ".com",
	".fom": ".com",
	".dom": ".com",
	".coom": ".com",
	".ne": ".net",
	".nt": ".net",
	".bet": ".net",
	".met": ".net",
	".jet": ".net",
	".nett": ".net",
	".netr": ".net",
	".het": ".net",
	".nwt": ".net",
	".nte": ".net",
	".ogr": ".org",
	".or": ".org",
	".og": ".org",
	".orh": ".org",
	".orgg": ".org",
	".orgr": ".org",
	".0rg": ".org",
	".prg": ".org",
	".ed": ".edu",
	".eud": ".edu",
	".deu": ".edu",
	".eduu": ".edu",
	".wdu": ".edu",
	".co,uk": ".co.uk",
	".couk": ".co.uk",
	".co.k": ".co.uk",
	".co.u": ".co.uk",
	".c.uk": ".co.uk",
	".co.ik": ".co.uk",
	".co.ul": ".co.uk",
	".co.ukk": ".co.uk",
	".cou.k": ".co.uk",
	".inf": ".info",
	".inof": ".info",
	".bi": ".biz",
	".bizz": ".biz",
	".mob": ".mobi",
	".mobile": ".mobi"
};
/**
* Transliteration map for converting common international characters to ASCII.
*/
const TRANSLITERATION_MAP = {
	à: "a",
	á: "a",
	â: "a",
	ã: "a",
	ä: "a",
	å: "a",
	æ: "ae",
	ç: "c",
	è: "e",
	é: "e",
	ê: "e",
	ë: "e",
	ì: "i",
	í: "i",
	î: "i",
	ï: "i",
	ñ: "n",
	ò: "o",
	ó: "o",
	ô: "o",
	õ: "o",
	ö: "o",
	ø: "o",
	ù: "u",
	ú: "u",
	û: "u",
	ü: "u",
	ý: "y",
	ÿ: "y",
	ß: "ss",
	À: "A",
	Á: "A",
	Â: "A",
	Ã: "A",
	Ä: "A",
	Å: "A",
	Æ: "AE",
	Ç: "C",
	È: "E",
	É: "E",
	Ê: "E",
	Ë: "E",
	Ì: "I",
	Í: "I",
	Î: "I",
	Ï: "I",
	Ñ: "N",
	Ò: "O",
	Ó: "O",
	Ô: "O",
	Õ: "O",
	Ö: "O",
	Ø: "O",
	Ù: "U",
	Ú: "U",
	Û: "U",
	Ü: "U",
	Ý: "Y"
};
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
const DEFAULT_BLOCKLIST = {
	block: {
		exact: [
			"example.com",
			"test.com",
			"mailinator.com",
			"10minutemail.com",
			"guerrillamail.com"
		],
		suffix: [".example", ".test"],
		wildcard: [
			"*.mailinator.com",
			"*.tempmail.*",
			"*.discard.email"
		],
		tlds: [
			".test",
			".invalid",
			".example",
			".localhost"
		]
	},
	allow: { exact: [] }
};
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
const EmailValidationCodes = Object.freeze({
	VALID: "VALID",
	EMPTY: "EMPTY",
	INVALID_FORMAT: "INVALID_FORMAT",
	BLOCKLISTED: "BLOCKLISTED",
	INVALID_DOMAIN: "INVALID_DOMAIN",
	INVALID_TLD: "INVALID_TLD",
	NON_ASCII_CHARACTERS: "NON_ASCII_CHARACTERS",
	DOMAIN_SUGGESTION: "DOMAIN_SUGGESTION"
});
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
const EmailChangeCodes = Object.freeze({
	EMPTY: "empty",
	BLOCKED_BY_LIST: "blocked_by_list",
	DEOBFUSCATED_AT_AND_DOT: "deobfuscated_at_and_dot",
	FIXED_DOMAIN_AND_TLD_TYPOS: "fixed_domain_and_tld_typos",
	FUZZY_DOMAIN_CORRECTION: "fuzzy_domain_correction",
	INVALID_EMAIL_SHAPE: "invalid_email_shape",
	LOWERCASED_DOMAIN: "lowercased_domain",
	NORMALISED_UNICODE_SYMBOLS: "normalised_unicode_symbols",
	STRIPPED_DISPLAY_NAME_AND_COMMENTS: "stripped_display_name_and_comments",
	TIDIED_PUNCTUATION_AND_SPACING: "tidied_punctuation_and_spacing",
	CONVERTED_TO_ASCII: "converted_to_ascii"
});
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
const DEFAULT_FUZZY_DOMAIN_CANDIDATES = [
	"gmail.com",
	"outlook.com",
	"hotmail.com",
	"live.com",
	"msn.com",
	"icloud.com",
	"me.com",
	"mac.com",
	"yahoo.com",
	"yahoo.co.uk",
	"googlemail.com",
	"proton.me",
	"fastmail.com",
	"zoho.com",
	"btinternet.co.uk",
	"talktalk.net",
	"talktalk.co.uk",
	"sky.com",
	"sky.co.uk",
	"virginmedia.com",
	"virginmedia.co.uk",
	"blueyonder.co.uk",
	"ntlworld.com",
	"ntlworld.co.uk"
];

//#endregion
//#region src/utils/email/fuzzyDomainMatching.ts
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
function levenshtein(a, b, maxDistance = Infinity) {
	if (a === b) return 0;
	if (a.length === 0) return b.length;
	if (b.length === 0) return a.length;
	if (Math.abs(a.length - b.length) > maxDistance) return maxDistance + 1;
	if (a.length > b.length) [a, b] = [b, a];
	const aLen = a.length;
	const bLen = b.length;
	let prev = new Array(aLen + 1);
	let curr = new Array(aLen + 1);
	for (let i = 0; i <= aLen; i++) prev[i] = i;
	for (let j = 1; j <= bLen; j++) {
		const bj = b.charCodeAt(j - 1);
		curr[0] = j;
		let rowMin = curr[0];
		for (let i = 1; i <= aLen; i++) {
			const cost = a.charCodeAt(i - 1) === bj ? 0 : 1;
			const del = prev[i] + 1;
			const ins = curr[i - 1] + 1;
			const sub = prev[i - 1] + cost;
			const v = del < ins ? del < sub ? del : sub : ins < sub ? ins : sub;
			curr[i] = v;
			if (v < rowMin) rowMin = v;
		}
		if (rowMin > maxDistance) return maxDistance + 1;
		[prev, curr] = [curr, prev];
	}
	return prev[aLen];
}
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
function findClosestDomain(input, opts = {}) {
	const { candidates = DEFAULT_FUZZY_DOMAIN_CANDIDATES, maxDistance = Infinity, normalise = true } = opts;
	const combinedCandidates = [...DEFAULT_FUZZY_DOMAIN_CANDIDATES, ...candidates];
	const norm = (s) => normalise ? s.trim().toLowerCase() : s;
	const q = norm(input);
	let bestIdx = -1;
	let bestCandidate = null;
	let bestDist = Number.POSITIVE_INFINITY;
	for (let i = 0; i < combinedCandidates.length; i++) {
		const c = norm(String(combinedCandidates[i]));
		const dist = levenshtein(q, c, maxDistance);
		if (dist < bestDist) {
			bestDist = dist;
			bestCandidate = c;
			bestIdx = i;
			if (bestDist === 0) break;
		}
	}
	if (bestDist > maxDistance) return {
		input,
		candidate: null,
		distance: bestDist,
		normalisedScore: 0,
		index: -1
	};
	const denom = Math.max(q.length, bestCandidate ? bestCandidate.length : 1);
	const normalisedScore = denom > 0 ? 1 - bestDist / denom : 1;
	return {
		input,
		candidate: bestCandidate,
		distance: bestDist,
		normalisedScore,
		index: bestIdx
	};
}

//#endregion
export { DEFAULT_FIX_TLDS as a, EmailValidationCodes as c, DEFAULT_FIX_DOMAINS as i, TRANSLITERATION_MAP as l, levenshtein as n, DEFAULT_FUZZY_DOMAIN_CANDIDATES as o, DEFAULT_BLOCKLIST as r, EmailChangeCodes as s, findClosestDomain as t };
//# sourceMappingURL=fuzzyDomainMatching-CT2IH0-D.mjs.map