'use strict';

var transformers = require('@xenova/transformers');
var vue = require('vue');

// src/utils/email/constants.ts
var DEFAULT_FIX_DOMAINS = {
  // Gmail variations
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
  // Hotmail variations
  "hotnail.com": "hotmail.com",
  "hotmial.com": "hotmail.com",
  "hotmali.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "hotmil.com": "hotmail.com",
  "hotmaill.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "hotmeil.com": "hotmail.com",
  // Outlook variations
  "outlok.com": "outlook.com",
  "outllok.com": "outlook.com",
  "outlool.com": "outlook.com",
  "outloook.com": "outlook.com",
  "outlook.co": "outlook.com",
  "outlook.con": "outlook.com",
  "outlookl.com": "outlook.com",
  "outook.com": "outlook.com",
  "otlook.com": "outlook.com",
  // Yahoo variations
  "yahho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yaho.com": "yahoo.com",
  "yahoo.co": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "yohoo.com": "yahoo.com",
  "yhoo.com": "yahoo.com",
  "yahool.com": "yahoo.com",
  "yaoo.com": "yahoo.com",
  // iCloud variations
  "icloud.co": "icloud.com",
  "icloud.con": "icloud.com",
  "icould.com": "icloud.com",
  "iclound.com": "icloud.com",
  "iclod.com": "icloud.com",
  "iclud.com": "icloud.com",
  "icaloud.com": "icloud.com",
  // UK domain variations
  "outlook.co,uk": "outlook.co.uk",
  "hotmail.co,uk": "hotmail.co.uk",
  "btinternet.co,uk": "btinternet.co.uk",
  "gmail.co,uk": "gmail.co.uk",
  "yahoo.co,uk": "yahoo.co.uk",
  "live.co,uk": "live.co.uk",
  // Other common providers
  "aol.co": "aol.com",
  "aol.con": "aol.com",
  "comcast.nte": "comcast.net",
  "comcas.net": "comcast.net",
  "verizon.nte": "verizon.net",
  "verison.net": "verizon.net",
  "sbcglobal.nte": "sbcglobal.net",
  "earthlink.nte": "earthlink.net",
  "cox.nte": "cox.net",
  // Business/work emails
  "compan.com": "company.com",
  "compnay.com": "company.com",
  "corperation.com": "corporation.com",
  // Additional common typos
  "live.co": "live.com",
  "live.con": "live.com",
  "msn.co": "msn.com",
  "msn.con": "msn.com"
};
var DEFAULT_FIX_TLDS = {
  // Common .com typos
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
  // Common .net typos
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
  // Common .org typos
  ".ogr": ".org",
  ".or": ".org",
  ".og": ".org",
  ".orh": ".org",
  ".orgg": ".org",
  ".orgr": ".org",
  ".0rg": ".org",
  ".prg": ".org",
  // Common .edu typos
  ".ed": ".edu",
  ".eud": ".edu",
  ".deu": ".edu",
  ".eduu": ".edu",
  ".wdu": ".edu",
  // UK domain variations
  ".co,uk": ".co.uk",
  ".couk": ".co.uk",
  ".co.k": ".co.uk",
  ".co.u": ".co.uk",
  ".c.uk": ".co.uk",
  ".co.ik": ".co.uk",
  ".co.ul": ".co.uk",
  ".co.ukk": ".co.uk",
  ".cou.k": ".co.uk",
  // Generic TLD typos
  ".inf": ".info",
  ".inof": ".info",
  ".bi": ".biz",
  ".bizz": ".biz",
  // Mobile/new TLD typos
  ".mob": ".mobi",
  ".mobile": ".mobi"
};
var DEFAULT_BLOCKLIST = {
  block: {
    exact: [
      "example.com",
      "test.com",
      "mailinator.com",
      "10minutemail.com",
      "guerrillamail.com"
    ],
    suffix: [".example", ".test"],
    wildcard: ["*.mailinator.com", "*.tempmail.*", "*.discard.email"],
    tlds: [".test", ".invalid", ".example", ".localhost"]
  },
  allow: { exact: [] }
};
var EmailValidationCodes = Object.freeze({
  /** Email address passed all validation checks */
  VALID: "VALID",
  /** Email input was empty or only whitespace */
  EMPTY: "EMPTY",
  /** Email format does not match valid email structure */
  INVALID_FORMAT: "INVALID_FORMAT",
  /** Email domain is in the configured blocklist */
  BLOCKLISTED: "BLOCKLISTED",
  /** Email domain matches a known typo in the corrections list */
  INVALID_DOMAIN: "INVALID_DOMAIN",
  /** Email TLD matches a known typo in the corrections list */
  INVALID_TLD: "INVALID_TLD",
  /** Email contains non-ASCII characters when ASCII-only mode is enabled */
  NON_ASCII_CHARACTERS: "NON_ASCII_CHARACTERS",
  /** Email domain has a suggested correction based on fuzzy matching */
  DOMAIN_SUGGESTION: "DOMAIN_SUGGESTION"
});
var EmailChangeCodes = Object.freeze({
  /** Email input was empty or only whitespace */
  EMPTY: "empty",
  /** Email was blocked by the configured blocklist */
  BLOCKED_BY_LIST: "blocked_by_list",
  /** Replaced obfuscated "at" and "dot" text with @ and . symbols */
  DEOBFUSCATED_AT_AND_DOT: "deobfuscated_at_and_dot",
  /** Applied domain and TLD typo corrections from the fix mappings */
  FIXED_DOMAIN_AND_TLD_TYPOS: "fixed_domain_and_tld_typos",
  /** Applied fuzzy domain matching to correct likely domain typos */
  FUZZY_DOMAIN_CORRECTION: "fuzzy_domain_correction",
  /** Email format was invalid and could not be normalised */
  INVALID_EMAIL_SHAPE: "invalid_email_shape",
  /** Converted domain part to lowercase */
  LOWERCASED_DOMAIN: "lowercased_domain",
  /** Converted Unicode symbols (＠, ．, 。) to ASCII equivalents */
  NORMALISED_UNICODE_SYMBOLS: "normalised_unicode_symbols",
  /** Removed display names, comments, or angle bracket formatting */
  STRIPPED_DISPLAY_NAME_AND_COMMENTS: "stripped_display_name_and_comments",
  /** Cleaned up spacing, punctuation, and formatting issues */
  TIDIED_PUNCTUATION_AND_SPACING: "tidied_punctuation_and_spacing",
  /** Converted non-ASCII characters to ASCII equivalents or removed them */
  CONVERTED_TO_ASCII: "converted_to_ascii"
});
var DEFAULT_FUZZY_DOMAIN_CANDIDATES = [
  // Global majors
  "gmail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  // Apple
  "icloud.com",
  "me.com",
  "mac.com",
  // Yahoo (global + UK)
  "yahoo.com",
  "yahoo.co.uk",
  // Google legacy alias
  "googlemail.com",
  // Privacy & indie providers
  "proton.me",
  "fastmail.com",
  "zoho.com",
  // Popular UK ISPs (still seen in the wild)
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
var DEFAULT_AI_EMBEDDING_CANDIDATES = [
  // Consumer email providers
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "yahoo.com",
  "yahoo.co.uk",
  "proton.me",
  "fastmail.com",
  "zoho.com",
  // UK ISPs
  "btinternet.co.uk",
  "virginmedia.com",
  "virginmedia.co.uk",
  "blueyonder.co.uk",
  "ntlworld.com",
  "ntlworld.co.uk",
  "talktalk.net",
  "talktalk.co.uk",
  "sky.com",
  "sky.co.uk",
  // Common SaaS/corporate domains
  "salesforce.com",
  "atlassian.com",
  "slack.com",
  "github.com"
];
transformers.env.allowRemoteModels = process.env.NODE_ENV === "test" || process.env.ALLOW_REMOTE_MODELS === "true";
transformers.env.allowLocalModels = true;
transformers.env.cacheDir = "./public/models";
var extractorPromise = null;
var cache = /* @__PURE__ */ new Map();
async function getExtractor(model) {
  if (!extractorPromise) {
    extractorPromise = transformers.pipeline("feature-extraction", model);
  }
  return extractorPromise;
}
function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-12);
}
function levenshtein(a, b) {
  const dp = Array.from(
    { length: a.length + 1 },
    (_) => new Array(b.length + 1).fill(0)
  );
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        // del
        dp[i][j - 1] + 1,
        // ins
        dp[i - 1][j - 1] + cost
        // sub
      );
    }
  }
  return dp[a.length][b.length];
}
async function aiSuggestEmailDomain(domain, options = {}) {
  const d = domain.toLowerCase().trim();
  if (!d || !/[a-z]/i.test(d)) return null;
  const model = options.model ?? "Xenova/all-MiniLM-L6-v2";
  const threshold = options.threshold ?? 0.82;
  const maxEdits = options.maxEdits ?? 2;
  const candidates = (options.candidates && options.candidates.length ? options.candidates : DEFAULT_AI_EMBEDDING_CANDIDATES).map((x) => x.toLowerCase());
  const extractor = await getExtractor(model);
  async function embed(text) {
    if (cache.has(text)) return cache.get(text);
    const output = await extractor(text, {
      pooling: "mean",
      normalize: true
    });
    if (output && typeof output === "object" && "data" in output) {
      const arr = Array.from(output.data);
      const v = new Float32Array(arr);
      cache.set(text, v);
      return v;
    }
    throw new Error(
      `Unexpected output format from feature extraction: expected Tensor object with .data property`
    );
  }
  const q = await embed(d);
  let best = null;
  for (const cand of candidates) {
    const v = await embed(cand);
    const sim = cosine(q, v);
    if (!best || sim > best.sim) best = { cand, sim };
  }
  if (!best || best.sim < threshold) return null;
  if (levenshtein(d, best.cand) > maxEdits) return null;
  return {
    suggestion: best.cand,
    confidence: best.sim,
    reason: "embedding_similarity"
  };
}
function __clearCache() {
  extractorPromise = null;
  cache.clear();
}

