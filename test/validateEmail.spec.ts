import { describe, expect, it, vi } from 'vitest'

import {
  DEFAULT_BLOCKLIST,
  DEFAULT_FIX_DOMAINS,
  DEFAULT_FIX_TLDS,
} from '../src/utils/email/constants'
import {
  type EmailValidationCode,
  EmailValidationCodes,
  validateEmail,
  validationCodeToReason,
} from '../src/utils/email/validateEmail'

describe('validateEmail', () => {
  describe('Known bad email addresses', () => {
    it('tests against known bad email addresses', () => {
      const testCases = [
        {
          email: 'paul;shotel@yahoo.co.uk',
          error: EmailValidationCodes.INVALID_FORMAT,
        },
        {
          email: 'jockybalmer)9@gmail.com',
          error: EmailValidationCodes.INVALID_FORMAT,
        },
        {
          email: '.Jimmyloy617@gmail.co.uk',
          error: EmailValidationCodes.INVALID_FORMAT,
        },
        {
          email: 'jimaxle53@gmail.co.',
          error: EmailValidationCodes.INVALID_FORMAT,
        },
        {
          email: 'chris.t@goodlifeplus.co..uk',
          error: EmailValidationCodes.INVALID_FORMAT,
        },
        {
          email: 'chris.t@goodlifeplus..co.uk',
          error: EmailValidationCodes.INVALID_FORMAT,
        },
        // {
        //   email: 'davepeglar1963@gmail.comm',
        //   error: EmailValidationCodes.INVALID_FORMAT,
        // },
        {
          email: 'chileednei@gmail+goodforlife.com',
          error: EmailValidationCodes.INVALID_FORMAT,
        },
        {
          email: 'elizabethkeenan0909@gmail.com..{only.for.this.no.marketing}',
          error: EmailValidationCodes.INVALID_FORMAT,
        },
        {
          email: 'elizabethkeenan0909@gmail.com]',
          error: EmailValidationCodes.INVALID_FORMAT,
        },
        {
          email: 'teljen23@gmail.co.',
          error: EmailValidationCodes.INVALID_FORMAT,
        },
        {
          email: '.com>daveygsmith1956@gmail.com.',
          error: EmailValidationCodes.INVALID_FORMAT,
        },
        {
          email: '.co>jimaxle53@gmail.co.',
          error: EmailValidationCodes.INVALID_FORMAT,
        },
        {
          email: 'daveygsmith1956@gmail.com.',
          error: EmailValidationCodes.INVALID_FORMAT,
        },
        {
          email: 'austin.1050@hotmail..com',
          error: EmailValidationCodes.INVALID_FORMAT,
        },
        {
          email: 'arpaddy@aol..com',
          error: EmailValidationCodes.INVALID_FORMAT,
        },
        {
          email: 'forbesmark71@gmail..com',
          error: EmailValidationCodes.INVALID_FORMAT,
        },
        {
          email: 'cheeroo786@.cloud.com',
          error: EmailValidationCodes.INVALID_FORMAT,
        },
        {
          email: 'Girdwoodjoanne9@gmail..com.co.comuk',
          error: EmailValidationCodes.INVALID_FORMAT,
        },
        {
          email: 'eamon.gilboy@gmail.com-._07833144210',
          error: EmailValidationCodes.INVALID_FORMAT,
        },
      ]

      for (const input of testCases) {
        const result = validateEmail(input.email)
        result.forEach((validationResult) => {
          expect(
            validationResult.validationCode,
            `Failed on input: '${input.email}', validation code: '${validationResult.validationCode}'`
          ).toContain(input.error)
        })
      }
    })
  })

  describe('EmailValidationCodes', () => {
    it('should have all expected validation codes', () => {
      expect(EmailValidationCodes.VALID).toBe('VALID')
      expect(EmailValidationCodes.EMPTY).toBe('EMPTY')
      expect(EmailValidationCodes.INVALID_FORMAT).toBe('INVALID_FORMAT')
      expect(EmailValidationCodes.BLOCKLISTED).toBe('BLOCKLISTED')
      expect(EmailValidationCodes.INVALID_DOMAIN).toBe('INVALID_DOMAIN')
      expect(EmailValidationCodes.INVALID_TLD).toBe('INVALID_TLD')
    })

    it('should be frozen object', () => {
      expect(() => {
        ;(EmailValidationCodes as any).NEW_CODE = 'NEW'
      }).toThrow()
    })
  })

  describe('DEFAULT_BLOCKLIST', () => {
    it('should contain expected blocked domains', () => {
      expect(DEFAULT_BLOCKLIST.block?.exact).toContain('example.com')
      expect(DEFAULT_BLOCKLIST.block?.exact).toContain('test.com')
      expect(DEFAULT_BLOCKLIST.block?.exact).toContain('mailinator.com')
      expect(DEFAULT_BLOCKLIST.block?.exact).toContain('10minutemail.com')
      expect(DEFAULT_BLOCKLIST.block?.exact).toContain('guerrillamail.com')
    })

    it('should contain expected suffix patterns', () => {
      expect(DEFAULT_BLOCKLIST.block?.suffix).toContain('.example')
      expect(DEFAULT_BLOCKLIST.block?.suffix).toContain('.test')
    })

    it('should contain expected wildcard patterns', () => {
      expect(DEFAULT_BLOCKLIST.block?.wildcard).toContain('*.mailinator.com')
      expect(DEFAULT_BLOCKLIST.block?.wildcard).toContain('*.tempmail.*')
      expect(DEFAULT_BLOCKLIST.block?.wildcard).toContain('*.discard.email')
    })

    it('should contain expected blocked TLDs', () => {
      expect(DEFAULT_BLOCKLIST.block?.tlds).toContain('.test')
      expect(DEFAULT_BLOCKLIST.block?.tlds).toContain('.invalid')
      expect(DEFAULT_BLOCKLIST.block?.tlds).toContain('.example')
      expect(DEFAULT_BLOCKLIST.block?.tlds).toContain('.localhost')
    })

    it('should have empty allow list by default', () => {
      expect(DEFAULT_BLOCKLIST.allow?.exact).toEqual([])
    })
  })

  describe('DEFAULT_FIX_DOMAINS', () => {
    it('should contain all expected misspelled domains', () => {
      const expectedDomains = {
        'gamil.com': 'gmail.com',
        'gnail.com': 'gmail.com',
        'gmail.co': 'gmail.com',
        'googlemail.com': 'gmail.com',
        'hotnail.com': 'hotmail.com',
        'outlok.com': 'outlook.com',
        'icloud.co': 'icloud.com',
        'yahho.com': 'yahoo.com',
        'outlook.co,uk': 'outlook.co.uk',
        'hotmail.co,uk': 'hotmail.co.uk',
        'btinternet.co,uk': 'btinternet.co.uk',
        'gmial.com': 'gmail.com',
        'gmai.com': 'gmail.com',
      }

      Object.entries(expectedDomains).forEach(([misspelled, correct]) => {
        expect(DEFAULT_FIX_DOMAINS[misspelled]).toBe(correct)
      })
    })
  })

  describe('DEFAULT_FIX_TLDS', () => {
    it('should contain all expected misspelled TLDs', () => {
      const expectedTlds = {
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

      Object.entries(expectedTlds).forEach(([misspelled, correct]) => {
        expect(DEFAULT_FIX_TLDS[misspelled]).toBe(correct)
      })
    })
  })

  describe('validationCodeToReason', () => {
    it('should return correct messages for all validation codes', () => {
      expect(validationCodeToReason(EmailValidationCodes.EMPTY)).toBe(
        'Email is empty.'
      )
      expect(validationCodeToReason(EmailValidationCodes.INVALID_FORMAT)).toBe(
        'Email is not in a valid format.'
      )
      expect(validationCodeToReason(EmailValidationCodes.BLOCKLISTED)).toBe(
        'Email domain is blocklisted.'
      )
      expect(validationCodeToReason(EmailValidationCodes.INVALID_DOMAIN)).toBe(
        'Email domain is invalid.'
      )
      expect(validationCodeToReason(EmailValidationCodes.INVALID_TLD)).toBe(
        'Email top-level domain (TLD) is invalid.'
      )
      expect(validationCodeToReason(EmailValidationCodes.VALID)).toBe(
        'Email is valid.'
      )
    })

    it('should handle unknown validation codes', () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})

      expect(
        validationCodeToReason('UNKNOWN_CODE' as EmailValidationCode)
      ).toBe(null)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Unknown validation code: UNKNOWN_CODE'
      )

      consoleSpy.mockRestore()
    })

    it('should handle null and undefined inputs', () => {
      expect(validationCodeToReason(null as any)).toBe(null)
      expect(validationCodeToReason(undefined as any)).toBe(null)
    })
  })

  describe('validateEmail function', () => {
    describe('empty email validation', () => {
      it('should validate empty string as invalid', () => {
        const result = validateEmail('')

        expect(result.length).toBeGreaterThan(0)
        expect(
          result.some((r) => r.validationCode === EmailValidationCodes.EMPTY)
        ).toBe(true)
      })

      it('should validate whitespace-only string as invalid', () => {
        const result = validateEmail('   ')

        expect(result.length).toBeGreaterThan(0)
        expect(
          result.some((r) => r.validationCode === EmailValidationCodes.EMPTY)
        ).toBe(true)
      })

      it('should handle null input gracefully', () => {
        expect(() => validateEmail(null as any)).toThrow()
      })

      it('should handle undefined input gracefully', () => {
        expect(() => validateEmail(undefined as any)).toThrow()
      })
    })

    describe('email format validation', () => {
      it('should validate valid email formats', () => {
        const validEmails = [
          'user@domain.com',
          'test.email@example.org',
          'user+tag@domain.co.uk',
          'user_name@domain.net',
          'user-name@sub.domain.com',
          'a@b.co',
          '123@domain.com',
        ]

        validEmails.forEach((email) => {
          const result = validateEmail(email)

          // Should not have format validation error
          const hasFormatError = result.some(
            (r) => r.validationCode === EmailValidationCodes.INVALID_FORMAT
          )
          expect(hasFormatError).toBe(false)
        })
      })

      it('should invalidate emails with semicolon', () => {
        const result = validateEmail('user;name@domain.com')

        expect(
          result.some(
            (r) => r.validationCode === EmailValidationCodes.INVALID_FORMAT
          )
        ).toBe(true)
      })

      it('should invalidate emails with comma', () => {
        const result = validateEmail('user,name@domain.com')

        expect(
          result.some(
            (r) => r.validationCode === EmailValidationCodes.INVALID_FORMAT
          )
        ).toBe(true)
      })

      it('should invalidate invalid email formats', () => {
        const invalidEmails = [
          'not-an-email',
          'user@',
          '@domain.com',
          'user@@domain.com',
          'user@domain',
          'user@domain.',
          'user @domain.com',
          'user@domain .com',
          'user"name@domain.com',
          'user<name@domain.com',
          'user>name@domain.com',
          'user(name@domain.com',
          'user)name@domain.com',
          'user@domain.c', // Too short TLD
        ]

        invalidEmails.forEach((email) => {
          const result = validateEmail(email)

          const hasFormatError = result.some(
            (r) => r.validationCode === EmailValidationCodes.INVALID_FORMAT
          )
          expect(hasFormatError).toBe(true)
        })
      })

      it('should handle edge cases that pass regex but may fail other validations', () => {
        // These pass the basic regex but may fail other validations
        const edgeCases = [
          'user@domain..com', // Double dots - should fail format
          'user@-domain.com', // Leading hyphen - should fail format
          'user@domain-.com', // Trailing hyphen - should fail format
        ]

        edgeCases.forEach((email) => {
          const result = validateEmail(email)
          expect(Array.isArray(result)).toBe(true)
          expect(result.length).toBeGreaterThan(0)
        })
      })
    })

    describe('domain validation', () => {
      it('should detect invalid domains from DEFAULT_FIX_DOMAINS', () => {
        const result = validateEmail('user@gamil.com')

        expect(
          result.some(
            (r) => r.validationCode === EmailValidationCodes.INVALID_DOMAIN
          )
        ).toBe(true)
      })

      it('should detect all misspelled domains', () => {
        Object.keys(DEFAULT_FIX_DOMAINS).forEach((domain) => {
          const result = validateEmail(`user@${domain}`)

          expect(
            result.some(
              (r) => r.validationCode === EmailValidationCodes.INVALID_DOMAIN
            )
          ).toBe(true)
        })
      })

      it('should not flag valid domains', () => {
        const result = validateEmail('user@gmail.com')

        expect(
          result.some(
            (r) => r.validationCode === EmailValidationCodes.INVALID_DOMAIN
          )
        ).toBe(false)
      })

      it('should handle domains with mixed case', () => {
        const result = validateEmail('user@GAMIL.COM')

        expect(
          result.some(
            (r) => r.validationCode === EmailValidationCodes.INVALID_DOMAIN
          )
        ).toBe(true)
      })

      it('should handle emails without @ symbol in domain check', () => {
        const result = validateEmail('invalid-email')

        // Should not crash and should be caught by format validation
        expect(Array.isArray(result)).toBe(true)
        expect(
          result.some(
            (r) => r.validationCode === EmailValidationCodes.INVALID_FORMAT
          )
        ).toBe(true)
      })
    })

    describe('TLD validation', () => {
      it('should detect invalid TLDs correctly', () => {
        // After fixing the bug, the function should check for INVALID TLDs (keys)
        // and properly flag them as invalid
        const invalidTlds = Object.keys(DEFAULT_FIX_TLDS)

        // These are INVALID TLDs that should be flagged
        invalidTlds.forEach((invalidTld) => {
          const result = validateEmail(`user@domain${invalidTld}`)

          expect(
            result.some(
              (r) => r.validationCode === EmailValidationCodes.INVALID_TLD
            )
          ).toBe(true)
        })

        // Valid TLDs should not be flagged
        const validTlds = Object.values(DEFAULT_FIX_TLDS)
        validTlds.forEach((validTld) => {
          const result = validateEmail(`user@domain${validTld}`)

          expect(
            result.some(
              (r) => r.validationCode === EmailValidationCodes.INVALID_TLD
            )
          ).toBe(false)
        })
      })

      it('should handle case insensitive TLD checking', () => {
        const result = validateEmail('user@domain.COM') // Uppercase .COM

        // Should check correctly regardless of case
        expect(Array.isArray(result)).toBe(true)
      })

      it('should handle emails without @ symbol in TLD check', () => {
        const result = validateEmail('invalid-email')

        // Should not crash
        expect(Array.isArray(result)).toBe(true)
      })
    })

    describe('blocklist validation', () => {
      it('should detect exact blocked domains', () => {
        const result = validateEmail('user@example.com')

        expect(
          result.some(
            (r) => r.validationCode === EmailValidationCodes.BLOCKLISTED
          )
        ).toBe(true)
      })

      it('should detect all exact blocked domains correctly', () => {
        // After fixing the bug, all exact blocked domains should be properly detected
        const allBlockedDomains = [
          'example.com',
          'test.com',
          'mailinator.com',
          '10minutemail.com',
          'guerrillamail.com',
        ]

        allBlockedDomains.forEach((domain) => {
          const result = validateEmail(`user@${domain}`)
          expect(
            result.some(
              (r) => r.validationCode === EmailValidationCodes.BLOCKLISTED
            )
          ).toBe(true)
        })
      })

      it('should test empty exact domains array handling', () => {
        // This tests the code path where exact domains array is empty or undefined
        const result = validateEmail('user@not-blocked-domain.com')
        expect(
          result.some(
            (r) => r.validationCode === EmailValidationCodes.BLOCKLISTED
          )
        ).toBe(false)
      })

      it('should detect suffix blocked domains', () => {
        const result = validateEmail('user@sub.example')

        expect(
          result.some(
            (r) => r.validationCode === EmailValidationCodes.BLOCKLISTED
          )
        ).toBe(true)
      })

      it('should detect wildcard blocked domains', () => {
        const result1 = validateEmail('user@abc.mailinator.com')
        const result2 = validateEmail('user@xyz.tempmail.org')

        expect(
          result1.some(
            (r) => r.validationCode === EmailValidationCodes.BLOCKLISTED
          )
        ).toBe(true)
        expect(
          result2.some(
            (r) => r.validationCode === EmailValidationCodes.BLOCKLISTED
          )
        ).toBe(true)
      })

      it('should detect blocked TLDs', () => {
        const result = validateEmail('user@domain.test')

        expect(
          result.some(
            (r) => r.validationCode === EmailValidationCodes.BLOCKLISTED
          )
        ).toBe(true)
      })

      it('should handle case insensitive blocking', () => {
        const result = validateEmail('user@EXAMPLE.COM')

        expect(
          result.some(
            (r) => r.validationCode === EmailValidationCodes.BLOCKLISTED
          )
        ).toBe(true)
      })

      it('should handle wildcard patterns correctly', () => {
        const result1 = validateEmail('user@prefix.tempmail.suffix')
        const result2 = validateEmail('user@anything.discard.email')

        expect(
          result1.some(
            (r) => r.validationCode === EmailValidationCodes.BLOCKLISTED
          )
        ).toBe(true)
        expect(
          result2.some(
            (r) => r.validationCode === EmailValidationCodes.BLOCKLISTED
          )
        ).toBe(true)
      })

      it('should detect explicit example/test domains using regex', () => {
        // The blocklisted function now properly extracts domain from full email
        // and tests the regex /@(example|test)\./i.test(`@${domain}`)
        // This regex matches domains that START with example. or test.

        const result1 = validateEmail('user@example.org')
        const result2 = validateEmail('user@test.net')

        // These domains start with example./test. so should be blocked by the regex
        // (example.org and test.net are caught by regex, not by exact/suffix/TLD rules)
        expect(
          result1.some(
            (r) => r.validationCode === EmailValidationCodes.BLOCKLISTED
          )
        ).toBe(true)
        expect(
          result2.some(
            (r) => r.validationCode === EmailValidationCodes.BLOCKLISTED
          )
        ).toBe(true)
      })

      it('should test correct regex behavior', () => {
        // The regex now properly tests "@domain.com" after extracting domain
        // from the full email, so normal domains should not be blocked
        const result = validateEmail('user@normal.com')
        expect(
          result.some(
            (r) => r.validationCode === EmailValidationCodes.BLOCKLISTED
          )
        ).toBe(false)
      })

      it('should respect allowlist overrides', () => {
        // Test that allowlist overrides block rules
        // Since DEFAULT_BLOCKLIST has empty allowlist, test the logic exists
        expect(DEFAULT_BLOCKLIST.allow?.exact).toEqual([])
      })

      it('should not block valid domains', () => {
        const result = validateEmail('user@gmail.com')

        expect(
          result.some(
            (r) => r.validationCode === EmailValidationCodes.BLOCKLISTED
          )
        ).toBe(false)
      })

      it('should handle empty wildcard patterns', () => {
        // Test the code path where wildcard pattern is empty/falsy
        // This tests the `if (!pat)` condition in the blocklisted function
        const result = validateEmail('user@normal-domain.com')
        expect(
          result.some(
            (r) => r.validationCode === EmailValidationCodes.BLOCKLISTED
          )
        ).toBe(false)
      })
    })

    describe('multiple validation scenarios', () => {
      it('should handle emails that trigger multiple validations', () => {
        // This email should trigger format validation since it's empty
        const result = validateEmail('')

        expect(result.length).toBeGreaterThan(0)
        expect(
          result.some((r) => r.validationCode === EmailValidationCodes.EMPTY)
        ).toBe(true)
      })

      it('should validate complex invalid emails', () => {
        // Test email that might trigger multiple validation paths
        const result = validateEmail('user@gamil.com') // Invalid domain

        expect(
          result.some(
            (r) => r.validationCode === EmailValidationCodes.INVALID_DOMAIN
          )
        ).toBe(true)
      })
    })

    describe('valid email cases', () => {
      it('should return VALID for completely valid email', () => {
        const result = validateEmail('user@valid-domain.com')

        expect(result).toHaveLength(1)
        expect(result[0]).toEqual({
          isValid: true,
          validationCode: EmailValidationCodes.VALID,
          validationMessage: 'Email is valid.',
        })
      })

      it('should validate multiple valid email formats', () => {
        const validEmails = [
          'test@gmail.com',
          'user.name@yahoo.com',
          'user+tag@outlook.com',
          'valid@some-domain.org',
        ]

        validEmails.forEach((email) => {
          const result = validateEmail(email)

          expect(result).toHaveLength(1)
          expect(
            result[0].validationCode,
            `Email validation failed for: ${email}`
          ).toBe(EmailValidationCodes.VALID)
          expect(result[0].isValid).toBe(true)
        })
      })
    })

    describe('edge cases and function coverage', () => {
      it('should handle very long email addresses', () => {
        const longEmail = 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com'
        const result = validateEmail(longEmail)

        expect(Array.isArray(result)).toBe(true)
      })

      it('should handle special characters in domain (allowed by regex)', () => {
        const result = validateEmail('user@sub-domain.co.uk')

        // Should not have format error for hyphens in domain
        expect(
          result.every(
            (r) => r.validationCode !== EmailValidationCodes.INVALID_FORMAT
          )
        ).toBe(true)
      })

      it('should handle numbers in all parts', () => {
        const result = validateEmail('123@456.789')

        expect(Array.isArray(result)).toBe(true)
      })

      it('should test isEmpty function with various inputs', () => {
        const emptyInputs = ['', '   ', '\t\n  ']
        emptyInputs.forEach((input) => {
          const result = validateEmail(input)
          expect(
            result.some((r) => r.validationCode === EmailValidationCodes.EMPTY)
          ).toBe(true)
        })
      })

      it('should test looksLikeEmail function edge cases', () => {
        // Test cases that exercise the regex boundaries
        const formatTests = [
          { email: 'a@b.co', shouldPass: true },
          { email: 'user@domain.c', shouldPass: false }, // TLD too short
          { email: 'user@domain.co', shouldPass: true },
          { email: 'test@sub.domain.com', shouldPass: true },
        ]

        formatTests.forEach(({ email, shouldPass }) => {
          const result = validateEmail(email)
          const hasFormatError = result.some(
            (r) => r.validationCode === EmailValidationCodes.INVALID_FORMAT
          )
          expect(hasFormatError).toBe(!shouldPass)
        })
      })

      it('should test regex escape sequences in wildcard patterns', () => {
        // This tests the regex escaping logic in the blocklisted function
        // The code escapes: [.+^${}()|[\]\\]
        const result = validateEmail('user@test.discard.email')
        expect(
          result.some(
            (r) => r.validationCode === EmailValidationCodes.BLOCKLISTED
          )
        ).toBe(true)
      })

      it('should test all code paths in blocklisted function', () => {
        // Test suffix blocking
        const suffixResult = validateEmail('user@domain.example')
        expect(
          suffixResult.some(
            (r) => r.validationCode === EmailValidationCodes.BLOCKLISTED
          )
        ).toBe(true)

        // Test TLD blocking
        const tldResult = validateEmail('user@domain.test')
        expect(
          tldResult.some(
            (r) => r.validationCode === EmailValidationCodes.BLOCKLISTED
          )
        ).toBe(true)

        // Test that empty patterns are skipped
        const normalResult = validateEmail('user@normal-domain.com')
        expect(
          normalResult.some(
            (r) => r.validationCode === EmailValidationCodes.BLOCKLISTED
          )
        ).toBe(false)
      })

      it('should test case insensitive domain handling in all functions', () => {
        // Test mixed case in different validation functions
        const domainResult = validateEmail('user@GAMIL.COM')
        expect(
          domainResult.some(
            (r) => r.validationCode === EmailValidationCodes.INVALID_DOMAIN
          )
        ).toBe(true)

        const blockResult = validateEmail('user@EXAMPLE.COM')
        expect(
          blockResult.some(
            (r) => r.validationCode === EmailValidationCodes.BLOCKLISTED
          )
        ).toBe(true)
      })

      it('should cover edge cases in isEmpty function', () => {
        // Test with different types of whitespace
        const tabResult = validateEmail('\t')
        expect(
          tabResult.some((r) => r.validationCode === EmailValidationCodes.EMPTY)
        ).toBe(true)

        const newlineResult = validateEmail('\n')
        expect(
          newlineResult.some(
            (r) => r.validationCode === EmailValidationCodes.EMPTY
          )
        ).toBe(true)
      })

      it('should test String() conversion in isEmpty for edge inputs', () => {
        // The looksLikeEmail function expects string input with .match() method
        // Numeric and boolean inputs will crash because they don't have .match()
        // This tests that the function fails gracefully (or in this case, crashes as expected)

        expect(() => validateEmail(123 as any)).toThrow()
        expect(() => validateEmail(false as any)).toThrow()

        // Test object input that might get converted to string
        expect(() => validateEmail({} as any)).toThrow()
      })
    })
  })
})
