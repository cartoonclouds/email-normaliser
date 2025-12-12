import { l as UseEmailOptions } from "./types-uAdst7_0.cjs";
import * as vue0 from "vue";

//#region src/composables/useEmail.d.ts

/**
 * Vue composable for email normalization and validation.
 *
 * Provides reactive email processing with automatic normalization, validation,
 * and optional auto-formatting. Returns reactive references and helper functions
 * to manage email input state.
 *
 * @param {string} initial - Initial email value (default: '')
 * @param {UseEmailOptions} opts - Configuration options
 * @returns {object} Email composable interface
 * @returns {Ref<string>} returns.value - Reactive email input value
 * @returns {ComputedRef<string | null>} returns.email - normalised email address
 * @returns {ComputedRef<boolean>} returns.valid - Whether the email is valid
 * @returns {ComputedRef<string[]>} returns.changes - List of changes made during normalization
 * @returns {ComputedRef<EmailNormResult>} returns.result - Full normalization result
 * @returns {Function} returns.apply - Apply normalised email to the input value
 * @returns {Function} returns.validate - Manually trigger validation
 */
declare function useEmail(initial?: string, opts?: UseEmailOptions): {
  value: vue0.Ref<string, string>;
  email: vue0.ComputedRef<string | null>;
  valid: vue0.ComputedRef<boolean>;
  changes: vue0.ComputedRef<string[]>;
  apply: () => void;
  validate: () => boolean;
};
//#endregion
export { useEmail as t };
//# sourceMappingURL=useEmail-cK9vpiKo.d.cts.map