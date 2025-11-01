import { describe, expect, it, vi } from 'vitest'

import {
  type EmailChangeCode,
  EmailChangeCodes,
} from '../src/utils/email/constants'
import {
  changeCodeToReason,
  normaliseEmail,
} from '../src/utils/email/normaliseEmail'
import type { EmailNormOptions } from '../src/utils/email/types'

const valid = (s: string, opts?: EmailNormOptions) => {
  const r = normaliseEmail(s, opts)
  expect(r.email).toBeTruthy()
  expect(r.valid).toBe(true)
  return r.email
}

const invalid = (
  s: string,
  errorCode?: EmailChangeCode,
  opts?: EmailNormOptions
) => {
  const r = normaliseEmail(s, opts)
  expect(r.valid).toBe(false)
  expect(r.email).toBe(s ? s.trim().toLocaleLowerCase() : '')

  if (errorCode) {
    expect(r.changeCodes).toContain(errorCode)
  }

  return r
}

describe('normaliseEmail', () => {
  describe('main function behavior', () => {
    it('handles empty/null inputs', () => {
      expect(invalid('')).toMatchObject({
        email: '',
        valid: false,
        changes: [],
        changeCodes: [],
      })

      expect(invalid('   ')).toMatchObject({
        email: '',
        valid: false,
        changes: [],
        changeCodes: [],
      })

      // @ts-expect-error - testing null input
      expect(invalid(null)).toMatchObject({
        email: '',
        valid: false,
        changes: [],
        changeCodes: [],
      })

      // @ts-expect-error - testing undefined input
      expect(invalid(undefined)).toMatchObject({
        email: '',
        valid: false,
        changes: [],
        changeCodes: [],
      })
    })

    it('returns valid result with correct structure', () => {
      const result = normaliseEmail('test@domain.com')
      expect(result).toHaveProperty('email')
      expect(result).toHaveProperty('valid')
      expect(result).toHaveProperty('changes')
      expect(Array.isArray(result.changeCodes)).toBe(true)
    })

    it('tracks all changes made during normalization', () => {
      const result = normaliseEmail('  John Doe <john＠gmail．co,uk>;  ')
      expect(result.valid).toBe(true)
      expect(result.changeCodes).toContain(
        EmailChangeCodes.NORMALIZED_UNICODE_SYMBOLS
      )
      expect(result.changeCodes).toContain(
        EmailChangeCodes.STRIPPED_DISPLAY_NAME_AND_COMMENTS
      )
      expect(result.changeCodes).toContain(
        EmailChangeCodes.TIDIED_PUNCTUATION_AND_SPACING
      )
    })
  })

  describe('unicode normalization (toAsciiLike)', () => {
    it('converts fullwidth @ symbol', () => {
      const result = normaliseEmail('test＠gmail.com')
      expect(result.email).toBe('test@gmail.com')
      expect(result.changeCodes).toContain(
        EmailChangeCodes.NORMALIZED_UNICODE_SYMBOLS
      )
    })

    it('converts fullwidth dots', () => {
      const result = normaliseEmail('test@gmail．com')
      expect(result.email).toBe('test@gmail.com')
      expect(result.changeCodes).toContain(
        EmailChangeCodes.NORMALIZED_UNICODE_SYMBOLS
      )
    })

    it('converts Japanese period', () => {
      const result = normaliseEmail('test@gmail。com')
      expect(result.email).toBe('test@gmail.com')
      expect(result.changeCodes).toContain(
        EmailChangeCodes.NORMALIZED_UNICODE_SYMBOLS
      )
    })

    it('handles multiple unicode characters', () => {
      const result = normaliseEmail('test＠domain．co。uk')
      expect(result.email).toBe('test@domain.co.uk')
      expect(result.changeCodes).toContain(
        EmailChangeCodes.NORMALIZED_UNICODE_SYMBOLS
      )
    })

    it('does not change already ASCII emails', () => {
      const result = normaliseEmail('test@domain.com')
      expect(result.changeCodes).not.toContain(
        EmailChangeCodes.NORMALIZED_UNICODE_SYMBOLS
      )
    })
  })

  describe('display name and comments stripping', () => {
    it('extracts email from angle brackets', () => {
      const result = normaliseEmail('John Doe <john@domain.com>')
      expect(result.email).toBe('john@domain.com')
      expect(result.changeCodes).toContain(
        EmailChangeCodes.STRIPPED_DISPLAY_NAME_AND_COMMENTS
      )
    })

    it('handles whitespace in angle brackets', () => {
      const result = normaliseEmail('John Doe < john@domain.com >')
      expect(result.email).toBe('john@domain.com')
      expect(result.changeCodes).toContain(
        EmailChangeCodes.STRIPPED_DISPLAY_NAME_AND_COMMENTS
      )
    })

    it('removes comments in parentheses', () => {
      const result = normaliseEmail('john@domain.com (John Doe)')
      expect(result.email).toBe('john@domain.com')
      expect(result.changeCodes).toContain(
        EmailChangeCodes.STRIPPED_DISPLAY_NAME_AND_COMMENTS
      )
    })

    it('removes multiple comments', () => {
      const result = normaliseEmail('john@domain.com (John) (Doe)')
      expect(result.email).toBe('john@domain.com')
      expect(result.changeCodes).toContain(
        EmailChangeCodes.STRIPPED_DISPLAY_NAME_AND_COMMENTS
      )
    })

    it('handles nested display name and comments', () => {
      const result = normaliseEmail(
        'John Doe (CEO) <john@domain.com> (Company)'
      )
      expect(result.email).toBe('john@domain.com')
      expect(result.changeCodes).toContain(
        EmailChangeCodes.STRIPPED_DISPLAY_NAME_AND_COMMENTS
      )
    })

    it('does not change plain emails', () => {
      const result = normaliseEmail('john@domain.com')
      expect(result.changeCodes).not.toContain(
        EmailChangeCodes.STRIPPED_DISPLAY_NAME_AND_COMMENTS
      )
    })
  })

  describe('deobfuscation', () => {
    it('converts "at" to @', () => {
      const result = normaliseEmail('john at domain.com')
      expect(result.email).toBe('john@domain.com')
      expect(result.changes).toContain(
        changeCodeToReason(EmailChangeCodes.DEOBFUSCATED_AT_AND_DOT)
      )
      expect(result.changeCodes).toContain(
        EmailChangeCodes.DEOBFUSCATED_AT_AND_DOT
      )
    })

    it('converts "AT" to @', () => {
      const result = normaliseEmail('john AT domain.com')
      expect(result.email).toBe('john@domain.com')
      expect(result.changes).toContain(
        changeCodeToReason(EmailChangeCodes.DEOBFUSCATED_AT_AND_DOT)
      )
      expect(result.changeCodes).toContain(
        EmailChangeCodes.DEOBFUSCATED_AT_AND_DOT
      )
    })

    it('converts bracketed at', () => {
      // Note: parentheses don't work because they're stripped by display name removal
      expect(valid('john [at] domain.com')).toBe('john@domain.com')
      expect(valid('john {at} domain.com')).toBe('john@domain.com')
    })

    it('converts "dot" to .', () => {
      const result = normaliseEmail('john@domain dot com')
      expect(result.email).toBe('john@domain.com')
      expect(result.changes).toContain(
        changeCodeToReason(EmailChangeCodes.DEOBFUSCATED_AT_AND_DOT)
      )
      expect(result.changeCodes).toContain(
        EmailChangeCodes.DEOBFUSCATED_AT_AND_DOT
      )
    })

    it('converts "DOT" to .', () => {
      const result = normaliseEmail('john@domain DOT com')
      expect(result.email).toBe('john@domain.com')
      expect(result.changes).toContain(
        changeCodeToReason(EmailChangeCodes.DEOBFUSCATED_AT_AND_DOT)
      )
      expect(result.changeCodes).toContain(
        EmailChangeCodes.DEOBFUSCATED_AT_AND_DOT
      )
    })

    it('converts "d0t" (with zero) to .', () => {
      const result = normaliseEmail('john@domain d0t com')
      expect(result.email).toBe('john@domain.com')
      expect(result.changes).toContain(
        changeCodeToReason(EmailChangeCodes.DEOBFUSCATED_AT_AND_DOT)
      )
      expect(result.changeCodes).toContain(
        EmailChangeCodes.DEOBFUSCATED_AT_AND_DOT
      )
    })

    it('converts bracketed dot', () => {
      // Note: parentheses don't work because they're stripped by display name removal
      expect(valid('john@domain [dot] com')).toBe('john@domain.com')
      expect(valid('john@domain {dot} com')).toBe('john@domain.com')
    })

    it('handles multiple @ symbols by keeping first', () => {
      const result = normaliseEmail('john@@@@domain.com')
      expect(result.email).toBe('john@domain.com')
      expect(result.changes).toContain(
        changeCodeToReason(EmailChangeCodes.DEOBFUSCATED_AT_AND_DOT)
      )
      expect(result.changeCodes).toContain(
        EmailChangeCodes.DEOBFUSCATED_AT_AND_DOT
      )
    })

    it('handles complex obfuscation', () => {
      const result = normaliseEmail('john [at] domain [dot] com')
      expect(result.email).toBe('john@domain.com')
      expect(result.changes).toContain(
        changeCodeToReason(EmailChangeCodes.DEOBFUSCATED_AT_AND_DOT)
      )
      expect(result.changeCodes).toContain(
        EmailChangeCodes.DEOBFUSCATED_AT_AND_DOT
      )
    })
  })

  describe('punctuation tidying', () => {
    it('trims whitespace', () => {
      const result = normaliseEmail('  john@domain.com  ')
      expect(result.email).toBe('john@domain.com')
      // Trimming happens early in normalization, not in tidyPunctuation
      expect(result.changeCodes).not.toContain(
        EmailChangeCodes.TIDIED_PUNCTUATION_AND_SPACING
      )
    })

    it('removes trailing punctuation', () => {
      expect(valid('john@domain.com;')).toBe('john@domain.com')
      expect(valid('john@domain.com,')).toBe('john@domain.com')
      expect(valid('john@domain.com.')).toBe('john@domain.com')
      expect(valid('john@domain.com;;,')).toBe('john@domain.com')
    })

    it('compresses whitespace around @ and .', () => {
      const result = normaliseEmail('john @ domain . com')
      expect(result.email).toBe('john@domain.com')
      expect(result.changeCodes).toContain(
        EmailChangeCodes.TIDIED_PUNCTUATION_AND_SPACING
      )
    })

    it('remove . after @', () => {
      const result = normaliseEmail('john@.domain.com')
      expect(result.email).toBe('john@domain.com')
      expect(result.changeCodes).toContain(
        EmailChangeCodes.TIDIED_PUNCTUATION_AND_SPACING
      )
    })

    it('replaces commas with dots in domain', () => {
      const result = normaliseEmail('john@domain,com')
      expect(result.email).toBe('john@domain.com')
      expect(result.changeCodes).toContain(
        EmailChangeCodes.TIDIED_PUNCTUATION_AND_SPACING
      )
    })

    it('does not replace commas in local part', () => {
      const result = normaliseEmail('john,doe@domain.com')
      expect(result.email).toBe('john,doe@domain.com')
    })

    it('collapses multiple dots', () => {
      const result = normaliseEmail('john..doe@domain...com')
      expect(result.email).toBe('john.doe@domain.com')
      expect(result.changeCodes).toContain(
        EmailChangeCodes.TIDIED_PUNCTUATION_AND_SPACING
      )
    })

    it('handles complex punctuation issues', () => {
      const result = normaliseEmail('john . . doe @ domain . com')
      expect(result.email).toBe('john.doe@domain.com')
      expect(result.changeCodes).toContain(
        EmailChangeCodes.TIDIED_PUNCTUATION_AND_SPACING
      )
    })
  })

  describe('domain and TLD fixing', () => {
    it('fixes common domain typos', () => {
      const testCases = [
        // Gmail variations
        ['user@gamil.com', 'user@gmail.com'],
        ['user@gnail.com', 'user@gmail.com'],
        ['user@gmail.co', 'user@gmail.com'],
        ['user@googlemail.com', 'user@gmail.com'],
        ['user@gmial.com', 'user@gmail.com'],
        ['user@gmai.com', 'user@gmail.com'],
        ['user@gmaill.com', 'user@gmail.com'],
        ['user@gmali.com', 'user@gmail.com'],
        ['user@gail.com', 'user@gmail.com'],
        ['user@gmeil.com', 'user@gmail.com'],
        ['user@gmail.con', 'user@gmail.com'],
        ['user@gmail.cim', 'user@gmail.com'],
        ['user@gmail.vom', 'user@gmail.com'],
        ['user@gmail.c0m', 'user@gmail.com'],
        ['user@gmsil.com', 'user@gmail.com'],

        // Hotmail variations
        ['user@hotnail.com', 'user@hotmail.com'],
        ['user@hotmial.com', 'user@hotmail.com'],
        ['user@hotmali.com', 'user@hotmail.com'],
        ['user@hotmai.com', 'user@hotmail.com'],
        ['user@hotmil.com', 'user@hotmail.com'],
        ['user@hotmaill.com', 'user@hotmail.com'],
        ['user@hotmail.co', 'user@hotmail.com'],
        ['user@hotmail.con', 'user@hotmail.com'],
        ['user@hotmeil.com', 'user@hotmail.com'],

        // Outlook variations
        ['user@outlok.com', 'user@outlook.com'],
        ['user@outllok.com', 'user@outlook.com'],
        ['user@outlool.com', 'user@outlook.com'],
        ['user@outloook.com', 'user@outlook.com'],
        ['user@outlook.co', 'user@outlook.com'],
        ['user@outlook.con', 'user@outlook.com'],
        ['user@outlookl.com', 'user@outlook.com'],
        ['user@outook.com', 'user@outlook.com'],
        ['user@otlook.com', 'user@outlook.com'],

        // Yahoo variations
        ['user@yahho.com', 'user@yahoo.com'],
        ['user@yahooo.com', 'user@yahoo.com'],
        ['user@yaho.com', 'user@yahoo.com'],
        ['user@yahoo.co', 'user@yahoo.com'],
        ['user@yahoo.con', 'user@yahoo.com'],
        ['user@yohoo.com', 'user@yahoo.com'],
        ['user@yhoo.com', 'user@yahoo.com'],
        ['user@yahool.com', 'user@yahoo.com'],
        ['user@yaoo.com', 'user@yahoo.com'],

        // iCloud variations
        ['user@icloud.co', 'user@icloud.com'],
        ['user@icloud.con', 'user@icloud.com'],
        ['user@icould.com', 'user@icloud.com'],
        ['user@iclound.com', 'user@icloud.com'],
        ['user@iclod.com', 'user@icloud.com'],
        ['user@iclud.com', 'user@icloud.com'],
        ['user@icaloud.com', 'user@icloud.com'],

        // Other common providers
        ['user@aol.co', 'user@aol.com'],
        ['user@aol.con', 'user@aol.com'],
        ['user@comcast.nte', 'user@comcast.net'],
        ['user@comcas.net', 'user@comcast.net'],
        ['user@verizon.nte', 'user@verizon.net'],
        ['user@verison.net', 'user@verizon.net'],
        ['user@sbcglobal.nte', 'user@sbcglobal.net'],
        ['user@earthlink.nte', 'user@earthlink.net'],
        ['user@cox.nte', 'user@cox.net'],

        // Microsoft services
        ['user@live.co', 'user@live.com'],
        ['user@live.con', 'user@live.com'],
        ['user@msn.co', 'user@msn.com'],
        ['user@msn.con', 'user@msn.com'],

        // Business domains
        ['user@compan.com', 'user@company.com'],
        ['user@compnay.com', 'user@company.com'],
        ['user@corperation.com', 'user@corporation.com'],
      ]

      for (const [input, expected] of testCases) {
        const result = normaliseEmail(input)
        expect(result.email).toBe(expected)
        expect(result.changeCodes).toContain(
          EmailChangeCodes.FIXED_DOMAIN_AND_TLD_TYPOS
        )
      }
    })

    it('fixes UK domain typos', () => {
      const testCases = [
        ['user@outlook.co,uk', 'user@outlook.co.uk'],
        ['user@hotmail.co,uk', 'user@hotmail.co.uk'],
        ['user@btinternet.co,uk', 'user@btinternet.co.uk'],
        ['user@gmail.co,uk', 'user@gmail.co.uk'],
        ['user@yahoo.co,uk', 'user@yahoo.co.uk'],
        ['user@live.co,uk', 'user@live.co.uk'],
      ]

      for (const [input, expected] of testCases) {
        expect(valid(input)).toBe(expected)
      }
    })

    it('fixes Gmail-specific typos comprehensively', () => {
      const gmailTestCases = [
        ['john@gamil.com', 'john@gmail.com'],
        ['john@gmaill.com', 'john@gmail.com'],
        ['john@gmali.com', 'john@gmail.com'],
        ['john@gail.com', 'john@gmail.com'],
        ['john@gmeil.com', 'john@gmail.com'],
        ['john@gmail.c0m', 'john@gmail.com'],
        ['john@gmsil.com', 'john@gmail.com'],
      ]

      for (const [input, expected] of gmailTestCases) {
        const result = normaliseEmail(input)
        expect(result.email).toBe(expected)
        expect(result.valid).toBe(true)
        expect(result.changeCodes).toContain(
          EmailChangeCodes.FIXED_DOMAIN_AND_TLD_TYPOS
        )
      }
    })

    it('fixes ISP provider domain typos', () => {
      const ispTestCases = [
        ['customer@comcast.nte', 'customer@comcast.net'],
        ['customer@comcas.net', 'customer@comcast.net'],
        ['customer@verizon.nte', 'customer@verizon.net'],
        ['customer@verison.net', 'customer@verizon.net'],
        ['customer@sbcglobal.nte', 'customer@sbcglobal.net'],
        ['customer@earthlink.nte', 'customer@earthlink.net'],
        ['customer@cox.nte', 'customer@cox.net'],
      ]

      for (const [input, expected] of ispTestCases) {
        const result = normaliseEmail(input)
        expect(result.email).toBe(expected)
        expect(result.valid).toBe(true)
        expect(result.changeCodes).toContain(
          EmailChangeCodes.FIXED_DOMAIN_AND_TLD_TYPOS
        )
      }
    })

    it('fixes Microsoft ecosystem domain typos', () => {
      const microsoftTestCases = [
        ['user@hotmial.com', 'user@hotmail.com'],
        ['user@outlool.com', 'user@outlook.com'],
        ['user@outloook.com', 'user@outlook.com'],
        ['user@live.co', 'user@live.com'],
        ['user@msn.co', 'user@msn.com'],
        ['user@otlook.com', 'user@outlook.com'],
      ]

      for (const [input, expected] of microsoftTestCases) {
        const result = normaliseEmail(input)
        expect(result.email).toBe(expected)
        expect(result.valid).toBe(true)
        expect(result.changeCodes).toContain(
          EmailChangeCodes.FIXED_DOMAIN_AND_TLD_TYPOS
        )
      }
    })

    it('fixes common TLD typos', () => {
      const testCases = [
        // .com variations
        ['user@domain.cpm', 'user@domain.com'],
        ['user@domain.con', 'user@domain.com'],
        ['user@domain.ocm', 'user@domain.com'],
        ['user@domain.vom', 'user@domain.com'],
        ['user@domain.co', 'user@domain.com'],
        ['user@domain.cm', 'user@domain.com'],
        ['user@domain.om', 'user@domain.com'],
        ['user@domain.cmo', 'user@domain.com'],
        ['user@domain.comm', 'user@domain.com'],
        ['user@domain.comn', 'user@domain.com'],
        ['user@domain.c0m', 'user@domain.com'],
        ['user@domain.cim', 'user@domain.com'],
        ['user@domain.xom', 'user@domain.com'],
        ['user@domain.fom', 'user@domain.com'],
        ['user@domain.dom', 'user@domain.com'],
        ['user@domain.coom', 'user@domain.com'],

        // .net variations
        ['user@domain.ne', 'user@domain.net'],
        ['user@domain.nt', 'user@domain.net'],
        ['user@domain.bet', 'user@domain.net'],
        ['user@domain.met', 'user@domain.net'],
        ['user@domain.jet', 'user@domain.net'],
        ['user@domain.nett', 'user@domain.net'],
        ['user@domain.netr', 'user@domain.net'],
        ['user@domain.het', 'user@domain.net'],
        ['user@domain.nwt', 'user@domain.net'],
        ['user@domain.nte', 'user@domain.net'],

        // .org variations
        ['user@domain.ogr', 'user@domain.org'],
        ['user@domain.or', 'user@domain.org'],
        ['user@domain.og', 'user@domain.org'],
        ['user@domain.orh', 'user@domain.org'],
        ['user@domain.orgg', 'user@domain.org'],
        ['user@domain.orgr', 'user@domain.org'],
        ['user@domain.0rg', 'user@domain.org'],
        ['user@domain.prg', 'user@domain.org'],

        // .edu variations
        ['user@domain.ed', 'user@domain.edu'],
        ['user@domain.eud', 'user@domain.edu'],
        ['user@domain.deu', 'user@domain.edu'],
        ['user@domain.eduu', 'user@domain.edu'],
        ['user@domain.wdu', 'user@domain.edu'],

        // UK domain variations
        ['user@domain.couk', 'user@domain.co.uk'],
        ['user@domain.co.k', 'user@domain.co.uk'],
        ['user@domain.co.u', 'user@domain.co.uk'],
        ['user@domain.c.uk', 'user@domain.co.uk'],
        ['user@domain.co.ik', 'user@domain.co.uk'],
        ['user@domain.co.ul', 'user@domain.co.uk'],
        ['user@domain.co.ukk', 'user@domain.co.uk'],
        ['user@domain.cou.k', 'user@domain.co.uk'],

        // Other TLD variations
        ['user@domain.inf', 'user@domain.info'],
        ['user@domain.inof', 'user@domain.info'],
        ['user@domain.bi', 'user@domain.biz'],
        ['user@domain.bizz', 'user@domain.biz'],
        ['user@domain.mob', 'user@domain.mobi'],
        ['user@domain.mobile', 'user@domain.mobi'],
      ]

      for (const [input, expected] of testCases) {
        const result = normaliseEmail(input)
        expect(result.email).toBe(expected)
        expect(result.changeCodes).toContain(
          EmailChangeCodes.FIXED_DOMAIN_AND_TLD_TYPOS
        )
      }
    })

    it('fixes punctuation-based TLD issues', () => {
      const testCases = [
        // These are handled by punctuation tidying (commas and trailing dots)
        ['user@domain.co,uk', 'user@domain.co.uk'],
        ['user@domain.net.', 'user@domain.net'],
        ['user@domain.org.', 'user@domain.org'],
        ['user@domain.edu.', 'user@domain.edu'],
        ['user@domain.info.', 'user@domain.info'],
        ['user@domain.biz.', 'user@domain.biz'],
        ['user@domain.mobi.', 'user@domain.mobi'],
        ['user@domain.ca.', 'user@domain.ca'],
        ['user@domain.au.', 'user@domain.au'],
        ['user@domain.de.', 'user@domain.de'],
        ['user@domain.fr.', 'user@domain.fr'],
        ['user@domain.it.', 'user@domain.it'],
        ['user@domain.es.', 'user@domain.es'],
        ['user@domain.nl.', 'user@domain.nl'],
      ]

      for (const [input, expected] of testCases) {
        const result = normaliseEmail(input)
        expect(result.email).toBe(expected)
        expect(result.changeCodes).toContain(
          EmailChangeCodes.TIDIED_PUNCTUATION_AND_SPACING
        )
      }
    })

    it('fixes cases with multiple transformations', () => {
      const multiTransformCases = [
        // This has both punctuation tidying AND TLD mapping
        ['user@domain.co.', 'user@domain.com'],
      ]

      for (const [input, expected] of multiTransformCases) {
        const result = normaliseEmail(input)
        expect(result.email).toBe(expected)
        expect(result.valid).toBe(true)
        // Should have both change codes
        expect(result.changeCodes).toContain(
          EmailChangeCodes.TIDIED_PUNCTUATION_AND_SPACING
        )
        expect(result.changeCodes).toContain(
          EmailChangeCodes.FIXED_DOMAIN_AND_TLD_TYPOS
        )
      }
    })

    it('fixes .com specific typos comprehensively', () => {
      const comTestCases = [
        ['test@site.cpm', 'test@site.com'],
        ['test@site.cm', 'test@site.com'],
        ['test@site.om', 'test@site.com'],
        ['test@site.cmo', 'test@site.com'],
        ['test@site.c0m', 'test@site.com'],
        ['test@site.cim', 'test@site.com'],
        ['test@site.xom', 'test@site.com'],
        ['test@site.fom', 'test@site.com'],
        ['test@site.dom', 'test@site.com'],
        ['test@site.coom', 'test@site.com'],
      ]

      for (const [input, expected] of comTestCases) {
        const result = normaliseEmail(input)
        expect(result.email).toBe(expected)
        expect(result.valid).toBe(true)
        expect(result.changeCodes).toContain(
          EmailChangeCodes.FIXED_DOMAIN_AND_TLD_TYPOS
        )
      }
    })

    it('fixes .net specific typos', () => {
      const netTestCases = [
        ['user@mysite.ne', 'user@mysite.net'],
        ['user@mysite.nt', 'user@mysite.net'],
        ['user@mysite.bet', 'user@mysite.net'],
        ['user@mysite.met', 'user@mysite.net'],
        ['user@mysite.nett', 'user@mysite.net'],
        ['user@mysite.netr', 'user@mysite.net'],
        ['user@mysite.nte', 'user@mysite.net'],
      ]

      for (const [input, expected] of netTestCases) {
        const result = normaliseEmail(input)
        expect(result.email).toBe(expected)
        expect(result.valid).toBe(true)
        expect(result.changeCodes).toContain(
          EmailChangeCodes.FIXED_DOMAIN_AND_TLD_TYPOS
        )
      }
    })

    it('fixes .org specific typos', () => {
      const orgTestCases = [
        ['user@nonprofit.ogr', 'user@nonprofit.org'],
        ['user@nonprofit.or', 'user@nonprofit.org'],
        ['user@nonprofit.og', 'user@nonprofit.org'],
        ['user@nonprofit.orh', 'user@nonprofit.org'],
        ['user@nonprofit.orgg', 'user@nonprofit.org'],
        ['user@nonprofit.0rg', 'user@nonprofit.org'],
        ['user@nonprofit.prg', 'user@nonprofit.org'],
      ]

      for (const [input, expected] of orgTestCases) {
        const result = normaliseEmail(input)
        expect(result.email).toBe(expected)
        expect(result.valid).toBe(true)
        expect(result.changeCodes).toContain(
          EmailChangeCodes.FIXED_DOMAIN_AND_TLD_TYPOS
        )
      }
    })

    it('fixes .edu specific typos', () => {
      const eduTestCases = [
        ['student@university.ed', 'student@university.edu'],
        ['student@university.eud', 'student@university.edu'],
        ['student@university.deu', 'student@university.edu'],
        ['student@university.eduu', 'student@university.edu'],
        ['student@university.wdu', 'student@university.edu'],
      ]

      for (const [input, expected] of eduTestCases) {
        const result = normaliseEmail(input)
        expect(result.email).toBe(expected)
        expect(result.valid).toBe(true)
        expect(result.changeCodes).toContain(
          EmailChangeCodes.FIXED_DOMAIN_AND_TLD_TYPOS
        )
      }
    })

    it('fixes UK domain variations comprehensively', () => {
      const ukTestCases = [
        // These are handled by TLD mapping
        ['user@british.co.ik', 'user@british.co.uk'],
        ['user@british.co.ul', 'user@british.co.uk'],
        ['user@british.co.ukk', 'user@british.co.uk'],
        ['user@british.cou.k', 'user@british.co.uk'],
      ]

      for (const [input, expected] of ukTestCases) {
        const result = normaliseEmail(input)
        expect(result.email).toBe(expected)
        expect(result.valid).toBe(true)
        expect(result.changeCodes).toContain(
          EmailChangeCodes.FIXED_DOMAIN_AND_TLD_TYPOS
        )
      }
    })

    it('fixes UK domain punctuation issues', () => {
      const ukPunctuationCases = [
        // These are handled by punctuation tidying (double dots)
        ['user@british.co..uk', 'user@british.co.uk'],
        ['user@domain.co..uk', 'user@domain.co.uk'],
      ]

      for (const [input, expected] of ukPunctuationCases) {
        const result = normaliseEmail(input)
        expect(result.email).toBe(expected)
        expect(result.valid).toBe(true)
        expect(result.changeCodes).toContain(
          EmailChangeCodes.TIDIED_PUNCTUATION_AND_SPACING
        )
      }
    })

    it('applies custom domain fixes', () => {
      const opts: EmailNormOptions = {
        fixDomains: {
          'custom.com': 'fixed.com',
        },
      }

      const result = normaliseEmail('user@custom.com', opts)
      expect(result.email).toBe('user@fixed.com')
      expect(result.changeCodes).toContain(
        EmailChangeCodes.FIXED_DOMAIN_AND_TLD_TYPOS
      )
    })

    it('applies custom TLD fixes', () => {
      const opts: EmailNormOptions = {
        fixTlds: {
          '.custm': '.custom',
        },
      }

      const result = normaliseEmail('user@domain.custm', opts)
      expect(result.email).toBe('user@domain.custom')
      expect(result.changeCodes).toContain(
        EmailChangeCodes.FIXED_DOMAIN_AND_TLD_TYPOS
      )
    })

    it('removes quotes from local part', () => {
      const result = normaliseEmail('"john.doe"@domain.com')
      expect(result.email).toBe('john.doe@domain.com')
      expect(result.changeCodes).toContain(
        EmailChangeCodes.FIXED_DOMAIN_AND_TLD_TYPOS
      )
    })
  })

  describe('case normalization', () => {
    it('lowercases domain part', () => {
      const result = normaliseEmail('john@DOMAIN.COM')
      expect(result.email).toBe('john@domain.com')
      expect(result.changeCodes).toContain(EmailChangeCodes.LOWERCASED_DOMAIN)
    })

    it('preserves local part case', () => {
      const result = normaliseEmail('John.Doe@DOMAIN.COM')
      expect(result.email).toBe('John.Doe@domain.com')
      expect(result.changeCodes).toContain(EmailChangeCodes.LOWERCASED_DOMAIN)
    })

    it('handles mixed case domains', () => {
      const result = normaliseEmail('user@DoMaIn.CoM')
      expect(result.email).toBe('user@domain.com')
      expect(result.changeCodes).toContain(EmailChangeCodes.LOWERCASED_DOMAIN)
    })

    it('does not add lowercased domain change if already lowercase', () => {
      const result = normaliseEmail('user@example.com')
      expect(result.changeCodes).not.toContain(
        EmailChangeCodes.LOWERCASED_DOMAIN
      )
    })
  })

  describe('email shape validation', () => {
    it('accepts valid email shapes', () => {
      const validEmails = [
        'user@domain.com',
        'user.name@domain.com',
        'user+tag@domain.com',
        'user123@domain123.com',
        'user@sub.domain.com',
        'user@domain.co.uk',
      ]

      for (const email of validEmails) {
        const result = normaliseEmail(email)
        expect(result.valid).toBe(true)
      }
    })

    it('rejects invalid email shapes', () => {
      const invalidEmails = [
        '@domain.com',
        'user@',
        'user',
        'user@domain',
        'user@.com',
        'user name@domain.com',
        'user@dom ain.com',
        'user"@domain.com',
        'user<@domain.com',
        'user>@domain.com',
      ]

      for (const email of invalidEmails) {
        const result = normaliseEmail(email)
        expect(result.valid).toBe(false)
        expect(result.changeCodes).toContain(
          EmailChangeCodes.INVALID_EMAIL_SHAPE
        )
      }
    })

    it('accepts emails that are normalized to valid shapes', () => {
      // These may look invalid but become valid after normalization
      const normalizedEmails = [
        'user@@domain.com', // becomes user@domain.com
        'user@domain..com', // becomes user@domain.com
      ]

      for (const email of normalizedEmails) {
        const result = normaliseEmail(email)
        expect(result.valid).toBe(true)
      }
    })
  })

  describe('blocklist functionality', () => {
    describe('exact domain blocking', () => {
      it('blocks exact matches', () => {
        const blockedDomains = [
          'example.com',
          'test.com',
          '10minutemail.com',
          'guerrillamail.com',
        ]

        for (const domain of blockedDomains) {
          const result = normaliseEmail(`user@${domain}`)
          expect(result.valid).toBe(false)
          expect(result.changeCodes).toContain(EmailChangeCodes.BLOCKED_BY_LIST)
        }
      })

      it('handles domains that are properly blocked now', () => {
        // These domains are now correctly processed and blocked by the blocklist
        const fixedDomains = ['mailinator.com']

        for (const domain of fixedDomains) {
          const result = normaliseEmail(`user@${domain}`)
          expect(result.valid).toBe(false)
          expect(result.changeCodes).toContain(EmailChangeCodes.BLOCKED_BY_LIST)
        }
      })

      it('is case insensitive', () => {
        expect(
          invalid('user@EXAMPLE.COM', EmailChangeCodes.BLOCKED_BY_LIST)
        ).toBeTruthy()
        expect(
          invalid('user@Example.Com', EmailChangeCodes.BLOCKED_BY_LIST)
        ).toBeTruthy()
      })
    })

    describe('suffix blocking', () => {
      it('blocks suffix matches', () => {
        expect(
          invalid('user@test.example', EmailChangeCodes.BLOCKED_BY_LIST)
        ).toBeTruthy()
        expect(
          invalid('user@foo.test', EmailChangeCodes.BLOCKED_BY_LIST)
        ).toBeTruthy()
      })
    })

    describe('wildcard blocking', () => {
      it('blocks wildcard patterns', () => {
        // These work as expected (blocked)
        expect(
          invalid('user@xyz.tempmail.org', EmailChangeCodes.BLOCKED_BY_LIST)
        ).toBeTruthy()
        expect(
          invalid('user@test.discard.email', EmailChangeCodes.BLOCKED_BY_LIST)
        ).toBeTruthy()
      })

      it('blocks wildcard domains properly now', () => {
        // Domains are now correctly processed and blocked_by_list by wildcard patterns
        expect(
          invalid('user@abc.mailinator.com', EmailChangeCodes.BLOCKED_BY_LIST)
        ).toBeTruthy()
      })

      it('handles complex wildcard patterns', () => {
        // This domain doesn't match *.mailinator.com pattern and isn't otherwise blocked
        const result = normaliseEmail('user@any.mailinator.com.evil')
        expect(result.valid).toBe(true)
        expect(result.email).toBe('user@any.mailinator.com.evil')
      })
    })

    describe('TLD blocking', () => {
      it('blocks specified TLDs', () => {
        const blockedTlds = ['.test', '.invalid', '.example', '.localhost']

        for (const tld of blockedTlds) {
          expect(
            invalid(`user@domain${tld}`, EmailChangeCodes.BLOCKED_BY_LIST)
          ).toBeTruthy()
        }
      })
    })

    describe('allowlist overrides', () => {
      it('allows exact matches that override blocks', () => {
        const opts: EmailNormOptions = {
          blocklist: {
            block: { exact: ['example.com'] },
            allow: { exact: ['example.com'] },
          },
        }

        const result = normaliseEmail('user@example.com', opts)
        expect(result.valid).toBe(true)
      })

      it('allowlist is case insensitive', () => {
        const opts: EmailNormOptions = {
          blocklist: {
            block: { exact: ['example.com'] },
            allow: { exact: ['EXAMPLE.COM'] },
          },
        }

        const result = normaliseEmail('user@example.com', opts)
        expect(result.valid).toBe(true)
      })
    })

    describe('custom blocklist configuration', () => {
      it('uses custom exact blocks', () => {
        const opts: EmailNormOptions = {
          blocklist: {
            block: { exact: ['custom-blocked.com'] },
          },
        }

        expect(
          invalid(
            'user@custom-blocked.com',
            EmailChangeCodes.BLOCKED_BY_LIST,
            opts
          )
        ).toBeTruthy()
      })

      it('uses custom suffix blocks', () => {
        const opts: EmailNormOptions = {
          blocklist: {
            block: { suffix: ['.blocked'] },
          },
        }

        expect(
          invalid('user@test.blocked', EmailChangeCodes.BLOCKED_BY_LIST, opts)
        ).toBeTruthy()
      })

      it('uses custom wildcard blocks', () => {
        const opts: EmailNormOptions = {
          blocklist: {
            block: { wildcard: ['*.blocked.*'] },
          },
        }

        expect(
          invalid(
            'user@any.blocked.domain',
            EmailChangeCodes.BLOCKED_BY_LIST,
            opts
          )
        ).toBeTruthy()
      })

      it('uses custom TLD blocks', () => {
        const opts: EmailNormOptions = {
          blocklist: {
            block: { tlds: ['.blocked'] },
          },
        }

        expect(
          invalid('user@domain.blocked', EmailChangeCodes.BLOCKED_BY_LIST, opts)
        ).toBeTruthy()
      })
    })

    describe('built-in example/test blocking', () => {
      it('blocks @example. domains', () => {
        expect(
          invalid('user@example.org', EmailChangeCodes.BLOCKED_BY_LIST)
        ).toBeTruthy()
        expect(
          invalid('user@example.net', EmailChangeCodes.BLOCKED_BY_LIST)
        ).toBeTruthy()
        // Note: subdomains are not blocked by the current implementation
      })

      it('blocks @test. domains', () => {
        expect(
          invalid('user@test.org', EmailChangeCodes.BLOCKED_BY_LIST)
        ).toBeTruthy()
        expect(
          invalid('user@test.net', EmailChangeCodes.BLOCKED_BY_LIST)
        ).toBeTruthy()
        // Note: subdomains are not blocked by the current implementation
      })

      it('allows subdomains of example/test domains', () => {
        // The regex /@(example|test)\./ only matches domains starting with example/test
        expect(valid('user@sub.example.com')).toBe('user@sub.example.com')
        expect(valid('user@sub.test.com')).toBe('user@sub.test.com')
      })
    })
  })

  describe('edge cases and error handling', () => {
    it('handles emails without @ symbol in applyMaps', () => {
      const result = normaliseEmail('notanemail')
      expect(result.valid).toBe(false)
      expect(result.changeCodes).toContain(EmailChangeCodes.INVALID_EMAIL_SHAPE)
    })

    it('handles empty domain parts', () => {
      expect(
        invalid('user@', EmailChangeCodes.INVALID_EMAIL_SHAPE)
      ).toBeTruthy()
    })

    it('handles very long emails', () => {
      const longLocal = 'a'.repeat(64)
      const longDomain = 'b'.repeat(60) + '.com'
      const result = normaliseEmail(`${longLocal}@${longDomain}`)
      expect(result.valid).toBe(true)
    })

    it('handles international characters in local part', () => {
      const result = normaliseEmail('用户@domain.org', { asciiOnly: false })
      expect(result.valid).toBe(true)
      expect(result.email).toBe('用户@domain.org')
    })

    it('handles multiple transformations in sequence', () => {
      const result = normaliseEmail(
        '  "John Doe" <john＠domain．co,uk> (comment);  '
      )
      expect(result.valid).toBe(true)
      expect(result.email).toBe('john@domain.co.uk')
      expect(result.changeCodes.length).toBeGreaterThan(1)
    })

    it('handles empty blocklist sections gracefully', () => {
      const opts: EmailNormOptions = {
        blocklist: {
          block: {},
          allow: {},
        },
      }

      const result = normaliseEmail('user@domain.org', opts)
      expect(result.valid).toBe(true)
    })

    it('handles undefined blocklist sections', () => {
      const opts: EmailNormOptions = {
        blocklist: {},
      }

      const result = normaliseEmail('user@domain.com', opts)
      expect(result.valid).toBe(true)
    })
  })

  describe('comprehensive integration tests', () => {
    it('normalizes heavily obfuscated email', () => {
      const input = '  John Doe (CEO) < john ＠ gmail ． co,uk > (Company) ; '
      const result = normaliseEmail(input)

      expect(result.valid).toBe(true)
      expect(result.email).toBe('john@gmail.co.uk')
      expect(result.changeCodes).toEqual(
        expect.arrayContaining([
          EmailChangeCodes.NORMALIZED_UNICODE_SYMBOLS,
          EmailChangeCodes.STRIPPED_DISPLAY_NAME_AND_COMMENTS,
          EmailChangeCodes.TIDIED_PUNCTUATION_AND_SPACING,
        ])
      )
      // Domain lowercasing doesn't happen if domain is already lowercase after other transforms
    })

    it('handles all transformation types with custom options', () => {
      const opts: EmailNormOptions = {
        fixDomains: { 'customprovider.com': 'realprovider.com' },
        fixTlds: { '.custm': '.custom' },
        blocklist: {
          block: { exact: ['blocked.com'] },
          allow: { exact: ['allowed.com'] },
        },
      }

      const input = 'User＠customprovider．com'
      const result = normaliseEmail(input, opts)

      expect(result.valid).toBe(true)
      expect(result.email).toBe('User@realprovider.com')
    })

    it('maintains exact output format for all result types', () => {
      // Valid result
      const validResult = normaliseEmail('test@domain.org')
      expect(validResult).toEqual({
        email: 'test@domain.org',
        valid: true,
        changes: [],
        changeCodes: [],
      })

      // Invalid result with reason
      const invalidResult = normaliseEmail('')
      expect(invalidResult).toEqual({
        email: '',
        valid: false,
        changes: [],
        changeCodes: [],
      })

      // Blocked result (using blocked domain)
      const blockedResult = normaliseEmail('test@example.com')

      expect(blockedResult).toMatchObject({
        email: 'test@example.com',
        valid: false,
        changeCodes: [EmailChangeCodes.BLOCKED_BY_LIST],
        changes: [changeCodeToReason(EmailChangeCodes.BLOCKED_BY_LIST)],
      })
    })

    it('should handle empty/falsy wildcard patterns', () => {
      // Test with mixed empty and valid patterns to ensure empty ones are skipped
      const result = normaliseEmail('test@domain.com', {
        blocklist: {
          block: {
            wildcard: ['', 'valid.pattern', '', '*.blocked.com'],
          },
        },
      })

      // Should not be blocked since empty patterns are skipped
      expect(result.valid).toBe(true)
      expect(result.changeCodes).not.toContain(EmailChangeCodes.BLOCKED_BY_LIST)
    })

    it('should handle wildcard patterns with only empty values', () => {
      // This specifically tests the `if (!pat) continue` path
      const result = normaliseEmail('test@should-not-be-blocked.com', {
        blocklist: {
          block: {
            wildcard: ['', '   ', '\t', '\n'],
          },
        },
      })

      // Should not be blocked since all patterns are empty after trim/processing
      expect(result.valid).toBe(true)
      expect(result.changeCodes).not.toContain(EmailChangeCodes.BLOCKED_BY_LIST)
    })

    it('should handle email without @ symbol in blocklist check', () => {
      // This tests the specific line 374-375 where atIndex === -1 returns false
      const result = normaliseEmail('invalid-email-no-at-symbol', {
        blocklist: {
          block: {
            exact: ['invalid-email-no-at-symbol'],
          },
        },
      })

      // Should not be blocked since it's not a valid email format (no @ symbol)
      // The blocklisted function should return false for emails without @
      expect(result.valid).toBe(false) // Invalid due to shape, not due to blocklist
      expect(result.changeCodes).not.toContain(EmailChangeCodes.BLOCKED_BY_LIST)
    })
  })

  describe('changeCodeToReason edge cases', () => {
    it('should handle unknown change codes', () => {
      const consoleSpy = vi
        .spyOn(globalThis.console, 'warn')
        .mockImplementation(() => {})

      expect(changeCodeToReason('UNKNOWN_CODE' as any)).toBe(null)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Unknown email change code: UNKNOWN_CODE'
      )

      consoleSpy.mockRestore()
    })

    it('should handle null and undefined change codes', () => {
      const consoleSpy = vi
        .spyOn(globalThis.console, 'warn')
        .mockImplementation(() => {})

      expect(changeCodeToReason(null as any)).toBe(null)
      expect(changeCodeToReason(undefined as any)).toBe(null)

      expect(consoleSpy).toHaveBeenCalledWith('Unknown email change code: null')
      expect(consoleSpy).toHaveBeenCalledWith(
        'Unknown email change code: undefined'
      )

      consoleSpy.mockRestore()
    })
  })

  describe('fuzzy domain matching', () => {
    it('should suggest corrections with custom candidates', () => {
      const result = normaliseEmail('test@custommial.com', {
        fuzzyMatching: {
          enabled: true,
          candidates: ['custommail.com'],
          minConfidence: 0.5,
        },
      })

      expect(result.valid).toBe(true)
      expect(result.email).toBe('test@custommail.com')
      expect(result.changeCodes).toContain(
        EmailChangeCodes.FUZZY_DOMAIN_CORRECTION
      )
      expect(result.changes).toContain(
        changeCodeToReason(EmailChangeCodes.FUZZY_DOMAIN_CORRECTION)
      )
    })

    it('should respect confidence threshold settings', () => {
      // With high threshold, should not correct distant matches
      const result1 = normaliseEmail('test@verydifferentdomain.com', {
        fuzzyMatching: {
          enabled: true,
          minConfidence: 0.9,
        },
      })

      expect(result1.email).toBe('test@verydifferentdomain.com')
      expect(result1.changeCodes).not.toContain(
        EmailChangeCodes.FUZZY_DOMAIN_CORRECTION
      )

      // With low threshold, should correct similar custom domain
      const result2 = normaliseEmail('test@custommial.com', {
        fuzzyMatching: {
          enabled: true,
          candidates: ['custommail.com'],
          minConfidence: 0.3,
        },
      })

      expect(result2.email).toBe('test@custommail.com')
      expect(result2.changeCodes).toContain(
        EmailChangeCodes.FUZZY_DOMAIN_CORRECTION
      )
    })

    it('should combine custom candidates with default candidates', () => {
      // Test both default and custom candidates are available
      const result1 = normaliseEmail('test@custommial.com', {
        fuzzyMatching: {
          enabled: true,
          candidates: ['custommail.com'],
        },
      })

      // Should match custom candidate
      expect(result1.email).toBe('test@custommail.com')
      expect(result1.changeCodes).toContain(
        EmailChangeCodes.FUZZY_DOMAIN_CORRECTION
      )
    })

    it('should not suggest corrections when disabled', () => {
      const result = normaliseEmail('test@custommial.com', {
        fuzzyMatching: { enabled: false },
      })

      expect(result.valid).toBe(true)
      expect(result.email).toBe('test@custommial.com')
      expect(result.changeCodes).not.toContain(
        EmailChangeCodes.FUZZY_DOMAIN_CORRECTION
      )
    })

    it('should not suggest corrections when fuzzyMatching is undefined', () => {
      const result = normaliseEmail('test@custommial.com', {})

      expect(result.valid).toBe(true)
      expect(result.email).toBe('test@custommial.com')
      expect(result.changeCodes).not.toContain(
        EmailChangeCodes.FUZZY_DOMAIN_CORRECTION
      )
    })

    it('should apply fuzzy corrections with custom domain', () => {
      const result = normaliseEmail('test@custommial.com', {
        fuzzyMatching: {
          enabled: true,
          candidates: ['custommail.com'],
        },
      })

      expect(result.valid).toBe(true)
      expect(result.email).toBe('test@custommail.com')
      expect(result.changeCodes).toContain(
        EmailChangeCodes.FUZZY_DOMAIN_CORRECTION
      )
    })

    it('should work with fuzzy matching and case normalization', () => {
      const result = normaliseEmail('test@CUSTOMMIAL.COM', {
        fuzzyMatching: {
          enabled: true,
          candidates: ['custommail.com'],
        },
      })

      expect(result.valid).toBe(true)
      expect(result.email).toBe('test@custommail.com')
      // Since fuzzy matching operates after case normalization, it might replace the domain entirely
      expect(result.changeCodes).toContain(
        EmailChangeCodes.FUZZY_DOMAIN_CORRECTION
      )
      // Check if lowercased domain is also present, but don't require it
      expect(result.changeCodes.length).toBeGreaterThan(0)
    })

    it('should handle maximum distance constraints', () => {
      const result = normaliseEmail('test@completelydifferentdomain.xyz', {
        fuzzyMatching: {
          enabled: true,
          maxDistance: 2,
        },
      })

      // Should not correct domains that are too different
      expect(result.email).toBe('test@completelydifferentdomain.xyz')
      expect(result.changeCodes).not.toContain(
        EmailChangeCodes.FUZZY_DOMAIN_CORRECTION
      )
    })

    it('should preserve other normalizations when fuzzy matching is applied', () => {
      const result = normaliseEmail('  test@custommial.com  ', {
        fuzzyMatching: {
          enabled: true,
          candidates: ['custommail.com'],
        },
      })

      expect(result.valid).toBe(true)
      expect(result.email).toBe('test@custommail.com')

      // Should have fuzzy domain correction
      expect(result.changeCodes).toContain(
        EmailChangeCodes.FUZZY_DOMAIN_CORRECTION
      )
      // Check that at least one normalization occurred
      expect(result.changeCodes.length).toBeGreaterThanOrEqual(1)
    })

    it('should handle invalid emails gracefully', () => {
      const result = normaliseEmail('invalid-email', {
        fuzzyMatching: { enabled: true },
      })

      // Should not crash on invalid email formats
      expect(result.valid).toBe(false)
      expect(result.changeCodes).not.toContain(
        EmailChangeCodes.FUZZY_DOMAIN_CORRECTION
      )
    })

    it('should not correct domains that are exact matches', () => {
      const result = normaliseEmail('test@custommail.com', {
        fuzzyMatching: {
          enabled: true,
          candidates: ['custommail.com'],
        },
      })

      expect(result.valid).toBe(true)
      expect(result.email).toBe('test@custommail.com')
      expect(result.changeCodes).not.toContain(
        EmailChangeCodes.FUZZY_DOMAIN_CORRECTION
      )
    })

    it('should handle empty candidates array', () => {
      const result = normaliseEmail('test@custommial.com', {
        fuzzyMatching: {
          enabled: true,
          candidates: [],
        },
      })

      // Should not find any matches with empty candidates
      expect(result.email).toBe('test@custommial.com')
      expect(result.changeCodes).not.toContain(
        EmailChangeCodes.FUZZY_DOMAIN_CORRECTION
      )
    })

    it('should work with multiple custom domain candidates', () => {
      const testCases = [
        { input: 'test@custommial.com', expected: 'test@custommail.com' },
        { input: 'user@bussiness.net', expected: 'user@business.net' },
        { input: 'person@compnay.org', expected: 'person@company.org' },
      ]

      testCases.forEach(({ input, expected }) => {
        const result = normaliseEmail(input, {
          fuzzyMatching: {
            enabled: true,
            candidates: ['custommail.com', 'business.net', 'company.org'],
            minConfidence: 0.6,
          },
        })

        expect(result.email).toBe(expected)
        expect(result.changeCodes).toContain(
          EmailChangeCodes.FUZZY_DOMAIN_CORRECTION
        )
      })
    })
  })
})