// src/utils/email/fuzzyDomainMatching.ts
function levenshtein2(a, b, maxDistance = Infinity) {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const lenDiff = Math.abs(a.length - b.length);
  if (lenDiff > maxDistance) return maxDistance + 1;
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
function findClosestDomain(input, opts = {}) {
  const {
    candidates = DEFAULT_FUZZY_DOMAIN_CANDIDATES,
    maxDistance = Infinity,
    normalise = true
  } = opts;
  const combinedCandidates = [
    ...DEFAULT_FUZZY_DOMAIN_CANDIDATES,
    ...candidates
  ];
  const norm = (s) => normalise ? s.trim().toLowerCase() : s;
  const q = norm(input);
  let bestIdx = -1;
  let bestCandidate = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (let i = 0; i < combinedCandidates.length; i++) {
    const c = norm(String(combinedCandidates[i]));
    const dist = levenshtein2(q, c, maxDistance);
    if (dist < bestDist) {
      bestDist = dist;
      bestCandidate = c;
      bestIdx = i;
      if (bestDist === 0) break;
    }
  }
  if (bestDist > maxDistance) {
    return {
      input,
      candidate: null,
      distance: bestDist,
      normalisedScore: 0,
      index: -1
    };
  }
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

// src/utils/email/validateEmail.ts
function validationCodeToReason(code) {
  switch (code) {
    case EmailValidationCodes.EMPTY:
      return "Email is empty.";
    case EmailValidationCodes.INVALID_FORMAT:
      return "Email is not in a valid format.";
    case EmailValidationCodes.BLOCKLISTED:
      return "Email domain is blocklisted.";
    case EmailValidationCodes.INVALID_DOMAIN:
      return "Email domain is invalid.";
    case EmailValidationCodes.INVALID_TLD:
      return "Email top-level domain (TLD) is invalid.";
    case EmailValidationCodes.NON_ASCII_CHARACTERS:
      return "Email contains non-ASCII characters.";
    case EmailValidationCodes.VALID:
      return "Email is valid.";
    case EmailValidationCodes.DOMAIN_SUGGESTION:
      return "Email domain has a suggested correction.";
    default:
      console.debug(`Unknown validation code: ${code}`);
      return null;
  }
}
function isEmpty(raw) {
  const s = String(raw || "").trim();
  return s.length === 0;
}
function blocklisted(email, cfg) {
  const atIndex = email.lastIndexOf("@");
  if (atIndex === -1) {
    return false;
  }
  const domain = email.slice(atIndex + 1);
  const d = domain.toLowerCase();
  const allowExact = (cfg.allow?.exact ?? []).map((s) => s.toLowerCase());
  if (allowExact.includes(d)) {
    return false;
  }
  const exact = (cfg.block?.exact ?? []).map((s) => s.toLowerCase());
  if (exact.includes(d)) {
    return true;
  }
  for (const t of cfg.block?.tlds ?? []) {
    const tt = t.toLowerCase();
    if (tt && d.endsWith(tt)) {
      return true;
    }
  }
  for (const s of cfg.block?.suffix ?? []) {
    const ss = s.toLowerCase();
    if (ss && d.endsWith(ss)) {
      return true;
    }
  }
  for (const w of cfg.block?.wildcard ?? []) {
    const pat = String(w).toLowerCase();
    if (!pat) {
      continue;
    }
    const re = new RegExp(
      "^" + pat.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".") + "$",
      "i"
    );
    if (re.test(d)) {
      return true;
    }
  }
  if (/@(example|test)\./i.test(`@${d}`)) {
    return true;
  }
  return false;
}
function looksLikeEmail(s) {
  if (s.includes("..")) {
    return false;
  }
  const atIndex = s.indexOf("@");
  if (atIndex === -1 || s.indexOf("@", atIndex + 1) !== -1) {
    return false;
  }
  const local = s.slice(0, atIndex);
  const domain = s.slice(atIndex + 1);
  if (!local || local.startsWith(".") || local.endsWith(".")) {
    return false;
  }
  if (/[ "<>;,()[\]{}]/.test(local)) {
    return false;
  }
  if (!domain) {
    return false;
  }
  if (/[ ;,(){}<>_+[\]]/.test(domain)) {
    return false;
  }
  if (!/\./.test(domain) || /^[.-]|[.-]$/.test(domain)) {
    return false;
  }
  const tldMatch = domain.match(/\.([a-zA-Z]{2,})$/);
  if (!tldMatch) {
    return false;
  }
  return true;
}
function checkDomain(email, domains) {
  const idx = email.lastIndexOf("@");
  if (idx < 0) {
    return false;
  }
  let domain = email.slice(idx + 1);
  domain = domain.toLowerCase();
  return !!domains[domain];
}
function checkTld(email, tlds) {
  const idx = email.lastIndexOf("@");
  if (idx < 0) {
    return false;
  }
  let domain = email.slice(idx + 1);
  domain = domain.toLowerCase();
  return tlds.some((tld) => {
    if (tld.startsWith(".")) {
      return domain.endsWith(tld);
    }
    return domain.endsWith(`.${tld}`);
  });
}
function hasNonAsciiCharacters(text) {
  return /[^\x20-\x7E]/.test(text);
}
function performFuzzyDomainValidation(email, config) {
  if (!config.enabled || !looksLikeEmail(email)) {
    return null;
  }
  const atIndex = email.lastIndexOf("@");
  if (atIndex === -1) {
    return null;
  }
  const localPart = email.slice(0, atIndex);
  const domainPart = email.slice(atIndex + 1);
  const allCandidates = config.candidates ? [...DEFAULT_FUZZY_DOMAIN_CANDIDATES, ...config.candidates] : [...DEFAULT_FUZZY_DOMAIN_CANDIDATES];
  const fuzzyOptions = {
    maxDistance: config.maxDistance ?? 5,
    // Increased default to allow for more distant matches
    candidates: allCandidates,
    ...config.findClosestOptions || {}
  };
  const result = findClosestDomain(domainPart, fuzzyOptions);
  const minConfidence = config.minConfidence ?? 0.7;
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
function validateEmail(email, options = {}) {
  const validationResults = [];
  const fixDomains = { ...DEFAULT_FIX_DOMAINS, ...options.fixDomains || {} };
  const fixTlds = { ...DEFAULT_FIX_TLDS, ...options.fixTlds || {} };
  const blocklist = options.blocklist || DEFAULT_BLOCKLIST;
  const asciiOnly = options.asciiOnly ?? true;
  if (isEmpty(email)) {
    validationResults.push({
      isValid: false,
      validationCode: EmailValidationCodes.EMPTY,
      validationMessage: validationCodeToReason(
        EmailValidationCodes.EMPTY
      )
    });
  }
  if (!looksLikeEmail(email)) {
    validationResults.push({
      isValid: false,
      validationCode: EmailValidationCodes.INVALID_FORMAT,
      validationMessage: validationCodeToReason(
        EmailValidationCodes.INVALID_FORMAT
      )
    });
  }
  if (checkDomain(email, fixDomains)) {
    validationResults.push({
      isValid: false,
      validationCode: EmailValidationCodes.INVALID_DOMAIN,
      validationMessage: validationCodeToReason(
        EmailValidationCodes.INVALID_DOMAIN
      )
    });
  }
  if (checkTld(email, Object.keys(fixTlds))) {
    validationResults.push({
      isValid: false,
      validationCode: EmailValidationCodes.INVALID_TLD,
      validationMessage: validationCodeToReason(
        EmailValidationCodes.INVALID_TLD
      )
    });
  }
  if (blocklisted(email, blocklist)) {
    validationResults.push({
      isValid: false,
      validationCode: EmailValidationCodes.BLOCKLISTED,
      validationMessage: validationCodeToReason(
        EmailValidationCodes.BLOCKLISTED
      )
    });
  }
  if (asciiOnly && hasNonAsciiCharacters(email)) {
    validationResults.push({
      isValid: false,
      validationCode: EmailValidationCodes.NON_ASCII_CHARACTERS,
      validationMessage: validationCodeToReason(
        EmailValidationCodes.NON_ASCII_CHARACTERS
      )
    });
  }
  const fuzzyConfig = options.fuzzyMatching;
  if (fuzzyConfig) {
    const fuzzyResult = performFuzzyDomainValidation(email, fuzzyConfig);
    if (fuzzyResult) {
      validationResults.push(fuzzyResult);
    }
  }
  return validationResults.length ? validationResults : [
    {
      isValid: true,
      validationCode: EmailValidationCodes.VALID,
      validationMessage: validationCodeToReason(
        EmailValidationCodes.VALID
      )
    }
  ];
}

// src/utils/email/normaliseEmail.ts
function toAsciiLike(s) {
  const out = s.replace(/[＠]/g, "@").replace(/[．。]/g, ".");
  return {
    out,
    changed: out !== s
  };
}
function toAsciiOnly(s) {
  const original = s;
  let out = s;
  const transliterationMap = {
    // Latin characters with diacritics
    \u00E0: "a",
    \u00E1: "a",
    \u00E2: "a",
    \u00E3: "a",
    \u00E4: "a",
    \u00E5: "a",
    \u00E6: "ae",
    \u00E7: "c",
    \u00E8: "e",
    \u00E9: "e",
    \u00EA: "e",
    \u00EB: "e",
    \u00EC: "i",
    \u00ED: "i",
    \u00EE: "i",
    \u00EF: "i",
    \u00F1: "n",
    \u00F2: "o",
    \u00F3: "o",
    \u00F4: "o",
    \u00F5: "o",
    \u00F6: "o",
    \u00F8: "o",
    \u00F9: "u",
    \u00FA: "u",
    \u00FB: "u",
    \u00FC: "u",
    \u00FD: "y",
    \u00FF: "y",
    \u00DF: "ss",
    // Uppercase versions
    \u00C0: "A",
    \u00C1: "A",
    \u00C2: "A",
    \u00C3: "A",
    \u00C4: "A",
    \u00C5: "A",
    \u00C6: "AE",
    \u00C7: "C",
    \u00C8: "E",
    \u00C9: "E",
    \u00CA: "E",
    \u00CB: "E",
    \u00CC: "I",
    \u00CD: "I",
    \u00CE: "I",
    \u00CF: "I",
    \u00D1: "N",
    \u00D2: "O",
    \u00D3: "O",
    \u00D4: "O",
    \u00D5: "O",
    \u00D6: "O",
    \u00D8: "O",
    \u00D9: "U",
    \u00DA: "U",
    \u00DB: "U",
    \u00DC: "U",
    \u00DD: "Y"
  };
  for (const [nonAscii, ascii] of Object.entries(transliterationMap)) {
    out = out.replace(new RegExp(nonAscii, "g"), ascii);
  }
  out = out.replace(/[^ -~]/g, "");
  return {
    out,
    changed: out !== original
  };
}
function stripDisplayNameAndComments(s) {
  let out = s;
  const m = out.match(/<\s*([^>]+)\s*>/);
  if (m) {
    out = m[1];
  }
  const t = out.replace(/\s*\([^)]*\)\s*/g, "");
  return {
    out: t,
    changed: t !== s
  };
}
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
function tidyPunctuation(s) {
  const original = s;
  let out = s.trim();
  out = out.replace(/[;,.]+$/g, "");
  out = out.replace(/^[;,.]+/g, "");
  out = out.replace(/\s*@\s*/g, "@").replace(/\s*\.\s*/g, ".");
  out = out.replace(/@\./g, "@");
  const idx = out.indexOf("@");
  if (idx !== -1) {
    const local = out.slice(0, idx);
    const domain = out.slice(idx + 1).replace(/,/g, ".");
    out = `${local}@${domain}`;
  }
  out = out.replace(/\.{2,}/g, ".");
  return {
    out,
    changed: out !== original
  };
}
function applyMaps(email, maps) {
  const idx = email.lastIndexOf("@");
  if (idx < 0) {
    return {
      out: email,
      changed: false
    };
  }
  let local = email.slice(0, idx);
  let domain = email.slice(idx + 1);
  const originalDomain = domain;
  domain = domain.toLowerCase();
  if (maps.domains[domain]) {
    domain = maps.domains[domain];
  }
  for (const [bad, good] of Object.entries(maps.tlds)) {
    if (domain.endsWith(bad)) {
      domain = domain.slice(0, domain.length - bad.length) + good;
    }
  }
  const originalLocal = local;
  local = local.replace(/^"(.*)"$/, "$1");
  const out = `${local}@${domain}`;
  const domainMapsChanged = domain !== originalDomain.toLowerCase();
  const localChanged = local !== originalLocal;
  return {
    out,
    changed: domainMapsChanged || localChanged
  };
}
function changeCodeToReason(code) {
  switch (code) {
    case EmailChangeCodes.NORMALISED_UNICODE_SYMBOLS:
      return "Replaced unicode symbols.";
    case EmailChangeCodes.INVALID_EMAIL_SHAPE:
      return "Invalid email format.";
    case EmailChangeCodes.STRIPPED_DISPLAY_NAME_AND_COMMENTS:
      return "Removed display name or comments.";
    case EmailChangeCodes.DEOBFUSCATED_AT_AND_DOT:
      return 'Fixed obfuscated "at" or "dot" substitutions.';
    case EmailChangeCodes.TIDIED_PUNCTUATION_AND_SPACING:
      return "Tidied punctuation and spacing.";
    case EmailChangeCodes.FIXED_DOMAIN_AND_TLD_TYPOS:
      return "Corrected common domain or TLD typos.";
    case EmailChangeCodes.FUZZY_DOMAIN_CORRECTION:
      return "Corrected domain using fuzzy matching.";
    case EmailChangeCodes.LOWERCASED_DOMAIN:
      return "Lowercased domain part.";
    case EmailChangeCodes.BLOCKED_BY_LIST:
      return "Email is blocked.";
    case EmailChangeCodes.CONVERTED_TO_ASCII:
      return "Converted non-ASCII characters to ASCII.";
    default:
      globalThis.console.warn(`Unknown email change code: ${code}`);
      return null;
  }
}
function mapChangeCodesToReason(codes) {
  return codes.map(changeCodeToReason).filter((r) => r !== null);
}
function performFuzzyDomainNormalization(email, config) {
  if (!config.enabled || !looksLikeEmail(email)) {
    return { correctedEmail: email, wasChanged: false };
  }
  const atIndex = email.lastIndexOf("@");
  if (atIndex === -1) {
    return { correctedEmail: email, wasChanged: false };
  }
  const localPart = email.slice(0, atIndex);
  const domainPart = email.slice(atIndex + 1);
  const allCandidates = config.candidates ? [...DEFAULT_FUZZY_DOMAIN_CANDIDATES, ...config.candidates] : [...DEFAULT_FUZZY_DOMAIN_CANDIDATES];
  const fuzzyOptions = {
    maxDistance: config.maxDistance ?? 5,
    candidates: allCandidates,
    ...config.findClosestOptions || {}
  };
  const result = findClosestDomain(domainPart, fuzzyOptions);
  const minConfidence = config.minConfidence ?? 0.8;
  if (result.candidate && result.candidate !== domainPart.toLowerCase() && result.normalisedScore >= minConfidence && result.distance > 0) {
    const correctedEmail = `${localPart}@${result.candidate}`;
    if (correctedEmail !== email) {
      return { correctedEmail, wasChanged: true };
    }
  }
  return { correctedEmail: email, wasChanged: false };
}
function normaliseEmail(raw, opts = {}) {
  const changes = [];
  let s = String(raw || "").trim();
  const asciiOnly = opts.asciiOnly ?? true;
  if (isEmpty(s)) {
    return {
      email: s,
      valid: false,
      changes,
      changeCodes: []
    };
  }
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
      domains: { ...DEFAULT_FIX_DOMAINS, ...opts.fixDomains || {} },
      tlds: { ...DEFAULT_FIX_TLDS, ...opts.fixTlds || {} }
    });
    if (r.changed) {
      s = r.out;
      changes.push(EmailChangeCodes.FIXED_DOMAIN_AND_TLD_TYPOS);
    }
  }
  const fuzzyConfig = opts.fuzzyMatching;
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
    const local = s.slice(0, at);
    const domain = s.slice(at + 1).toLowerCase();
    const next = `${local}@${domain}`;
    if (next !== s) {
      s = next;
      changes.push(EmailChangeCodes.LOWERCASED_DOMAIN);
    }
  }
  const cfg = opts.blocklist || DEFAULT_BLOCKLIST;
  if (blocklisted(s, cfg)) {
    return {
      email: s,
      valid: false,
      changeCodes: [...changes, EmailChangeCodes.BLOCKED_BY_LIST],
      changes: mapChangeCodesToReason([
        ...changes,
        EmailChangeCodes.BLOCKED_BY_LIST
      ])
    };
  }
  if (!looksLikeEmail(s)) {
    changes.push(EmailChangeCodes.INVALID_EMAIL_SHAPE);
    return {
      email: s,
      valid: false,
      changeCodes: [...changes, EmailChangeCodes.INVALID_EMAIL_SHAPE],
      changes: mapChangeCodesToReason([
        ...changes,
        EmailChangeCodes.INVALID_EMAIL_SHAPE
      ])
    };
  }
  return {
    email: s,
    valid: true,
    changeCodes: changes,
    changes: mapChangeCodesToReason(changes)
  };
}
async function normaliseEmailWithAI(raw, opts = {}) {
  const base = normaliseEmail(raw, opts);
  if (base.valid || !opts.ai?.enabled) {
    return base;
  }
  const at = String(raw).lastIndexOf("@");
  if (at < 0) return base;
  const domainRaw = String(raw).slice(at + 1);
  const aiOpts = {
    model: opts.ai?.model,
    candidates: opts.ai?.candidates,
    threshold: opts.ai?.threshold,
    maxEdits: opts.ai?.maxEdits
  };
  try {
    const hit = await aiSuggestEmailDomain(domainRaw, aiOpts);
    if (!hit) return base;
    const cfg = opts.blocklist;
    const blocked = cfg ? (() => {
      const d = hit.suggestion.toLowerCase();
      const exact = (cfg.block?.exact ?? []).map(
        (s) => s.toLowerCase()
      );
      if (exact.includes(d)) return true;
      for (const t of cfg.block?.tlds ?? [])
        if (d.endsWith(String(t).toLowerCase())) return true;
      for (const s of cfg.block?.suffix ?? [])
        if (d.endsWith(String(s).toLowerCase())) return true;
      for (const w of cfg.block?.wildcard ?? []) {
        const re = new RegExp(
          "^" + String(w).toLowerCase().replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".") + "$",
          "i"
        );
        if (re.test(d)) return true;
      }
      return false;
    })() : false;
    if (blocked) return base;
    return {
      ...base,
      ai: {
        domain: hit.suggestion,
        confidence: hit.confidence,
        reason: hit.reason
      }
    };
  } catch {
    return base;
  }
}
function useEmail(initial = "", opts = {}) {
  opts.autoFormat = opts.autoFormat ?? false;
  const isValid = vue.ref(true);
  const value = vue.ref(initial);
  const result = vue.computed(
    () => normaliseEmail(value.value, opts)
  );
  const email = vue.computed(() => result.value.email);
  const valid = vue.computed(() => isValid.value && result.value.valid);
  const changes = vue.computed(() => result.value.changes);
  function apply() {
    if (email.value && value.value !== email.value) {
      value.value = email.value;
    }
  }
  function validate() {
    isValid.value = normaliseEmail(value.value, opts).changes.length === 0;
    return isValid.value;
  }
  vue.watch(result, (nv) => {
    isValid.value = validate() && nv.valid;
  });
  vue.watch(value, (nv) => {
    if (opts.autoFormat && email.value && nv !== email.value) {
      value.value = email.value;
    }
  });
  return {
    value,
    email,
    valid,
    changes,
    apply,
    validate
  };
}

