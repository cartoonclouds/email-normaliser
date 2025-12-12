const require_normaliseEmail = require('./normaliseEmail-gYqVFJ9w.cjs');
let vue = require("vue");

//#region src/composables/useEmail.ts
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
function useEmail(initial = "", opts = {}) {
	opts.autoFormat = opts.autoFormat ?? false;
	const isValid = (0, vue.ref)(true);
	const value = (0, vue.ref)(initial);
	const result = (0, vue.computed)(() => require_normaliseEmail.normaliseEmail(value.value, opts));
	const email = (0, vue.computed)(() => result.value.email);
	const valid = (0, vue.computed)(() => isValid.value && result.value.valid);
	const changes = (0, vue.computed)(() => result.value.changes);
	/**
	* Apply the normalised email to the input value.
	* Updates the input value with the normalised email if they differ.
	*/
	function apply() {
		if (email.value && value.value !== email.value) value.value = email.value;
	}
	/**
	* Manually trigger validation of the current email value.
	*
	* @returns {boolean} True if the email is valid (no changes needed), false otherwise
	*/
	function validate() {
		isValid.value = require_normaliseEmail.normaliseEmail(value.value, opts).changes.length === 0;
		return isValid.value;
	}
	(0, vue.watch)(result, (nv) => {
		isValid.value = validate() && nv.valid;
	});
	(0, vue.watch)(value, (nv) => {
		if (opts.autoFormat && email.value && nv !== email.value) value.value = email.value;
	});
	return {
		value,
		email,
		valid,
		changes,
		apply,
		validate
	};
}

//#endregion
Object.defineProperty(exports, 'useEmail', {
  enumerable: true,
  get: function () {
    return useEmail;
  }
});
//# sourceMappingURL=useEmail-Dd6gGpZN.cjs.map