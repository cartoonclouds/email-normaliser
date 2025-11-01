// Removed Vue type imports to avoid type conflicts between different Vue installations
import {
  DEFAULT_BLOCKLIST,
  DEFAULT_FIX_DOMAINS,
  DEFAULT_FIX_TLDS,
} from '../utils/email/constants'
import { normaliseEmail } from '../utils/email/normaliseEmail'
import type { EmailNormOptions } from '../utils/email/types'

/**
 * Email directive configurations
 *
 * Usage:
 * <input v-email="{ autoFormat: true, previewSelector: '#emailPreview' }" />
 * <input v-email="{ onNormalized: (result) => console.log(result) }" />
 */
export type EmailOpts = EmailNormOptions & {
  /**
   * Automatically format the email input value on input/blur events
   *
   * @default false
   */
  autoFormat?: boolean
  /**
   * Auto format events to listen to.
   *
   * @default { onInput: true, onBlur: true }
   */
  autoFormatEvents?: {
    onInput?: boolean
    onBlur?: boolean
  }
  /**
   * CSS selector for an element to preview the normalized email and its validity
   */
  previewSelector?: string
  /**
   * Callback function called when the email is normalized
   *
   * @param {ReturnType<typeof normaliseEmail>} r The result of the normalization
   * @returns void
   */
  onNormalized?: (r: ReturnType<typeof normaliseEmail>) => void
}

/**
 * An internal type for input elements with email directive state.
 * Must be an element that has a 'value' property (e.g., HTMLHTMLInputElement, HTMLTextAreaElement).
 */
type ElWithState = HTMLInputElement & {
  __email__?: {
    onEvent: (e: Event) => void
    previewEl?: HTMLElement | null
    opts: EmailOpts
  }
}

/**
 * The resolved options and preview element for the email directive.
 */
type ResolvedOpts = {
  opts: EmailOpts
  previewEl: HTMLElement | null | undefined
  previewSelector?: string
}

/**
 * Resolve the email directive options and preview element.
 *
 * @param {{value?: EmailOpts}} binding The directive binding
 * @param {ElWithState} el The element the directive is bound to
 * @returns {ResolvedOpts} The resolved options and preview element
 */
function resolve(
  binding: { value?: EmailOpts },
  el: ElWithState
): ResolvedOpts {
  const value = binding.value || {}

  const opts: EmailOpts = {
    autoFormat: !!value.autoFormat,
    previewSelector: value.previewSelector,
    onNormalized: value.onNormalized,
    blocklist: { ...DEFAULT_BLOCKLIST, ...(value.blocklist || {}) },
    fixDomains: { ...DEFAULT_FIX_DOMAINS, ...(value.fixDomains || {}) },
    fixTlds: { ...DEFAULT_FIX_TLDS, ...(value.fixTlds || {}) },
    autoFormatEvents: {
      onInput: value.autoFormatEvents?.onInput ?? true,
      onBlur: value.autoFormatEvents?.onBlur ?? true,
    },
  }

  const previewEl: HTMLElement | null = value.previewSelector
    ? (el.closest('form')?.querySelector(value.previewSelector) ??
      document.querySelector(value.previewSelector))
    : null

  return {
    opts,
    previewEl,
  }
}

/**
 * Set the email preview element's content and validity state.
 *
 * @param {HTMLElement | null | undefined} target The element to update
 * @param {string | null} email The normalized email address
 * @param {boolean} valid Whether the email is valid
 * @returns {void}
 */
function setPreview(
  target: HTMLElement | null | undefined,
  email: string | null,
  valid: boolean
) {
  if (!target) {
    return
  }

  target.textContent = email
  target.setAttribute('data-valid', String(valid))
}

/**
 * Vue directive for normalizing and validating email inputs.
 *
 * Usage:
 * <input v-email="{ autoFormat: true, previewSelector: '#emailPreview' }" />
 * <input v-email="{ onNormalized: (result) => console.log(result) }" />
 *
 * The directive emits a 'directive:email:normalized' event when email normalization is complete.
 *
 * @param {HTMLInputElement} el The element the directive is bound to
 * @param {DirectiveBinding<EmailOpts>} binding The directive binding
 * @returns {void}
 */
export default {
  mounted(el: HTMLInputElement, binding: { value?: EmailOpts }) {
    const input = el as ElWithState
    const { opts, previewEl } = resolve(binding, input)

    if (!previewEl && Boolean(binding?.value?.previewSelector)) {
      console.warn('[v-email] Preview element not found for selector:', {
        previewSelector: binding.value?.previewSelector,
      })
    }

    const run = (raw: string) => {
      const r = normaliseEmail(raw, opts)

      if (previewEl) {
        setPreview(previewEl, r.email, r.valid)
      }

      if (r.valid) {
        return r
      }

      input.dispatchEvent(
        new CustomEvent('directive:email:normalized', { detail: r })
      )
      opts.onNormalized?.(r)

      return r
    }

    const onEvent = (e: Event) => {
      const raw = (e.target as HTMLInputElement).value
      const r = run(raw)

      if (opts.autoFormat && r.email && raw !== r.email) {
        input.value = r.email
        input.dispatchEvent(new Event('input', { bubbles: true }))
        input.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }

    // initial
    run(input.value || '')

    const formatOnInput = opts.autoFormatEvents?.onInput ?? true
    if (formatOnInput) {
      input.addEventListener('input', onEvent)
    }

    const formatOnBlur = opts.autoFormatEvents?.onBlur ?? true
    if (formatOnBlur) {
      input.addEventListener('blur', onEvent)
    }

    if (previewEl instanceof HTMLElement) {
      input.__email__ = {
        onEvent,
        previewEl,
        opts,
      }
    }
  },

  /**
   * Runs the normalisation process and updates the email directive's options and preview element.
   *
   * @param {HTMLInputElement} el The element the directive is bound to
   * @param {DirectiveBinding<EmailOpts>} binding The directive binding
   * @returns {void}
   */
  updated(el: HTMLInputElement, binding: { value?: EmailOpts }) {
    const input = el as ElWithState

    if (!input.__email__) {
      return
    }

    const { opts, previewEl } = resolve(binding, input)
    input.__email__.opts = opts

    if (previewEl instanceof HTMLElement) {
      input.__email__.previewEl = previewEl
    }

    const r = normaliseEmail(input.value || '', opts)

    setPreview(previewEl, r.email, r.valid)
  },

  /**
   * Cleans up event listeners and state when the directive is unbound.
   *
   * @param {HTMLInputElement} el The element the directive is bound to
   * @returns {void}
   */
  beforeUnmount(el: HTMLInputElement) {
    const input = el as ElWithState

    if (!input.__email__) {
      return
    }

    input.removeEventListener('input', input.__email__.onEvent)
    input.removeEventListener('blur', input.__email__.onEvent)

    delete input.__email__
  },
}