// src/directives/email.ts
function resolve(binding, el) {
  const value = binding.value || {};
  const opts = {
    autoFormat: !!value.autoFormat,
    previewSelector: value.previewSelector,
    onnormalised: value.onnormalised,
    blocklist: { ...DEFAULT_BLOCKLIST, ...value.blocklist || {} },
    fixDomains: { ...DEFAULT_FIX_DOMAINS, ...value.fixDomains || {} },
    fixTlds: { ...DEFAULT_FIX_TLDS, ...value.fixTlds || {} },
    autoFormatEvents: {
      onInput: value.autoFormatEvents?.onInput ?? true,
      onBlur: value.autoFormatEvents?.onBlur ?? true
    }
  };
  const previewEl = value.previewSelector ? el.closest("form")?.querySelector(value.previewSelector) ?? document.querySelector(value.previewSelector) : null;
  return {
    opts,
    previewEl
  };
}
function setPreview(target, email, valid) {
  if (!target) {
    return;
  }
  target.textContent = email;
  target.setAttribute("data-valid", String(valid));
}
var email_default = {
  mounted(el, binding) {
    const input = el;
    const { opts, previewEl } = resolve(binding, input);
    if (!previewEl && Boolean(binding?.value?.previewSelector)) {
      console.warn("[v-email] Preview element not found for selector:", {
        previewSelector: binding.value?.previewSelector
      });
    }
    const run = (raw) => {
      const r = normaliseEmail(raw, opts);
      if (previewEl) {
        setPreview(previewEl, r.email, r.valid);
      }
      if (r.valid) {
        return r;
      }
      input.dispatchEvent(
        new CustomEvent("directive:email:normalised", { detail: r })
      );
      opts.onnormalised?.(r);
      return r;
    };
    const onEvent = (e) => {
      const raw = e.target.value;
      const r = run(raw);
      if (opts.autoFormat && r.email && raw !== r.email) {
        input.value = r.email;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
    };
    run(input.value || "");
    const formatOnInput = opts.autoFormatEvents?.onInput ?? true;
    if (formatOnInput) {
      input.addEventListener("input", onEvent);
    }
    const formatOnBlur = opts.autoFormatEvents?.onBlur ?? true;
    if (formatOnBlur) {
      input.addEventListener("blur", onEvent);
    }
    if (previewEl instanceof HTMLElement) {
      input.__email__ = {
        onEvent,
        previewEl,
        opts
      };
    }
  },
  /**
   * Runs the normalisation process and updates the email directive's options and preview element.
   *
   * @param {HTMLInputElement} el The element the directive is bound to
   * @param {DirectiveBinding<EmailOpts>} binding The directive binding
   * @returns {void}
   */
  updated(el, binding) {
    const input = el;
    if (!input.__email__) {
      return;
    }
    const { opts, previewEl } = resolve(binding, input);
    input.__email__.opts = opts;
    if (previewEl instanceof HTMLElement) {
      input.__email__.previewEl = previewEl;
    }
    const r = normaliseEmail(input.value || "", opts);
    setPreview(previewEl, r.email, r.valid);
  },
  /**
   * Cleans up event listeners and state when the directive is unbound.
   *
   * @param {HTMLInputElement} el The element the directive is bound to
   * @returns {void}
   */
  beforeUnmount(el) {
    const input = el;
    if (!input.__email__) {
      return;
    }
    input.removeEventListener("input", input.__email__.onEvent);
    input.removeEventListener("blur", input.__email__.onEvent);
    delete input.__email__;
  }
};

exports.DEFAULT_AI_EMBEDDING_CANDIDATES = DEFAULT_AI_EMBEDDING_CANDIDATES;
exports.DEFAULT_BLOCKLIST = DEFAULT_BLOCKLIST;
exports.DEFAULT_FIX_DOMAINS = DEFAULT_FIX_DOMAINS;
exports.DEFAULT_FIX_TLDS = DEFAULT_FIX_TLDS;
exports.DEFAULT_FUZZY_DOMAIN_CANDIDATES = DEFAULT_FUZZY_DOMAIN_CANDIDATES;
exports.EmailChangeCodes = EmailChangeCodes;
exports.EmailDirective = email_default;
exports.EmailValidationCodes = EmailValidationCodes;
exports.__clearCache = __clearCache;
exports.aiSuggestEmailDomain = aiSuggestEmailDomain;
exports.blocklisted = blocklisted;
exports.changeCodeToReason = changeCodeToReason;
exports.checkDomain = checkDomain;
exports.checkTld = checkTld;
exports.findClosestDomain = findClosestDomain;
exports.isEmpty = isEmpty;
exports.levenshtein = levenshtein2;
exports.looksLikeEmail = looksLikeEmail;
exports.normaliseEmail = normaliseEmail;
exports.normaliseEmailWithAI = normaliseEmailWithAI;
exports.useEmail = useEmail;
exports.validateEmail = validateEmail;
exports.validationCodeToReason = validationCodeToReason;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map