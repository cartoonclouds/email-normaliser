import { n as normaliseEmail } from "./normaliseEmail-4uU19QOQ.mjs";
import { computed, ref, watch } from "vue";

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
	const isValid = ref(true);
	const value = ref(initial);
	const result = computed(() => normaliseEmail(value.value, opts));
	const email = computed(() => result.value.email);
	const valid = computed(() => isValid.value && result.value.valid);
	const changes = computed(() => result.value.changes);
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
		isValid.value = normaliseEmail(value.value, opts).changes.length === 0;
		return isValid.value;
	}
	watch(result, (nv) => {
		isValid.value = validate() && nv.valid;
	});
	watch(value, (nv) => {
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
export { useEmail as t };
//# sourceMappingURL=useEmail-L7H58L8R.mjs.map