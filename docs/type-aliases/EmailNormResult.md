[**@cartoonclouds/contact-normalisers v0.1.0**](../README.md)

***

# Type Alias: EmailNormResult

> **EmailNormResult** = `object`

Defined in: [utils/email/normaliseEmail.ts:27](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/normaliseEmail.ts#L27)

Result object returned by the email normalization process.

Contains the normalized email address, validation status, and detailed
information about all transformations that were applied during processing.

## Example

```typescript
const result = normaliseEmail('User@GMAIL.CO')
// result = {
//   email: 'User@gmail.com',
//   valid: true,
//   changes: ['Corrected common domain or TLD typos', 'Lowercased domain part'],
//   changeCodes: ['fixed_domain_and_tld_typos', 'lowercased_domain']
// }
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
