import { a as DEFAULT_FIX_TLDS, c as EmailValidationCodes, i as DEFAULT_FIX_DOMAINS, l as TRANSLITERATION_MAP, n as levenshtein, o as DEFAULT_FUZZY_DOMAIN_CANDIDATES, r as DEFAULT_BLOCKLIST, s as EmailChangeCodes, t as findClosestDomain } from "./fuzzyDomainMatching-CT2IH0-D.mjs";
import { a as looksLikeEmail, i as isEmpty, n as checkDomain, o as validateEmail, r as checkTld, s as validationCodeToReason, t as blocklisted } from "./validateEmail-mE6v21HI.mjs";
import { n as normaliseEmail, t as changeCodeToReason } from "./normaliseEmail-4uU19QOQ.mjs";
import { t as useEmail } from "./useEmail-L7H58L8R.mjs";
import { t as email_default } from "./email-F8vbBLtR.mjs";

export { DEFAULT_BLOCKLIST, DEFAULT_FIX_DOMAINS, DEFAULT_FIX_TLDS, DEFAULT_FUZZY_DOMAIN_CANDIDATES, EmailChangeCodes, email_default as EmailDirective, EmailValidationCodes, TRANSLITERATION_MAP, blocklisted, changeCodeToReason, checkDomain, checkTld, findClosestDomain, isEmpty, levenshtein, looksLikeEmail, normaliseEmail, useEmail, validateEmail, validationCodeToReason };