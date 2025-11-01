/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp } from 'vue'

import emailDirective from '../src/directives/email'
import {
  DEFAULT_BLOCKLIST,
  DEFAULT_FIX_DOMAINS,
  DEFAULT_FIX_TLDS,
} from '../src/utils/email/constants'
import { normaliseEmail } from '../src/utils/email/normaliseEmail'

// Mock the normaliseEmail function
vi.mock('../src/utils/email/normaliseEmail', () => ({
  normaliseEmail: vi.fn(),
}))

// Mock console.warn to test warning messages
const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

// Get the mocked function
const mockNormaliseEmail = vi.mocked(normaliseEmail)

describe('email directive', () => {
  let container: HTMLElement
  let input: HTMLInputElement
  let app: any
  let previewElement: HTMLElement

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup DOM
    container = document.createElement('div')
    container.innerHTML = `
      <form>
        <input type="email" />
        <div id="email-preview"></div>
        <div class="preview-element"></div>
      </form>
    `
    document.body.appendChild(container)

    input = container.querySelector('input') as HTMLInputElement
    previewElement = container.querySelector('#email-preview') as HTMLElement

    // Default mock implementation
    mockNormaliseEmail.mockImplementation((rawEmail: string) => ({
      email: rawEmail.toLowerCase(),
      valid: true,
      changes: [],
      changeCodes: [],
    }))

    // Create Vue app
    app = createApp({
      template: '<div></div>',
    })
    app.directive('email', emailDirective)
  })

  afterEach(() => {
    if (container && document.body.contains(container)) {
      document.body.removeChild(container)
    }
    if (app) {
      app.unmount()
    }
    mockConsoleWarn.mockClear()
  })

  describe('resolve function (via mounted)', () => {
    it('should resolve with default options when no binding value is provided', () => {
      // Mock normaliseEmail to capture the options passed to it
      let capturedOptions: any = null
      mockNormaliseEmail.mockImplementation((email: string, options: any) => {
        capturedOptions = options
        return {
          email: email,
          valid: true,
          changes: [],
          changeCodes: [],
        }
      })

      emailDirective.mounted(input, { value: undefined })

      expect(capturedOptions).toEqual({
        autoFormat: false,
        previewSelector: undefined,
        onnormalised: undefined,
        blocklist: DEFAULT_BLOCKLIST,
        fixDomains: DEFAULT_FIX_DOMAINS,
        fixTlds: DEFAULT_FIX_TLDS,
        autoFormatEvents: {
          onInput: true,
          onBlur: true,
        },
      })
    })

    it('should resolve with custom options when binding value is provided', () => {
      const customBlocklist = {
        block: { exact: ['test.com'], suffix: [], wildcard: [], tlds: [] },
        allow: { exact: [] },
      }
      const customFixDomains = { 'typo.com': 'correct.com' }
      const customFixTlds = { '.cm': '.com' }
      const onnormalisedCallback = vi.fn()

      let capturedOptions: any = null
      mockNormaliseEmail.mockImplementation((email: string, options: any) => {
        capturedOptions = options
        return {
          email: email,
          valid: true,
          changes: [],
          changeCodes: [],
        }
      })

      emailDirective.mounted(input, {
        value: {
          autoFormat: true,
          previewSelector: '#email-preview',
          onnormalised: onnormalisedCallback,
          blocklist: customBlocklist,
          fixDomains: customFixDomains,
          fixTlds: customFixTlds,
          autoFormatEvents: {
            onInput: false,
            onBlur: true,
          },
        },
      })

      expect(capturedOptions.autoFormat).toBe(true)
      expect(capturedOptions.previewSelector).toBe('#email-preview')
      expect(capturedOptions.onnormalised).toBe(onnormalisedCallback)
      expect(capturedOptions.blocklist).toEqual({
        ...DEFAULT_BLOCKLIST,
        ...customBlocklist,
      })
      expect(capturedOptions.fixDomains).toEqual({
        ...DEFAULT_FIX_DOMAINS,
        ...customFixDomains,
      })
      expect(capturedOptions.fixTlds).toEqual({
        ...DEFAULT_FIX_TLDS,
        ...customFixTlds,
      })
      expect(capturedOptions.autoFormatEvents).toEqual({
        onInput: false,
        onBlur: true,
      })
    })

    it('should find preview element within form first, then globally', () => {
      // Create a form with a preview element and another preview element outside
      const formWithPreview = document.createElement('form')
      formWithPreview.innerHTML = `
        <input type="email" />
        <div class="preview-test">Form Preview</div>
      `
      const globalPreview = document.createElement('div')
      globalPreview.className = 'preview-test'
      globalPreview.textContent = 'Global Preview'

      document.body.appendChild(formWithPreview)
      document.body.appendChild(globalPreview)

      const formInput = formWithPreview.querySelector(
        'input'
      ) as HTMLInputElement

      mockNormaliseEmail.mockReturnValue({
        email: 'test@example.com',
        valid: true,
        changes: [],
        changeCodes: [],
      })

      emailDirective.mounted(formInput, {
        value: { previewSelector: '.preview-test' },
      })

      // The form's preview element should be found and updated
      const formPreviewElement = formWithPreview.querySelector(
        '.preview-test'
      ) as HTMLElement
      expect(formPreviewElement.textContent).toBe('test@example.com')
      expect(formPreviewElement.getAttribute('data-valid')).toBe('true')

      // The global preview element should not be affected
      expect(globalPreview.textContent).toBe('Global Preview')

      // Cleanup
      document.body.removeChild(formWithPreview)
      document.body.removeChild(globalPreview)
    })

    it('should find preview element globally if not in form', () => {
      // Create input without a form
      const standaloneInput = document.createElement('input')
      standaloneInput.type = 'email'
      document.body.appendChild(standaloneInput)

      mockNormaliseEmail.mockReturnValue({
        email: 'test@example.com',
        valid: true,
        changes: [],
        changeCodes: [],
      })

      emailDirective.mounted(standaloneInput, {
        value: { previewSelector: '#email-preview' },
      })

      // Should find and update the global preview element
      expect(previewElement.textContent).toBe('test@example.com')
      expect(previewElement.getAttribute('data-valid')).toBe('true')

      // Cleanup
      document.body.removeChild(standaloneInput)
    })

    it('should warn when preview selector is provided but element not found', () => {
      emailDirective.mounted(input, {
        value: { previewSelector: '#non-existent-element' },
      })

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[v-email] Preview element not found for selector:',
        { previewSelector: '#non-existent-element' }
      )
    })

    it('should not warn when no preview selector is provided', () => {
      emailDirective.mounted(input, {
        value: { autoFormat: true },
      })

      expect(mockConsoleWarn).not.toHaveBeenCalled()
    })
  })

  describe('setPreview function', () => {
    it('should update preview element with email and validity', () => {
      mockNormaliseEmail.mockReturnValue({
        email: 'test@example.com',
        valid: true,
        changes: [],
        changeCodes: [],
      })

      emailDirective.mounted(input, {
        value: { previewSelector: '#email-preview' },
      })

      expect(previewElement.textContent).toBe('test@example.com')
      expect(previewElement.getAttribute('data-valid')).toBe('true')
    })

    it('should handle invalid email in preview', () => {
      mockNormaliseEmail.mockReturnValue({
        email: null,
        valid: false,
        changes: [],
        changeCodes: [],
      })

      emailDirective.mounted(input, {
        value: { previewSelector: '#email-preview' },
      })

      expect(previewElement.textContent).toBe('')
      expect(previewElement.getAttribute('data-valid')).toBe('false')
    })

    it('should not error when preview element is null', () => {
      mockNormaliseEmail.mockReturnValue({
        email: 'test@example.com',
        valid: true,
        changes: [],
        changeCodes: [],
      })

      // Should not throw error
      expect(() => {
        emailDirective.mounted(input, {
          value: { previewSelector: '#non-existent' },
        })
      }).not.toThrow()
    })

    it('should handle undefined preview element gracefully', () => {
      mockNormaliseEmail.mockReturnValue({
        email: 'test@example.com',
        valid: true,
        changes: [],
        changeCodes: [],
      })

      // Test with undefined preview element
      expect(() => {
        emailDirective.mounted(input, {
          value: { previewSelector: undefined },
        })
      }).not.toThrow()
    })
  })

  describe('mounted lifecycle', () => {
    it('should run normalization on initial value', () => {
      input.value = 'Test@Example.Com'

      emailDirective.mounted(input, {
        value: { previewSelector: '#email-preview' },
      })

      expect(mockNormaliseEmail).toHaveBeenCalledWith(
        'Test@Example.Com',
        expect.any(Object)
      )
    })

    it('should run normalization on empty initial value', () => {
      input.value = ''

      emailDirective.mounted(input, {})

      expect(mockNormaliseEmail).toHaveBeenCalledWith('', expect.any(Object))
    })

    it('should add input event listener by default', () => {
      const addEventListenerSpy = vi.spyOn(input, 'addEventListener')

      emailDirective.mounted(input, {})

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'input',
        expect.any(Function)
      )
    })

    it('should add blur event listener by default', () => {
      const addEventListenerSpy = vi.spyOn(input, 'addEventListener')

      emailDirective.mounted(input, {})

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'blur',
        expect.any(Function)
      )
    })

    it('should not add input event listener when autoFormatEvents.onInput is false', () => {
      const addEventListenerSpy = vi.spyOn(input, 'addEventListener')

      emailDirective.mounted(input, {
        value: {
          autoFormatEvents: { onInput: false, onBlur: true },
        },
      })

      const calls = addEventListenerSpy.mock.calls
      const inputEventCall = calls.find((call) => call[0] === 'input')
      expect(inputEventCall).toBeUndefined()
    })

    it('should not add blur event listener when autoFormatEvents.onBlur is false', () => {
      const addEventListenerSpy = vi.spyOn(input, 'addEventListener')

      emailDirective.mounted(input, {
        value: {
          autoFormatEvents: { onInput: true, onBlur: false },
        },
      })

      const calls = addEventListenerSpy.mock.calls
      const blurEventCall = calls.find((call) => call[0] === 'blur')
      expect(blurEventCall).toBeUndefined()
    })

    it('should set up internal state when preview element exists', () => {
      emailDirective.mounted(input, {
        value: { previewSelector: '#email-preview' },
      })

      const inputWithState = input as any
      expect(inputWithState.__email__).toBeDefined()
      expect(inputWithState.__email__.onEvent).toBeInstanceOf(Function)
      expect(inputWithState.__email__.previewEl).toBe(previewElement)
      expect(inputWithState.__email__.opts).toBeDefined()
    })

    it('should not set up internal state when no preview element exists', () => {
      emailDirective.mounted(input, {})

      const inputWithState = input as any
      expect(inputWithState.__email__).toBeUndefined()
    })
  })

  describe('run function (via events)', () => {
    it('should call onnormalised callback when provided and result is invalid', () => {
      const onnormalisedCallback = vi.fn()

      mockNormaliseEmail.mockReturnValue({
        email: null,
        valid: false,
        changes: [],
        changeCodes: [],
      })

      emailDirective.mounted(input, {
        value: {
          onnormalised: onnormalisedCallback,
        },
      })

      expect(onnormalisedCallback).toHaveBeenCalledWith({
        email: null,
        valid: false,
        changes: [],
        changeCodes: [],
      })
    })

    it('should not call onnormalised callback when result is valid', () => {
      const onnormalisedCallback = vi.fn()

      mockNormaliseEmail.mockReturnValue({
        email: 'test@example.com',
        valid: true,
        changes: [],
        changeCodes: [],
      })

      emailDirective.mounted(input, {
        value: {
          onnormalised: onnormalisedCallback,
        },
      })

      expect(onnormalisedCallback).not.toHaveBeenCalled()
    })

    it('should dispatch custom event when result is invalid', () => {
      const eventSpy = vi.fn()
      input.addEventListener('directive:email:normalised', eventSpy)

      mockNormaliseEmail.mockReturnValue({
        email: null,
        valid: false,
        changes: [],
        changeCodes: [],
      })

      emailDirective.mounted(input, {})

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'directive:email:normalised',
          detail: {
            email: null,
            valid: false,
            changes: [],
            changeCodes: [],
          },
        })
      )
    })

    it('should not dispatch custom event when result is valid', () => {
      const eventSpy = vi.fn()
      input.addEventListener('directive:email:normalised', eventSpy)

      mockNormaliseEmail.mockReturnValue({
        email: 'test@example.com',
        valid: true,
        changes: [],
        changeCodes: [],
      })

      emailDirective.mounted(input, {})

      expect(eventSpy).not.toHaveBeenCalled()
    })
  })

  describe('onEvent function (input/blur handling)', () => {
    it('should auto-format input value when autoFormat is true and email changes', () => {
      mockNormaliseEmail.mockReturnValue({
        email: 'test@example.com',
        valid: true,
        changes: [],
        changeCodes: [],
      })

      const inputEventSpy = vi.fn()
      const changeEventSpy = vi.fn()
      input.addEventListener('input', inputEventSpy)
      input.addEventListener('change', changeEventSpy)

      emailDirective.mounted(input, {
        value: { autoFormat: true },
      })

      input.value = 'Test@Example.Com'
      input.dispatchEvent(new Event('input'))

      expect(input.value).toBe('test@example.com')
      expect(inputEventSpy).toHaveBeenCalled()
      expect(changeEventSpy).toHaveBeenCalled()
    })

    it('should not auto-format when autoFormat is false', () => {
      mockNormaliseEmail.mockReturnValue({
        email: 'test@example.com',
        valid: true,
        changes: [],
        changeCodes: [],
      })

      emailDirective.mounted(input, {
        value: { autoFormat: false },
      })

      const originalValue = 'Test@Example.Com'
      input.value = originalValue
      input.dispatchEvent(new Event('input'))

      expect(input.value).toBe(originalValue)
    })

    it('should not auto-format when normalised email is null', () => {
      mockNormaliseEmail.mockReturnValue({
        email: null,
        valid: false,
        changes: [],
        changeCodes: [],
      })

      emailDirective.mounted(input, {
        value: { autoFormat: true },
      })

      const originalValue = 'invalid-email'
      input.value = originalValue
      input.dispatchEvent(new Event('input'))

      expect(input.value).toBe(originalValue)
    })

    it('should not auto-format when raw value equals normalised email', () => {
      mockNormaliseEmail.mockReturnValue({
        email: 'test@example.com',
        valid: true,
        changes: [],
        changeCodes: [],
      })

      emailDirective.mounted(input, {
        value: { autoFormat: true },
      })

      input.value = 'test@example.com'

      // The directive should not auto-format when the value is already normalised
      // We check this by verifying the value doesn't change
      const originalValue = input.value
      input.dispatchEvent(new Event('input'))

      expect(input.value).toBe(originalValue)
    })

    it('should handle blur events correctly', () => {
      mockNormaliseEmail.mockReturnValue({
        email: 'test@example.com',
        valid: true,
        changes: [],
        changeCodes: [],
      })

      emailDirective.mounted(input, {
        value: { autoFormat: true, previewSelector: '#email-preview' },
      })

      input.value = 'Test@Example.Com'
      input.dispatchEvent(new Event('blur'))

      expect(input.value).toBe('test@example.com')
      expect(previewElement.textContent).toBe('test@example.com')
    })

    it('should update preview element during input events', () => {
      mockNormaliseEmail.mockReturnValue({
        email: 'test@example.com',
        valid: true,
        changes: [],
        changeCodes: [],
      })

      emailDirective.mounted(input, {
        value: { previewSelector: '#email-preview' },
      })

      input.value = 'Test@Example.Com'
      input.dispatchEvent(new Event('input'))

      expect(previewElement.textContent).toBe('test@example.com')
      expect(previewElement.getAttribute('data-valid')).toBe('true')
    })
  })

  describe('updated lifecycle', () => {
    it('should return early if __email__ state is not set', () => {
      // Mount without preview element so __email__ is not set
      emailDirective.mounted(input, {})

      // Should not throw error
      expect(() => {
        emailDirective.updated(input, { value: { autoFormat: true } })
      }).not.toThrow()
    })

    it('should update options when directive binding changes', () => {
      // Initial mount with preview element
      emailDirective.mounted(input, {
        value: { previewSelector: '#email-preview', autoFormat: false },
      })

      const inputWithState = input as any
      expect(inputWithState.__email__.opts.autoFormat).toBe(false)

      // Update with new options
      emailDirective.updated(input, {
        value: { previewSelector: '#email-preview', autoFormat: true },
      })

      expect(inputWithState.__email__.opts.autoFormat).toBe(true)
    })

    it('should update preview element reference when selector changes', () => {
      // Create another preview element
      const newPreview = document.createElement('div')
      newPreview.className = 'new-preview'
      container.appendChild(newPreview)

      emailDirective.mounted(input, {
        value: { previewSelector: '#email-preview' },
      })

      const inputWithState = input as any
      expect(inputWithState.__email__.previewEl).toBe(previewElement)

      emailDirective.updated(input, {
        value: { previewSelector: '.new-preview' },
      })

      expect(inputWithState.__email__.previewEl).toBe(newPreview)
    })

    it('should run normalization and update preview on update', () => {
      mockNormaliseEmail.mockReturnValue({
        email: 'updated@example.com',
        valid: true,
        changes: [],
        changeCodes: [],
      })

      emailDirective.mounted(input, {
        value: { previewSelector: '#email-preview' },
      })

      input.value = 'Updated@Example.Com'

      emailDirective.updated(input, {
        value: { previewSelector: '#email-preview' },
      })

      expect(mockNormaliseEmail).toHaveBeenCalledWith(
        'Updated@Example.Com',
        expect.any(Object)
      )
      expect(previewElement.textContent).toBe('updated@example.com')
      expect(previewElement.getAttribute('data-valid')).toBe('true')
    })

    it('should handle empty input value in updated', () => {
      emailDirective.mounted(input, {
        value: { previewSelector: '#email-preview' },
      })

      input.value = ''

      emailDirective.updated(input, {
        value: { previewSelector: '#email-preview' },
      })

      expect(mockNormaliseEmail).toHaveBeenCalledWith('', expect.any(Object))
    })
  })

  describe('beforeUnmount lifecycle', () => {
    it('should return early if __email__ state is not set', () => {
      // Mount without preview element so __email__ is not set
      emailDirective.mounted(input, {})

      // Should not throw error
      expect(() => {
        emailDirective.beforeUnmount(input)
      }).not.toThrow()
    })

    it('should remove event listeners and clean up state', () => {
      const removeEventListenerSpy = vi.spyOn(input, 'removeEventListener')

      emailDirective.mounted(input, {
        value: { previewSelector: '#email-preview' },
      })

      const inputWithState = input as any
      const onEventFunc = inputWithState.__email__.onEvent

      emailDirective.beforeUnmount(input)

      expect(removeEventListenerSpy).toHaveBeenCalledWith('input', onEventFunc)
      expect(removeEventListenerSpy).toHaveBeenCalledWith('blur', onEventFunc)
      expect(inputWithState.__email__).toBeUndefined()
    })

    it('should clean up all internal state properties', () => {
      emailDirective.mounted(input, {
        value: { previewSelector: '#email-preview' },
      })

      const inputWithState = input as any
      expect(inputWithState.__email__).toBeDefined()
      expect(inputWithState.__email__.onEvent).toBeDefined()
      expect(inputWithState.__email__.previewEl).toBeDefined()
      expect(inputWithState.__email__.opts).toBeDefined()

      emailDirective.beforeUnmount(input)

      expect(inputWithState.__email__).toBeUndefined()
    })
  })

  describe('integration scenarios', () => {
    it('should handle complete workflow with all features enabled', async () => {
      const onnormalisedCallback = vi.fn()

      mockNormaliseEmail
        .mockReturnValueOnce({
          email: null,
          valid: false,
          changes: [],
          changeCodes: [],
        })
        .mockReturnValueOnce({
          email: 'test@example.com',
          valid: true,
          changes: [],
          changeCodes: [],
        })

      emailDirective.mounted(input, {
        value: {
          autoFormat: true,
          previewSelector: '#email-preview',
          onnormalised: onnormalisedCallback,
          autoFormatEvents: {
            onInput: true,
            onBlur: true,
          },
        },
      })

      // Initial mount with empty value should call onnormalised
      expect(onnormalisedCallback).toHaveBeenCalledWith({
        email: null,
        valid: false,
        changes: [],
        changeCodes: [],
      })

      onnormalisedCallback.mockClear()

      // Simulate user input
      input.value = 'Test@Example.Com'
      input.dispatchEvent(new Event('input'))

      // Should auto-format and not call onnormalised (because valid)
      expect(input.value).toBe('test@example.com')
      expect(previewElement.textContent).toBe('test@example.com')
      expect(previewElement.getAttribute('data-valid')).toBe('true')
      expect(onnormalisedCallback).not.toHaveBeenCalled()
    })

    it('should handle options merging correctly with custom values', () => {
      const customOptions = {
        autoFormat: true,
        previewSelector: '#email-preview',
        blocklist: {
          block: {
            exact: ['custom-blocked.com'],
            suffix: ['.temp'],
            wildcard: ['*.test'],
            tlds: ['.xyz'],
          },
          allow: { exact: ['allowed.com'] },
        },
        fixDomains: {
          'typo.com': 'fixed.com',
        },
        fixTlds: {
          '.cm': '.com',
        },
        autoFormatEvents: {
          onInput: false,
          onBlur: true,
        },
      }

      let capturedOptions: any = null
      mockNormaliseEmail.mockImplementation((email: string, options: any) => {
        capturedOptions = options
        return {
          email: email,
          valid: true,
          changes: [],
          changeCodes: [],
        }
      })

      emailDirective.mounted(input, { value: customOptions })

      // Verify options are merged correctly - the custom blocklist replaces the default
      expect(capturedOptions.blocklist.block?.exact).toEqual([
        'custom-blocked.com',
      ])
      expect(capturedOptions.fixDomains).toEqual({
        ...DEFAULT_FIX_DOMAINS,
        'typo.com': 'fixed.com',
      })
      expect(capturedOptions.fixTlds).toEqual({
        ...DEFAULT_FIX_TLDS,
        '.cm': '.com',
      })
    })

    it('should handle edge case where preview element changes between mount and update', () => {
      // Create initial preview element
      const initialPreview = document.createElement('div')
      initialPreview.id = 'initial-preview'
      container.appendChild(initialPreview)

      mockNormaliseEmail.mockReturnValue({
        email: 'test@example.com',
        valid: true,
        changes: [],
        changeCodes: [],
      })

      emailDirective.mounted(input, {
        value: { previewSelector: '#initial-preview' },
      })

      expect(initialPreview.textContent).toBe('test@example.com')

      // Create new preview element
      const newPreview = document.createElement('div')
      newPreview.id = 'new-preview'
      container.appendChild(newPreview)

      // Update directive to use new preview
      emailDirective.updated(input, {
        value: { previewSelector: '#new-preview' },
      })

      // New preview should be updated
      expect(newPreview.textContent).toBe('test@example.com')
      expect(newPreview.getAttribute('data-valid')).toBe('true')
    })

    it('should handle scenario where preview element is removed from DOM', () => {
      mockNormaliseEmail.mockReturnValue({
        email: 'test@example.com',
        valid: true,
        changes: [],
        changeCodes: [],
      })

      emailDirective.mounted(input, {
        value: { previewSelector: '#email-preview' },
      })

      // Remove preview element from DOM
      previewElement.remove()

      // Should not throw error when trying to update non-existent preview
      expect(() => {
        input.value = 'new@email.com'
        input.dispatchEvent(new Event('input'))
      }).not.toThrow()
    })

    it('should handle multiple directive instances on different inputs', () => {
      const input2 = document.createElement('input')
      input2.type = 'email'
      const preview2 = document.createElement('div')
      preview2.id = 'preview-2'

      container.appendChild(input2)
      container.appendChild(preview2)

      mockNormaliseEmail
        .mockReturnValueOnce({
          email: 'first@example.com',
          valid: true,
          changes: [],
          changeCodes: [],
        })
        .mockReturnValueOnce({
          email: 'second@example.com',
          valid: true,
          changes: [],
          changeCodes: [],
        })

      // Mount directive on both inputs
      emailDirective.mounted(input, {
        value: { previewSelector: '#email-preview' },
      })

      emailDirective.mounted(input2, {
        value: { previewSelector: '#preview-2' },
      })

      input.value = 'First@Example.Com'
      input2.value = 'Second@Example.Com'

      input.dispatchEvent(new Event('input'))
      input2.dispatchEvent(new Event('input'))

      // Each should update its own preview
      expect(previewElement.textContent).toBe('first@example.com')
      expect(preview2.textContent).toBe('second@example.com')
    })
  })

  describe('error handling', () => {
    it('should handle normaliseEmail throwing an error', () => {
      mockNormaliseEmail.mockImplementation(() => {
        throw new Error('Normalization failed')
      })

      // Should not throw error during mount
      expect(() => {
        emailDirective.mounted(input, {})
      }).toThrow('Normalization failed')
    })

    it('should handle malformed DOM structure gracefully', () => {
      // Create input without proper parent structure
      const orphanInput = document.createElement('input')
      orphanInput.type = 'email'

      mockNormaliseEmail.mockReturnValue({
        email: 'test@example.com',
        valid: true,
        changes: [],
        changeCodes: [],
      })

      // Should not throw error
      expect(() => {
        emailDirective.mounted(orphanInput, {
          value: { previewSelector: '#email-preview' },
        })
      }).not.toThrow()
    })

    it('should handle null/undefined event targets', () => {
      emailDirective.mounted(input, {
        value: { autoFormat: true, previewSelector: '#email-preview' },
      })

      const inputWithState = input as any
      const onEventFunc = inputWithState.__email__.onEvent

      // Create event with null target
      const event = new Event('input')
      Object.defineProperty(event, 'target', { value: null })

      // Should throw error because we're trying to access .value on null
      expect(() => {
        onEventFunc(event)
      }).toThrow()
    })
  })
})
