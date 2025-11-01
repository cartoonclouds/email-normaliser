import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import { EmailChangeCodes } from '../src'
import { useEmail } from '../src/composables/useEmail'
import { normaliseEmail } from '../src/utils/email/normaliseEmail'
import type { UseEmailOptions } from '../src/utils/email/types'

// Mock the entire module
vi.mock('../src/utils/email/normaliseEmail', () => ({
  normaliseEmail: vi.fn(),
  EmailChangeCodes: {
    EMPTY: 'empty',
    BLOCKED_BY_LIST: 'blocked_by_list',
    DEOBFUSCATED_AT_AND_DOT: 'deobfuscated_at_and_dot',
    FIXED_DOMAIN_AND_TLD_TYPOS: 'fixed_domain_and_tld_typos',
    INVALID_EMAIL_SHAPE: 'invalid_email_shape',
    LOWERCASED_DOMAIN: 'lowercased_domain',
    NORMALIZED_UNICODE_SYMBOLS: 'normalized_unicode_symbols',
    STRIPPED_DISPLAY_NAME_AND_COMMENTS: 'stripped_display_name_and_comments',
    TIDIED_PUNCTUATION_AND_SPACING: 'tidied_punctuation_and_spacing',
  },
}))

// Get the mocked function
const mockNormaliseEmail = vi.mocked(normaliseEmail)

