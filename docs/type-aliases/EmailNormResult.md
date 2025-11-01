[**@cartoonclouds/contact-normalisers v0.1.0**](../README.md)

***

# Type Alias: EmailNormResult

> **EmailNormResult** = `object`

Defined in: [utils/email/normaliseEmail.ts:27](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/normaliseEmail.ts#L27)

Result of a full email normalisation pass.

Contains the final (possibly corrected) email, whether it’s now valid,
and both human- and machine-readable change trails.

## Example

```ts
const { email, valid, changes, changeCodes }: EmailNormResult =
  normaliseEmail(' JANE.DOÉ @ gmai .com  ');

// email       → "jane.doe@gmail.com"
// valid       → true
// changes     → ["trimmed whitespace", "lowercased", "fixed common domain typo: gmai → gmail", "removed non-ASCII: É → E"]
// changeCodes → ["TRIM", "LOWERCASE", "FIX_DOMAIN_TYPO", "NON_ASCII_REMOVED"]
```

## Properties

### changeCodes

> **changeCodes**: [`EmailChangeCode`](EmailChangeCode.md)[]

Defined in: [utils/email/normaliseEmail.ts:35](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/normaliseEmail.ts#L35)

Machine-readable codes for all changes made during normalization

***

### changes

> **changes**: `string`[]

Defined in: [utils/email/normaliseEmail.ts:33](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/normaliseEmail.ts#L33)

Human-readable descriptions of all changes made during normalization

***

### email

> **email**: `string` \| `null`

Defined in: [utils/email/normaliseEmail.ts:29](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/normaliseEmail.ts#L29)

The normalized email address, or null if normalization failed

***

### valid

> **valid**: `boolean`

Defined in: [utils/email/normaliseEmail.ts:31](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/normaliseEmail.ts#L31)

Whether the final normalized email passes validation
