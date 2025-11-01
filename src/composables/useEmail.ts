import { computed, ref, watch } from 'vue'

import { normaliseEmail } from '../utils/email/normaliseEmail'
import type { EmailNormResult, UseEmailOptions } from '../utils/email/types'

/**
 * Vue composable for email normalization and validation.
 *
 * Provides reactive email processing with automatic normalization, validation,
 * and optional auto-formatting. Returns reactive references and helper functions
 * to manage email input state.
 *
 * @param {string} initial - Initial email value (default: '')
 * @param {UseEmailOptions} opts - Configuration options
 * @param {boolean} opts.autoFormat - Automatically format email on value change (default: false)
 * @param {EmailBlockConfig} opts.blocklist - Custom email blocklist configuration
 * @param {Record<string, string>} opts.fixDomains - Custom domain typo corrections
 * @param {Record<string, string>} opts.fixTlds - Custom TLD typo corrections
 * @returns {object} Email composable interface
 * @returns {Ref<string>} returns.value - Reactive email input value
 * @returns {ComputedRef<string | null>} returns.email - Normalized email address
 * @returns {ComputedRef<boolean>} returns.valid - Whether the email is valid
 * @returns {ComputedRef<string[]>} returns.changes - List of changes made during normalization
 * @returns {ComputedRef<EmailNormResult>} returns.result - Full normalization result
 * @returns {Function} returns.apply - Apply normalized email to the input value
 * @returns {Function} returns.validate - Manually trigger validation
 */
export function useEmail(initial = '', opts: UseEmailOptions = {}) {
  opts.autoFormat = opts.autoFormat ?? false

  // Internal track of validity
  const isValid = ref(true)

  const value = ref<string>(initial)
  const result = computed<EmailNormResult>(() =>
    normaliseEmail(value.value, opts)
  )
  const email = computed(() => result.value.email)
  const valid = computed(() => isValid.value && result.value.valid)
  const changes = computed(() => result.value.changes)

  /**
   * Apply the normalized email to the input value.
   * Updates the input value with the normalized email if they differ.
   */
  function apply() {
    if (email.value && value.value !== email.value) {
      value.value = email.value
    }
  }

  /**
   * Manually trigger validation of the current email value.
   *
   * @returns {boolean} True if the email is valid (no changes needed), false otherwise
   */
  function validate(): boolean {
    isValid.value = normaliseEmail(value.value, opts).changes.length === 0

    return isValid.value
  }

  watch(result, (nv) => {
    isValid.value = validate() && nv.valid
  })

  watch(value, (nv) => {
    if (opts.autoFormat && email.value && nv !== email.value) {
      value.value = email.value
    }
  })

  return {
    value,
    email,
    valid,
    changes,
    apply,
    validate,
  }
}
