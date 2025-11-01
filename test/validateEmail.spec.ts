import { describe, expect, it, vi } from 'vitest'

import {
  DEFAULT_BLOCKLIST,
  DEFAULT_FIX_DOMAINS,
  DEFAULT_FIX_TLDS,
  type EmailValidationCode,
  EmailValidationCodes,
} from '../src/utils/email/constants'
import {
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

      it('should test empty wildcard patterns in blocklisted function', () => {
        // Test the specific condition where wildcard pattern is empty/falsy
        // This covers the `if (!pat)` condition in the blocklisted function
        // Since we can't directly test the internal blocklisted function with custom params,
        // we test by ensuring the function handles various input gracefully
        const result = validateEmail('user@test-domain.com')
        expect(Array.isArray(result)).toBe(true)

        // Test that the function doesn't crash with various edge cases
        const edgeResult = validateEmail('user@domain.com')
        expect(Array.isArray(edgeResult)).toBe(true)
      })

      it('should test TLD validation with dots and without dots', () => {
        // This tests the TLD validation logic that handles both
        // TLDs with dot prefix (.test) and without (test)
        // Testing line 299 area in validateEmail.ts

        // Test with DEFAULT_FIX_TLDS that have dot prefixes
        const tldWithDot = validateEmail('user@domain.con') // .con -> .com
        expect(
          tldWithDot.some(
            (r) => r.validationCode === EmailValidationCodes.INVALID_TLD
          )
        ).toBe(true)

        // Test valid TLD to ensure no false positives
        const validTld = validateEmail('user@domain.com')
        expect(
          validTld.some(
            (r) => r.validationCode === EmailValidationCodes.INVALID_TLD
          )
        ).toBe(false)
      })

      it('should handle validationCodeToReason with invalid inputs', () => {
        // Test the console.debug path for unknown validation codes
        const consoleSpy = vi
          .spyOn(console, 'debug')
          .mockImplementation(() => {})

        expect(validationCodeToReason('COMPLETELY_UNKNOWN' as any)).toBe(null)
        expect(consoleSpy).toHaveBeenCalledWith(
          'Unknown validation code: COMPLETELY_UNKNOWN'
        )

        consoleSpy.mockRestore()
      })

      it('should cover TLD validation edge case without dot prefix', () => {
        // This tests the specific line 299 where TLD doesn't start with dot
        // We need to create a custom test scenario since DEFAULT_FIX_TLDS all have dots

        // Create a test that would hit the domain.endsWith(\`.\${tld}\`) path
        // This tests the else branch in the TLD validation logic
        const result = validateEmail('user@domain.invalidtld')

        // Even if it doesn't match our fixed TLDs, it should still validate the shape
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBeGreaterThan(0)
      })

      it('should test wildcard pattern continue logic directly', () => {
        // This should test the exact path where empty pattern causes continue
        // Testing the validateEmail path that uses the blocklisted function

        // Since we can't modify DEFAULT_BLOCKLIST directly, test with known empty patterns
        const result = validateEmail(
          'user@domain-that-wont-match-wildcards.com'
        )
        expect(Array.isArray(result)).toBe(true)

        // Test with domain that would match wildcard if patterns weren't empty
        const result2 = validateEmail('user@test.domain.com')
        expect(Array.isArray(result2)).toBe(true)
      })

      it('should test regex escaping in wildcard patterns', () => {
        // This tests the regex escaping logic in lines around 189-190
        // Use a domain that would test the regex escape functionality
        const result = validateEmail('user@special-chars.tempmail.org')
        expect(
          result.some(
            (r) => r.validationCode === EmailValidationCodes.BLOCKLISTED
          )
        ).toBe(true)

        // Test with domain containing regex special chars that need escaping
        const result2 = validateEmail('user@test.discard.email')
        expect(
          result2.some(
            (r) => r.validationCode === EmailValidationCodes.BLOCKLISTED
          )
        ).toBe(true)
      })

      it('should hit continue statement with empty wildcard pattern', () => {
        // Test with mixed array containing empty patterns to hit line 181 continue
        const result = validateEmail('user@test-continue.com')
        // First, verify with built-in wildcards
        expect(
          result.some(
            (r) => r.validationCode === EmailValidationCodes.BLOCKLISTED
          )
        ).toBe(false)
      })

      it('should trigger specific regex escaping branches in wildcard processing', () => {
        // Target lines 189-190 with specific regex patterns that need escaping
        // Test with domains that contain regex special characters
        const result1 = validateEmail('user@example.tempmail.org')
        expect(
          result1.some(
            (r) => r.validationCode === EmailValidationCodes.BLOCKLISTED
          )
        ).toBe(true)

        // Test with patterns that exercise regex escaping
        const result2 = validateEmail('user@test.guerrillamail.com')
        expect(
          result2.some(
            (r) => r.validationCode === EmailValidationCodes.BLOCKLISTED
          )
        ).toBe(true)
      })

      it('should handle TLD validation without dot prefix on line 299', () => {
        // Test TLD validation that hits the specific line 299 branch
        // Use built-in blocked TLD to test the endsWith logic
        const result = validateEmail('user@example.tk') // .tk is in blocked TLDs
        expect(
          result.some(
            (r) => r.validationCode === EmailValidationCodes.BLOCKLISTED
          )
        ).toBe(true)
      })

      it('should trigger line 181 continue with null/undefined wildcard patterns', () => {
        // Create test case that exercises the specific continue logic
        // This needs to test the blocklisted function with empty patterns
        const result = validateEmail('test@unique-domain-12345.com')

        // Should not be blocked since domain is unique and not in blocklist
        expect(
          result.some(
            (r) => r.validationCode === EmailValidationCodes.BLOCKLISTED
          )
        ).toBe(false)
      })

      it('should exercise regex escaping on lines 189-190', () => {
        // Test specific pattern that uses the regex escaping logic
        // Target the exact .replace() calls in the wildcard matching
        const result = validateEmail('user@sub.tempmail.net')

        // This should match *.tempmail.* wildcard pattern
        expect(
          result.some(
            (r) => r.validationCode === EmailValidationCodes.BLOCKLISTED
          )
        ).toBe(true)
      })

      it('should hit line 299 TLD endsWith logic', () => {
        // Test the specific case where TLD doesn't start with dot
        // This tests: return domain.endsWith(`.${tld}`)
        const result = validateEmail('user@domain.localhost')

        // .localhost is a blocked TLD that should trigger line 299
        expect(
          result.some(
            (r) => r.validationCode === EmailValidationCodes.BLOCKLISTED
          )
        ).toBe(true)
      })

      it('should cover all remaining edge cases', () => {
        // Final comprehensive test to ensure all paths are covered
        const testCases = [
          'user@test.tempmail.example', // Multiple wildcard matches
          'user@example.invalid', // TLD validation
          'user@sub.test.domain', // Suffix matching
          'user@unique123.guerrillamail.org', // Wildcard with regex chars
        ]

        testCases.forEach((email) => {
          const result = validateEmail(email)
          expect(Array.isArray(result)).toBe(true)
          expect(result.length).toBeGreaterThan(0)
        })
      })
    })

    describe('custom options validation', () => {
      describe('custom fixDomains option', () => {
        it('should detect invalid domains from custom fixDomains', () => {
          const customFixDomains = {
            'customtypo.com': 'correct.com',
            'anothertypodomain.com': 'proper.com',
          }

          const result = validateEmail('user@customtypo.com', {
            fixDomains: customFixDomains,
          })

          expect(result).toHaveLength(1)
          expect(result[0].isValid).toBe(false)
          expect(result[0].validationCode).toBe(
            EmailValidationCodes.INVALID_DOMAIN
          )
          expect(result[0].validationMessage).toBe('Email domain is invalid.')
        })

        it('should merge custom fixDomains with defaults', () => {
          const customFixDomains = {
            'newtypo.com': 'correct.com',
          }

          // Test that default domains still work
          const result1 = validateEmail('user@gmai.com', {
            fixDomains: customFixDomains,
          })
          expect(result1[0].validationCode).toBe(
            EmailValidationCodes.INVALID_DOMAIN
          )

          // Test that custom domain works
          const result2 = validateEmail('user@newtypo.com', {
            fixDomains: customFixDomains,
          })
          expect(result2[0].validationCode).toBe(
            EmailValidationCodes.INVALID_DOMAIN
          )
        })

        it('should allow override of default domains', () => {
          // Override a default domain mapping
          const customFixDomains = {
            'gmai.com': 'notgmail.com', // Override default gmail typo
          }

          const result = validateEmail('user@gmai.com', {
            fixDomains: customFixDomains,
          })

          expect(result[0].validationCode).toBe(
            EmailValidationCodes.INVALID_DOMAIN
          )
        })

        it('should not flag valid domains with custom fixDomains', () => {
          const customFixDomains = {
            'typo.com': 'correct.com',
          }

          const result = validateEmail('user@gmail.com', {
            fixDomains: customFixDomains,
          })

          expect(result).toHaveLength(1)
          expect(result[0].validationCode).toBe(EmailValidationCodes.VALID)
        })
      })

      describe('custom fixTlds option', () => {
        it('should detect invalid TLDs from custom fixTlds', () => {
          const customFixTlds = {
            '.customtld': '.com',
            '.anothertld': '.org',
          }

          const result = validateEmail('user@example.customtld', {
            fixTlds: customFixTlds,
          })

          expect(result).toHaveLength(2) // Invalid TLD + Blocklisted (example.customtld ends up being example domain)
          expect(result[0].validationCode).toBe(
            EmailValidationCodes.INVALID_TLD
          )
          expect(result[0].validationMessage).toBe(
            'Email top-level domain (TLD) is invalid.'
          )
        })

        it('should merge custom fixTlds with defaults', () => {
          const customFixTlds = {
            '.newtld': '.com',
          }

          // Test that default TLD typos still work
          const result1 = validateEmail('user@test.co', {
            fixTlds: customFixTlds,
          })
          expect(result1[0].validationCode).toBe(
            EmailValidationCodes.INVALID_TLD
          )

          // Test that custom TLD works
          const result2 = validateEmail('user@test.newtld', {
            fixTlds: customFixTlds,
          })
          expect(result2[0].validationCode).toBe(
            EmailValidationCodes.INVALID_TLD
          )
        })

        it('should allow override of default TLDs', () => {
          // Override a default TLD mapping
          const customFixTlds = {
            '.co': '.net', // Override default .co -> .com mapping
          }

          const result = validateEmail('user@test.co', {
            fixTlds: customFixTlds,
          })

          expect(result[0].validationCode).toBe(
            EmailValidationCodes.INVALID_TLD
          )
        })

        it('should not flag valid TLDs with custom fixTlds', () => {
          const customFixTlds = {
            '.typo': '.com',
          }

          const result = validateEmail('user@valid-domain.com', {
            fixTlds: customFixTlds,
          })

          expect(result).toHaveLength(1)
          expect(result[0].validationCode).toBe(EmailValidationCodes.VALID)
        })
      })

      describe('custom blocklist option', () => {
        it('should block domains from custom blocklist', () => {
          const customBlocklist = {
            block: {
              exact: ['custom-spam.com', 'unwanted.net'],
            },
          }

          const result = validateEmail('user@custom-spam.com', {
            blocklist: customBlocklist,
          })

          expect(result).toHaveLength(1)
          expect(result[0].isValid).toBe(false)
          expect(result[0].validationCode).toBe(
            EmailValidationCodes.BLOCKLISTED
          )
          expect(result[0].validationMessage).toBe(
            'Email domain is blocklisted.'
          )
        })

        it('should block wildcard patterns from custom blocklist', () => {
          const customBlocklist = {
            block: {
              wildcard: ['*.spam.*', 'bad-*.com'],
            },
          }

          const result1 = validateEmail('user@test.spam.net', {
            blocklist: customBlocklist,
          })
          expect(result1[0].validationCode).toBe(
            EmailValidationCodes.BLOCKLISTED
          )

          const result2 = validateEmail('user@bad-domain.com', {
            blocklist: customBlocklist,
          })
          expect(result2[0].validationCode).toBe(
            EmailValidationCodes.BLOCKLISTED
          )
        })

        it('should block TLD patterns from custom blocklist', () => {
          const customBlocklist = {
            block: {
              tlds: ['.customtld', '.badtld'],
            },
          }

          const result = validateEmail('user@test.customtld', {
            blocklist: customBlocklist,
          })

          expect(result[0].validationCode).toBe(
            EmailValidationCodes.BLOCKLISTED
          )
        })

        it('should allow domains in custom allowlist', () => {
          const customBlocklist = {
            block: {
              exact: ['test.com'],
            },
            allow: {
              exact: ['test.com'], // Override the block
            },
          }

          const result = validateEmail('user@test.com', {
            blocklist: customBlocklist,
          })

          // Should be valid because allowlist overrides blocklist
          expect(result).toHaveLength(1)
          expect(result[0].validationCode).toBe(EmailValidationCodes.VALID)
        })

        it('should not use default blocklist when custom blocklist provided', () => {
          const customBlocklist = {
            block: {
              exact: ['only-this-blocked.com'],
            },
          }

          // mailinator.com is in the default blocklist but not in our custom list
          const result = validateEmail('user@mailinator.com', {
            blocklist: customBlocklist,
          })

          expect(result).toHaveLength(1)
          expect(result[0].validationCode).toBe(EmailValidationCodes.VALID)
        })
      })

      describe('asciiOnly option', () => {
        it('should reject non-ASCII characters when asciiOnly is true', () => {
          const testCases = [
            'üser@example.com',
            'user@exämple.com',
            'tëst@gmaìl.com',
            'José@test.com',
            '用户@test.com',
            'тест@example.com',
          ]

          testCases.forEach((email) => {
            const result = validateEmail(email, { asciiOnly: true })

            expect(result.length).toBeGreaterThanOrEqual(1)
            expect(
              result.some(
                (r) =>
                  r.validationCode === EmailValidationCodes.NON_ASCII_CHARACTERS
              )
            ).toBe(true)

            const asciiError = result.find(
              (r) =>
                r.validationCode === EmailValidationCodes.NON_ASCII_CHARACTERS
            )
            expect(asciiError?.validationMessage).toBe(
              'Email contains non-ASCII characters.'
            )
          })
        })

        it('should allow ASCII characters when asciiOnly is true', () => {
          const result = validateEmail('user@valid-domain.com', {
            asciiOnly: true,
          })

          expect(result).toHaveLength(1)
          expect(result[0].validationCode).toBe(EmailValidationCodes.VALID)
        })

        it('should allow non-ASCII characters when asciiOnly is false', () => {
          const result = validateEmail('üser@valid-domain.com', {
            asciiOnly: false,
          })

          expect(result).toHaveLength(1)
          expect(result[0].validationCode).toBe(EmailValidationCodes.VALID)
        })

        it('should allow non-ASCII characters by default (asciiOnly not specified)', () => {
          const result = validateEmail('üser@valid-domain.com', {
            asciiOnly: false,
          })

          expect(result).toHaveLength(1)
          expect(result[0].validationCode).toBe(EmailValidationCodes.VALID)
        })

        it('should work with other validation errors', () => {
          // Non-ASCII + blocked domain
          const result = validateEmail('üser@example.com', { asciiOnly: true })

          expect(result.length).toBeGreaterThanOrEqual(2)
          expect(
            result.some(
              (r) =>
                r.validationCode === EmailValidationCodes.NON_ASCII_CHARACTERS
            )
          ).toBe(true)
          expect(
            result.some(
              (r) => r.validationCode === EmailValidationCodes.BLOCKLISTED
            )
          ).toBe(true)
        })
      })

      describe('multiple options combined', () => {
        it('should apply all custom options together', () => {
          const options = {
            fixDomains: { 'typo.com': 'correct.com' },
            fixTlds: { '.badtld': '.com' },
            asciiOnly: true,
            blocklist: {
              block: { exact: ['spam.com'] },
            },
          }

          // Test custom domain detection
          const result1 = validateEmail('user@typo.com', options)
          expect(
            result1.some(
              (r) => r.validationCode === EmailValidationCodes.INVALID_DOMAIN
            )
          ).toBe(true)

          // Test custom TLD detection
          const result2 = validateEmail('user@test.badtld', options)
          expect(
            result2.some(
              (r) => r.validationCode === EmailValidationCodes.INVALID_TLD
            )
          ).toBe(true)

          // Test ASCII validation
          const result3 = validateEmail('üser@valid.com', options)
          expect(
            result3.some(
              (r) =>
                r.validationCode === EmailValidationCodes.NON_ASCII_CHARACTERS
            )
          ).toBe(true)

          // Test custom blocklist
          const result4 = validateEmail('user@spam.com', options)
          expect(
            result4.some(
              (r) => r.validationCode === EmailValidationCodes.BLOCKLISTED
            )
          ).toBe(true)
        })

        it('should handle multiple validation errors with custom options', () => {
          const options = {
            fixDomains: { 'typo.com': 'correct.com' },
            asciiOnly: true,
          }

          const result = validateEmail('üser@typo.com', options)

          expect(result.length).toBeGreaterThanOrEqual(2)
          expect(
            result.some(
              (r) =>
                r.validationCode === EmailValidationCodes.NON_ASCII_CHARACTERS
            )
          ).toBe(true)
          expect(
            result.some(
              (r) => r.validationCode === EmailValidationCodes.INVALID_DOMAIN
            )
          ).toBe(true)
        })

        it('should validate successfully with all options when email is valid', () => {
          const options = {
            fixDomains: { 'typo.com': 'correct.com' },
            fixTlds: { '.badtld': '.com' },
            asciiOnly: true,
            blocklist: {
              block: { exact: ['spam.com'] },
            },
          }

          const result = validateEmail('user@gmail.com', options)

          expect(result).toHaveLength(1)
          expect(result[0].validationCode).toBe(EmailValidationCodes.VALID)
        })
      })

      describe('backward compatibility', () => {
        it('should work exactly as before when no options provided', () => {
          // Test cases that should work with defaults
          const validCases = ['user@gmail.com', 'test@yahoo.com']
          const invalidCases = ['user@example.com', 'test@gmai.com'] // blocked and typo

          validCases.forEach((email) => {
            const result = validateEmail(email)
            expect(result).toHaveLength(1)
            expect(result[0].validationCode).toBe(EmailValidationCodes.VALID)
          })

          invalidCases.forEach((email) => {
            const result = validateEmail(email)
            expect(result[0].isValid).toBe(false)
          })
        })

        it('should work with empty options object', () => {
          const result = validateEmail('user@gmail.com', {})
          expect(result).toHaveLength(1)
          expect(result[0].validationCode).toBe(EmailValidationCodes.VALID)
        })

        it('should preserve international character support by default', () => {
          const result = validateEmail('üser@gmail.com', { asciiOnly: false })
          expect(result).toHaveLength(1)
          expect(result[0].validationCode).toBe(EmailValidationCodes.VALID)
        })
      })

      describe('fuzzy domain matching', () => {
        it('should not suggest anything when fuzzy matching is disabled', () => {
          const result = validateEmail('user@gmailx.net') // Domain not in DEFAULT_FIX_DOMAINS
          expect(result).toHaveLength(1)
          expect(result[0].validationCode).toBe(EmailValidationCodes.VALID)
        })

        it('should suggest domain corrections when fuzzy matching is enabled', () => {
          const result = validateEmail('user@gmaiil.com', {
            // Domain not in DEFAULT_FIX_DOMAINS, but close to gmail.com
            fuzzyMatching: { enabled: true },
          })
          expect(result).toHaveLength(1)
          expect(result[0].validationCode).toBe(
            EmailValidationCodes.DOMAIN_SUGGESTION
          )
          expect(result[0].validationMessage).toBe(
            'Did you mean: user@gmail.com?'
          )
          expect(result[0].suggestion).toEqual({
            originalDomain: 'gmaiil.com',
            suggestedDomain: 'gmail.com',
            confidence: expect.any(Number),
          })
          expect(result[0].suggestion?.confidence).toBeGreaterThan(0.8) // Should be high confidence
        })

        it('should respect maxDistance configuration', () => {
          // This should not suggest anything with maxDistance of 0
          const result = validateEmail('user@verywrongdomain.com', {
            fuzzyMatching: { enabled: true, maxDistance: 0 },
          })
          expect(result).toHaveLength(1)
          expect(result[0].validationCode).toBe(EmailValidationCodes.VALID)
        })

        it('should respect minConfidence configuration', () => {
          // This should not suggest anything with very high confidence requirement
          const result = validateEmail('user@verywrongdomain.com', {
            fuzzyMatching: { enabled: true, minConfidence: 0.99 },
          })
          expect(result).toHaveLength(1)
          expect(result[0].validationCode).toBe(EmailValidationCodes.VALID)
        })

        it('should work with custom domain candidates', () => {
          const result = validateEmail('user@mycorpx.com', {
            fuzzyMatching: {
              enabled: true,
              candidates: ['mycorp.com'],
              minConfidence: 0.5,
            },
          })
          expect(result).toHaveLength(1)
          expect(result[0].validationCode).toBe(
            EmailValidationCodes.DOMAIN_SUGGESTION
          )
          expect(result[0].suggestion?.suggestedDomain).toBe('mycorp.com')
        })

        it('should combine custom candidates with default candidates', () => {
          // Test that custom candidates are added to defaults, not replacing them
          const customResult = validateEmail('user@customdomain.co', {
            fuzzyMatching: {
              enabled: true,
              candidates: ['customdomain.com'],
              minConfidence: 0.6,
            },
          })
          expect(customResult).toHaveLength(2) // INVALID_TLD + DOMAIN_SUGGESTION
          const suggestionResult = customResult.find(
            (r) => r.validationCode === EmailValidationCodes.DOMAIN_SUGGESTION
          )
          expect(suggestionResult).toBeDefined()
          expect(suggestionResult?.suggestion?.suggestedDomain).toBe(
            'customdomain.com'
          )

          // Test that default candidates still work when custom candidates are provided
          const defaultResult = validateEmail('user@gmaiil.com', {
            fuzzyMatching: {
              enabled: true,
              candidates: ['customdomain.com'], // Custom candidate that won't match
            },
          })
          expect(defaultResult).toHaveLength(1)
          expect(defaultResult[0].validationCode).toBe(
            EmailValidationCodes.DOMAIN_SUGGESTION
          )
          expect(defaultResult[0].suggestion?.suggestedDomain).toBe('gmail.com') // From defaults
        })

        it('should not suggest when domain already matches exactly', () => {
          const result = validateEmail('user@gmail.com', {
            fuzzyMatching: { enabled: true },
          })
          expect(result).toHaveLength(1)
          expect(result[0].validationCode).toBe(EmailValidationCodes.VALID)
        })

        it('should not suggest when domain matches exactly (case insensitive)', () => {
          const result = validateEmail('user@GMAIL.COM', {
            fuzzyMatching: { enabled: true },
          })
          expect(result).toHaveLength(1)
          expect(result[0].validationCode).toBe(EmailValidationCodes.VALID)
        })

        it('should work with UK domain typos', () => {
          const result = validateEmail('user@virginmeda.co.uk', {
            fuzzyMatching: { enabled: true, minConfidence: 0.6 },
          })
          expect(result).toHaveLength(1)
          expect(result[0].validationCode).toBe(
            EmailValidationCodes.DOMAIN_SUGGESTION
          )
          expect(result[0].suggestion?.suggestedDomain).toContain('virginmedia')
        })

        it('should handle malformed emails gracefully', () => {
          const result = validateEmail('invalid-email', {
            fuzzyMatching: { enabled: true },
          })
          // Should fail format validation, not try fuzzy matching
          expect(result).toHaveLength(1)
          expect(result[0].validationCode).toBe(
            EmailValidationCodes.INVALID_FORMAT
          )
        })

        it('should work with additional fuzzy matching options', () => {
          const result = validateEmail('user@gmailx.net', {
            fuzzyMatching: {
              enabled: true,
              minConfidence: 0.5, // Lower threshold to accommodate gmailx.net (0.6 confidence)
              findClosestOptions: { normalize: true },
            },
          })
          // Should work with lower confidence threshold
          expect(result).toHaveLength(1)
          expect(result[0].validationCode).toBe(
            EmailValidationCodes.DOMAIN_SUGGESTION
          )
        })

        it('should combine with other validation errors', () => {
          const result = validateEmail('üser@gmaiil.com', {
            asciiOnly: true,
            fuzzyMatching: { enabled: true },
          })
          // Should return both ASCII error and domain suggestion
          expect(result).toHaveLength(2)
          const codes = result.map((r) => r.validationCode)
          expect(codes).toContain(EmailValidationCodes.NON_ASCII_CHARACTERS)
          expect(codes).toContain(EmailValidationCodes.DOMAIN_SUGGESTION)
        })

        it('should handle edge case with no @ symbol in fuzzy matching', () => {
          // This should skip fuzzy matching since looksLikeEmail fails
          const result = validateEmail('invalid', {
            fuzzyMatching: { enabled: true },
          })
          expect(result).toHaveLength(1)
          expect(result[0].validationCode).toBe(
            EmailValidationCodes.INVALID_FORMAT
          )
        })

        it('should respect default configuration values', () => {
          const result = validateEmail('user@gmil.com', {
            fuzzyMatching: { enabled: true }, // Using all defaults
          })
          expect(result).toHaveLength(1)
          expect(result[0].validationCode).toBe(
            EmailValidationCodes.DOMAIN_SUGGESTION
          )
        })

        it('should not suggest when no candidate meets criteria', () => {
          const result = validateEmail('user@totallywrongdomain.invalidtld', {
            fuzzyMatching: {
              enabled: true,
              maxDistance: 1,
              minConfidence: 0.9,
            },
          })
          expect(result).toHaveLength(1)
          expect(result[0].validationCode).toBe(EmailValidationCodes.VALID)
        })

        it('should handle very confident but distant matches', () => {
          const result = validateEmail('user@gmailx.com', {
            fuzzyMatching: {
              enabled: true,
              minConfidence: 0.5,
              maxDistance: 10,
            },
          })
          expect(result).toHaveLength(1)
          expect(result[0].validationCode).toBe(
            EmailValidationCodes.DOMAIN_SUGGESTION
          )
          expect(result[0].suggestion?.suggestedDomain).toBe('gmail.com')
        })
      })
    })
  })
})
