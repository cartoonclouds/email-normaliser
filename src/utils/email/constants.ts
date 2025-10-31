import type { EmailBlockConfig } from './normaliseEmail'

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
 * normaliseEmail('user@gamil.com') // Returns email normalized to 'user@gmail.com'
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
export const DEFAULT_FIX_DOMAINS: Record<string, string> = {
  // Gmail variations
  'gamil.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'googlemail.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmali.com': 'gmail.com',
  'gail.com': 'gmail.com',
  'gmeil.com': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmail.cim': 'gmail.com',
  'gmail.vom': 'gmail.com',
  'gmail.c0m': 'gmail.com',
  'gmsil.com': 'gmail.com',

  // Hotmail variations
  'hotnail.com': 'hotmail.com',
  'hotmial.com': 'hotmail.com',
  'hotmali.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmil.com': 'hotmail.com',
  'hotmaill.com': 'hotmail.com',
  'hotmail.co': 'hotmail.com',
  'hotmail.con': 'hotmail.com',
  'hotmeil.com': 'hotmail.com',

  // Outlook variations
  'outlok.com': 'outlook.com',
  'outllok.com': 'outlook.com',
  'outlool.com': 'outlook.com',
  'outloook.com': 'outlook.com',
  'outlook.co': 'outlook.com',
  'outlook.con': 'outlook.com',
  'outlookl.com': 'outlook.com',
  'outook.com': 'outlook.com',
  'otlook.com': 'outlook.com',

  // Yahoo variations
  'yahho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'yahoo.co': 'yahoo.com',
  'yahoo.con': 'yahoo.com',
  'yohoo.com': 'yahoo.com',
  'yhoo.com': 'yahoo.com',
  'yahool.com': 'yahoo.com',
  'yaoo.com': 'yahoo.com',

  // iCloud variations
  'icloud.co': 'icloud.com',
  'icloud.con': 'icloud.com',
  'icould.com': 'icloud.com',
  'iclound.com': 'icloud.com',
  'iclod.com': 'icloud.com',
  'iclud.com': 'icloud.com',
  'icaloud.com': 'icloud.com',

  // UK domain variations
  'outlook.co,uk': 'outlook.co.uk',
  'hotmail.co,uk': 'hotmail.co.uk',
  'btinternet.co,uk': 'btinternet.co.uk',
  'gmail.co,uk': 'gmail.co.uk',
  'yahoo.co,uk': 'yahoo.co.uk',
  'live.co,uk': 'live.co.uk',

  // Other common providers
  'aol.co': 'aol.com',
  'aol.con': 'aol.com',
  'comcast.nte': 'comcast.net',
  'comcas.net': 'comcast.net',
  'verizon.nte': 'verizon.net',
  'verison.net': 'verizon.net',
  'sbcglobal.nte': 'sbcglobal.net',
  'earthlink.nte': 'earthlink.net',
  'cox.nte': 'cox.net',

  // Business/work emails
  'compan.com': 'company.com',
  'compnay.com': 'company.com',
  'corperation.com': 'corporation.com',

  // Additional common typos
  'live.co': 'live.com',
  'live.con': 'live.com',
  'msn.co': 'msn.com',
  'msn.con': 'msn.com',
}

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
 * normaliseEmail('user@example.con') // Returns email normalized to 'user@example.com'
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
export const DEFAULT_FIX_TLDS: Record<string, string> = {
  // Common .com typos
  '.cpm': '.com',
  '.con': '.com',
  '.ocm': '.com',
  '.vom': '.com',
  '.co': '.com',
  '.cm': '.com',
  '.om': '.com',
  '.cmo': '.com',
  '.comm': '.com',
  '.comn': '.com',
  '.c0m': '.com',
  '.cim': '.com',
  '.xom': '.com',
  '.fom': '.com',
  '.dom': '.com',
  '.coom': '.com',

  // Common .net typos
  '.ne': '.net',
  '.nt': '.net',
  '.bet': '.net',
  '.met': '.net',
  '.jet': '.net',
  '.nett': '.net',
  '.netr': '.net',
  '.het': '.net',
  '.nwt': '.net',
  '.nte': '.net',

  // Common .org typos
  '.ogr': '.org',
  '.or': '.org',
  '.og': '.org',
  '.orh': '.org',
  '.orgg': '.org',
  '.orgr': '.org',
  '.0rg': '.org',
  '.prg': '.org',

  // Common .edu typos
  '.ed': '.edu',
  '.eud': '.edu',
  '.deu': '.edu',
  '.eduu': '.edu',
  '.wdu': '.edu',

  // UK domain variations
  '.co,uk': '.co.uk',
  '.couk': '.co.uk',
  '.co.k': '.co.uk',
  '.co.u': '.co.uk',
  '.c.uk': '.co.uk',
  '.co.ik': '.co.uk',
  '.co.ul': '.co.uk',
  '.co.ukk': '.co.uk',
  '.cou.k': '.co.uk',

  // Generic TLD typos
  '.inf': '.info',
  '.inof': '.info',
  '.bi': '.biz',
  '.bizz': '.biz',

  // Mobile/new TLD typos
  '.mob': '.mobi',
  '.mobile': '.mobi',
}

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
export const DEFAULT_BLOCKLIST: EmailBlockConfig = {
  block: {
    exact: [
      'example.com',
      'test.com',
      'mailinator.com',
      '10minutemail.com',
      'guerrillamail.com',
    ],
    suffix: ['.example', '.test'],
    wildcard: ['*.mailinator.com', '*.tempmail.*', '*.discard.email'],
    tlds: ['.test', '.invalid', '.example', '.localhost'],
  },
  allow: { exact: [] },
}
