import { a as DEFAULT_FIX_TLDS, i as DEFAULT_FIX_DOMAINS, r as DEFAULT_BLOCKLIST } from "./fuzzyDomainMatching-CT2IH0-D.mjs";
import { n as normaliseEmail } from "./normaliseEmail-4uU19QOQ.mjs";

//#region src/directives/email.ts
/**
* Resolve the email directive options and preview element.
*
* @param {{value?: EmailOpts}} binding The directive binding
* @param {ElWithState} el The element the directive is bound to
* @returns {ResolvedOpts} The resolved options and preview element
*/
function resolve(binding, el) {
	const value = binding.value || {};
	return {
		opts: {
			autoFormat: !!value.autoFormat,
			previewSelector: value.previewSelector,
			onnormalised: value.onnormalised,
			blocklist: {
				...DEFAULT_BLOCKLIST,
				...value.blocklist || {}
			},
			fixDomains: {
				...DEFAULT_FIX_DOMAINS,
				...value.fixDomains || {}
			},
			fixTlds: {
				...DEFAULT_FIX_TLDS,
				...value.fixTlds || {}
			},
			autoFormatEvents: {
				onInput: value.autoFormatEvents?.onInput ?? true,
				onBlur: value.autoFormatEvents?.onBlur ?? true
			}
		},
		previewEl: value.previewSelector ? el.closest("form")?.querySelector(value.previewSelector) ?? document.querySelector(value.previewSelector) : null
	};
}
/**
* Set the email preview element's content and validity state.
*
* @param {HTMLElement | null | undefined} target The element to update
* @param {string | null} email The normalised email address
* @param {boolean} valid Whether the email is valid
* @returns {void}
*/
function setPreview(target, email, valid) {
	if (!target) return;
	target.textContent = email;
	target.setAttribute("data-valid", String(valid));
}
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
var email_default = {
	mounted(el, binding) {
		const input = el;
		const { opts, previewEl } = resolve(binding, input);
		if (!previewEl && Boolean(binding?.value?.previewSelector)) console.warn("[v-email] Preview element not found for selector:", { previewSelector: binding.value?.previewSelector });
		const run = (raw) => {
			const r = normaliseEmail(raw, opts);
			if (previewEl) setPreview(previewEl, r.email, r.valid);
			if (r.valid) return r;
			input.dispatchEvent(new CustomEvent("directive:email:normalised", { detail: r }));
			opts.onnormalised?.(r);
			return r;
		};
		const onEvent = (e) => {
			const raw = e.target.value;
			const r = run(raw);
			if (opts.autoFormat && r.email && raw !== r.email) {
				input.value = r.email;
				input.dispatchEvent(new Event("input", { bubbles: true }));
				input.dispatchEvent(new Event("change", { bubbles: true }));
			}
		};
		run(input.value || "");
		if (opts.autoFormatEvents?.onInput ?? true) input.addEventListener("input", onEvent);
		if (opts.autoFormatEvents?.onBlur ?? true) input.addEventListener("blur", onEvent);
		if (previewEl instanceof HTMLElement) input.__email__ = {
			onEvent,
			previewEl,
			opts
		};
	},
	updated(el, binding) {
		const input = el;
		if (!input.__email__) return;
		const { opts, previewEl } = resolve(binding, input);
		input.__email__.opts = opts;
		if (previewEl instanceof HTMLElement) input.__email__.previewEl = previewEl;
		const r = normaliseEmail(input.value || "", opts);
		setPreview(previewEl, r.email, r.valid);
	},
	beforeUnmount(el) {
		const input = el;
		if (!input.__email__) return;
		input.removeEventListener("input", input.__email__.onEvent);
		input.removeEventListener("blur", input.__email__.onEvent);
		delete input.__email__;
	}
};

//#endregion
export { email_default as t };
//# sourceMappingURL=email-F8vbBLtR.mjs.map