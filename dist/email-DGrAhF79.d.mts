import { a as EmailNormOptions } from "./types-BsQSkf80.mjs";
import { n as normaliseEmail } from "./normaliseEmail-w2x_yXn5.mjs";

//#region src/directives/email.d.ts

/**
 * Email directive configurations
 *
 * Usage:
 * <input v-email="{ autoFormat: true, previewSelector: '#emailPreview' }" />
 * <input v-email="{ onnormalised: (result) => console.log(result) }" />
 */
type EmailOpts = EmailNormOptions & {
  /**
   * Automatically format the email input value on input/blur events
   *
   * @default false
   */
  autoFormat?: boolean;
  /**
   * Auto format events to listen to.
   *
   * @default { onInput: true, onBlur: true }
   */
  autoFormatEvents?: {
    onInput?: boolean;
    onBlur?: boolean;
  };
  /**
   * CSS selector for an element to preview the normalised email and its validity
   */
  previewSelector?: string;
  /**
   * Callback function called when the email is normalised
   *
   * @param {ReturnType<typeof normaliseEmail>} r The result of the normalization
   * @returns void
   */
  onnormalised?: (r: ReturnType<typeof normaliseEmail>) => void;
};
/**
 * Vue directive for normalizing and validating email inputs.
 *
 * Usage:
 * <input v-email="{ autoFormat: true, previewSelector: '#emailPreview' }" />
 * <input v-email="{ onnormalised: (result) => console.log(result) }" />
 *
 * The directive emits a 'directive:email:normalised' event when email normalization is complete.
 *
 * @param {HTMLInputElement} el The element the directive is bound to
 * @param {DirectiveBinding<EmailOpts>} binding The directive binding
 * @returns {void}
 */
declare const _default: {
  mounted(el: HTMLInputElement, binding: {
    value?: EmailOpts;
  }): void;
  /**
   * Runs the normalisation process and updates the email directive's options and preview element.
   *
   * @param {HTMLInputElement} el The element the directive is bound to
   * @param {DirectiveBinding<EmailOpts>} binding The directive binding
   * @returns {void}
   */
  updated(el: HTMLInputElement, binding: {
    value?: EmailOpts;
  }): void;
  /**
   * Cleans up event listeners and state when the directive is unbound.
   *
   * @param {HTMLInputElement} el The element the directive is bound to
   * @returns {void}
   */
  beforeUnmount(el: HTMLInputElement): void;
};
//#endregion
export { _default as n, EmailOpts as t };
//# sourceMappingURL=email-DGrAhF79.d.mts.map