describe('useEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock implementation
    mockNormaliseEmail.mockImplementation((input: string) => ({
      email: input,
      valid: true,
      changes: [],
      changeCodes: [],
    }))
  })

  describe('initialization', () => {
    it('should initialize with empty string by default', () => {
      const { value, email, valid, changes } = useEmail()

      expect(value.value).toBe('')
      expect(email.value).toBe('')
      expect(valid.value).toBe(true)
      expect(changes.value).toEqual([])
    })

    it('should initialize with provided initial value', () => {
      const initialEmail = 'test@example.com'
      const { value, email } = useEmail(initialEmail)

      expect(value.value).toBe(initialEmail)
      expect(email.value).toBe(initialEmail)
    })

    it('should set autoFormat to false by default', () => {
      const options: UseEmailOptions = {}
      useEmail('', options)

      expect(options.autoFormat).toBe(false)
    })

    it('should preserve autoFormat when explicitly set', () => {
      const options: UseEmailOptions = { autoFormat: true }
      useEmail('', options)

      expect(options.autoFormat).toBe(true)
    })

    it('should preserve other options alongside autoFormat', () => {
      const options: UseEmailOptions = {
        autoFormat: true,
        blocklist: { block: { exact: ['test.com'] } },
      }
      useEmail('', options)

      expect(options.autoFormat).toBe(true)
      expect(options.blocklist).toEqual({ block: { exact: ['test.com'] } })
    })
  })

  describe('computed properties', () => {
    it('should compute email from normalisation result', () => {
      mockNormaliseEmail.mockReturnValue({
        email: 'normalized@example.com',
        valid: true,
        changes: [],
        changeCodes: [],
      })

      const { email } = useEmail('original@example.com')

      expect(email.value).toBe('normalized@example.com')
    })

    it('should compute email as null when normalisation returns null', () => {
      mockNormaliseEmail.mockReturnValue({
        email: null,
        valid: false,
        changes: ['Invalid email format.'],
        changeCodes: [EmailChangeCodes.INVALID_EMAIL_SHAPE],
      })

      const { email } = useEmail('invalid')

      expect(email.value).toBeNull()
    })

    it('should compute valid as true when both internal and result are valid', () => {
      mockNormaliseEmail.mockReturnValue({
        email: 'test@example.com',
        valid: true,
        changes: [],
        changeCodes: [],
      })

      const { valid } = useEmail('test@example.com')

      expect(valid.value).toBe(true)
    })

    it('should compute valid as false when normalisation result is invalid', () => {
      mockNormaliseEmail.mockReturnValue({
        email: 'invalid',
        valid: false,
        changes: ['Invalid email format.'],
        changeCodes: [EmailChangeCodes.INVALID_EMAIL_SHAPE],
      })

      const { valid } = useEmail('invalid')

      expect(valid.value).toBe(false)
    })

    it('should compute valid as false when internal validity is false', () => {
      mockNormaliseEmail.mockReturnValue({
        email: 'test@example.com',
        valid: true,
        changes: ['Lowercased domain part.'],
        changeCodes: [EmailChangeCodes.LOWERCASED_DOMAIN],
      })

      const { valid, validate } = useEmail('Test@Example.COM')

      // Force validation which will set isValid to false due to changes
      validate()

      expect(valid.value).toBe(false)
    })

    it('should compute changes from normalisation result', () => {
      const expectedChanges = ['Lowercased domain part.']
      mockNormaliseEmail.mockReturnValue({
        email: 'test@example.com',
        valid: true,
        changes: expectedChanges,
        changeCodes: [EmailChangeCodes.LOWERCASED_DOMAIN],
      })

      const { changes } = useEmail('Test@Example.COM')

      expect(changes.value).toEqual(expectedChanges)
    })
  })

  describe('apply method', () => {
    it('should update value when normalized email differs from current value', () => {
      mockNormaliseEmail.mockReturnValue({
        email: 'test@example.com',
        valid: true,
        changes: ['Lowercased domain part.'],
        changeCodes: [EmailChangeCodes.LOWERCASED_DOMAIN],
      })

      const { value, apply } = useEmail('Test@Example.COM')

      expect(value.value).toBe('Test@Example.COM')

      apply()

      expect(value.value).toBe('test@example.com')
    })

    it('should not update value when normalized email is null', () => {
      mockNormaliseEmail.mockReturnValue({
        email: null,
        valid: false,
        changes: ['Invalid email format.'],
        changeCodes: [EmailChangeCodes.INVALID_EMAIL_SHAPE],
      })

      const { value, apply } = useEmail('invalid')

      apply()

      expect(value.value).toBe('invalid')
    })

    it('should not update value when normalized email is same as current value', () => {
      mockNormaliseEmail.mockReturnValue({
        email: 'test@example.com',
        valid: true,
        changes: [],
        changeCodes: [],
      })

      const { value, apply } = useEmail('test@example.com')

      apply()

      expect(value.value).toBe('test@example.com')
    })

    it('should not update value when normalized email is empty string', () => {
      mockNormaliseEmail.mockReturnValue({
        email: '',
        valid: false,
        changes: ['Invalid email format.'],
        changeCodes: ['invalid_email_shape'],
      })

      const { value, apply } = useEmail('invalid')

      apply()

      expect(value.value).toBe('invalid')
    })
  })

  describe('validate method', () => {
    it('should return true and set isValid to true when no changes are needed', () => {
      mockNormaliseEmail.mockReturnValue({
        email: 'test@example.com',
        valid: true,
        changes: [],
        changeCodes: [],
      })

      const { validate, valid } = useEmail('test@example.com')

      const result = validate()

      expect(result).toBe(true)
      expect(valid.value).toBe(true)
    })

    it('should return false and set isValid to false when changes are needed', () => {
      mockNormaliseEmail.mockReturnValue({
        email: 'test@example.com',
        valid: true,
        changes: ['Lowercased domain part.'],
        changeCodes: [EmailChangeCodes.LOWERCASED_DOMAIN],
      })

      const { validate, valid } = useEmail('Test@Example.COM')

      const result = validate()

      expect(result).toBe(false)
      expect(valid.value).toBe(false)
    })

    it('should return false when email is invalid', () => {
      mockNormaliseEmail.mockReturnValue({
        email: 'invalid',
        valid: false,
        changes: ['Invalid email format.'],
        changeCodes: [EmailChangeCodes.INVALID_EMAIL_SHAPE],
      })

      const { validate } = useEmail('invalid')

      const result = validate()

      expect(result).toBe(false)
    })
  })

  describe('watchers', () => {
    it('should update validity when result changes', async () => {
      // Start with valid email
      mockNormaliseEmail.mockReturnValue({
        email: 'test@example.com',
        valid: true,
        changes: [],
        changeCodes: [],
      })

      const { value, valid } = useEmail('test@example.com')
      expect(valid.value).toBe(true)

      // Change mock to invalid result
      mockNormaliseEmail.mockReturnValue({
        email: 'invalid',
        valid: false,
        changes: ['Invalid email format.'],
        changeCodes: [EmailChangeCodes.INVALID_EMAIL_SHAPE],
      })

      // Trigger change
      value.value = 'invalid'
      await nextTick()

      expect(valid.value).toBe(false)
    })

    it('should auto-format when autoFormat is true and normalized email differs', async () => {
      mockNormaliseEmail.mockReturnValue({
        email: 'test@example.com',
        valid: true,
        changes: ['Lowercased domain part.'],
        changeCodes: [EmailChangeCodes.LOWERCASED_DOMAIN],
      })

      const { value } = useEmail('', { autoFormat: true })

      value.value = 'Test@Example.COM'
      await nextTick()

      expect(value.value).toBe('test@example.com')
    })

    it('should not auto-format when autoFormat is false', async () => {
      mockNormaliseEmail.mockReturnValue({
        email: 'test@example.com',
        valid: true,
        changes: ['Lowercased domain part.'],
        changeCodes: [EmailChangeCodes.LOWERCASED_DOMAIN],
      })

      const { value } = useEmail('', { autoFormat: false })

      const original = 'Test@Example.COM'
      value.value = original
      await nextTick()

      expect(value.value).toBe(original)
    })

    it('should not auto-format when normalized email is null', async () => {
      mockNormaliseEmail.mockReturnValue({
        email: null,
        valid: false,
        changes: ['Invalid email format.'],
        changeCodes: [EmailChangeCodes.INVALID_EMAIL_SHAPE],
      })

      const { value } = useEmail('', { autoFormat: true })

      const original = 'invalid'
      value.value = original
      await nextTick()

      expect(value.value).toBe(original)
    })

    it('should not auto-format when normalized email is same as current value', async () => {
      mockNormaliseEmail.mockReturnValue({
        email: 'test@example.com',
        valid: true,
        changes: [],
        changeCodes: [],
      })

      const { value } = useEmail('', { autoFormat: true })

      const original = 'test@example.com'
      value.value = original
      await nextTick()

      expect(value.value).toBe(original)
    })

    it('should not auto-format when normalized email is empty', async () => {
      mockNormaliseEmail.mockReturnValue({
        email: '',
        valid: false,
        changes: [],
        changeCodes: [],
      })

      const { value } = useEmail('', { autoFormat: true })

      const original = 'invalid'
      value.value = original
      await nextTick()

      expect(value.value).toBe(original)
    })

    it('should handle watcher with validate returning false and result valid false', async () => {
      // Mock to return invalid result with no changes (edge case)
      mockNormaliseEmail.mockReturnValue({
        email: 'blocked@test.com',
        valid: false,
        changes: [],
        changeCodes: [EmailChangeCodes.BLOCKED_BY_LIST],
      })

      const { value, valid } = useEmail('')

      value.value = 'blocked@test.com'
      await nextTick()

      expect(valid.value).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle undefined initial value', () => {
      const { value } = useEmail(undefined as any)

      expect(value.value).toBe('')
    })

    it('should handle null initial value', () => {
      const { value } = useEmail(null as any)

      expect(value.value).toBe(null)
    })

    it('should handle empty options object', () => {
      const options = {}
      useEmail('', options)

      expect((options as any).autoFormat).toBe(false)
    })

    it('should pass options to normaliseEmail correctly', () => {
      const options = {
        autoFormat: false,
        blocklist: { block: { exact: ['test.com'] } },
      }

      const { value } = useEmail('test@example.com', options)

      // Accessing the computed property will trigger normaliseEmail
      void value.value

      expect(mockNormaliseEmail).toHaveBeenCalledWith(
        'test@example.com',
        options
      )
    })

    it('should handle rapid value changes', async () => {
      mockNormaliseEmail.mockImplementation((input: string) => ({
        email: input,
        valid: true,
        changes: [],
        changeCodes: [],
      }))

      const { value, email } = useEmail()

      value.value = 'first@example.com'
      value.value = 'second@example.com'
      await nextTick()

      expect(email.value).toBe('second@example.com')
    })

    it('should maintain reactivity with multiple state changes', async () => {
      const { value, email, valid, changes } = useEmail()

      // First change
      mockNormaliseEmail.mockReturnValue({
        email: 'test1@example.com',
        valid: true,
        changes: [],
        changeCodes: [],
      })
      value.value = 'test1@example.com'
      await nextTick()

      expect(email.value).toBe('test1@example.com')
      expect(valid.value).toBe(true)
      expect(changes.value).toEqual([])

      // Second change with validation changes
      mockNormaliseEmail.mockReturnValue({
        email: 'test2@example.com',
        valid: true,
        changes: ['Lowercased domain part.'],
        changeCodes: [EmailChangeCodes.LOWERCASED_DOMAIN],
      })
      value.value = 'Test2@Example.COM'
      await nextTick()

      expect(email.value).toBe('test2@example.com')
      expect(changes.value).toEqual(['Lowercased domain part.'])
    })
  })

  describe('complete code coverage', () => {
    it('should cover all branches in apply method', () => {
      // Test case where email.value is truthy but same as value.value
      mockNormaliseEmail.mockReturnValue({
        email: 'test@example.com',
        valid: true,
        changes: [],
        changeCodes: [],
      })

      const { apply } = useEmail('test@example.com')

      // This should not change anything since email === value
      apply()

      // Just verify it doesn't throw
      expect(true).toBe(true)
    })

    it('should cover the result watcher logic completely', async () => {
      // Test the exact logic: isValid.value = validate() && nv.valid

      // First, start with a case where validate() returns true and nv.valid is true
      mockNormaliseEmail.mockReturnValue({
        email: 'test@example.com',
        valid: true,
        changes: [],
        changeCodes: [],
      })

      const { value, valid } = useEmail('test@example.com')
      await nextTick()
      expect(valid.value).toBe(true)

      // Now test case where validate() returns false but nv.valid is true
      mockNormaliseEmail.mockReturnValue({
        email: 'test@example.com',
        valid: true,
        changes: ['Some change'],
        changeCodes: [EmailChangeCodes.LOWERCASED_DOMAIN],
      })

      value.value = 'Test@Example.COM'
      await nextTick()

      expect(valid.value).toBe(false) // Because validate() returns false due to changes

      // Finally test case where validate() returns true but nv.valid is false
      mockNormaliseEmail.mockReturnValue({
        email: 'blocked@test.com',
        valid: false,
        changes: [],
        changeCodes: [EmailChangeCodes.BLOCKED_BY_LIST],
      })

      value.value = 'blocked@test.com'
      await nextTick()

      expect(valid.value).toBe(false) // Because nv.valid is false
    })

    it('should cover value watcher with all conditions', async () => {
      // Test autoFormat undefined behavior (falsy but not false)
      mockNormaliseEmail.mockReturnValue({
        email: 'test@example.com',
        valid: true,
        changes: [],
        changeCodes: [],
      })

      const { value } = useEmail('', { autoFormat: undefined })

      value.value = 'Test@Example.COM'
      await nextTick()

      // Should not auto-format since autoFormat is falsy
      expect(value.value).toBe('Test@Example.COM')
    })
  })
})
