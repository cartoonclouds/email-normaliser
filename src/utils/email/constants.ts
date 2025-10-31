import type { EmailBlockConfig } from './normaliseEmail'

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
