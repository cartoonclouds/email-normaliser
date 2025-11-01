[**@cartoonclouds/contact-normalisers v0.1.0**](../README.md)

***

# Function: validateEmail()

> **validateEmail**(`email`, `options`): [`ValidationResults`](../type-aliases/ValidationResults.md)

Defined in: [utils/email/validateEmail.ts:427](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/validateEmail.ts#L427)

Validate an email address and return validation results.

Performs comprehensive validation including:
- Format validation (basic email structure)
- Domain validation (common typos and corrections)
- TLD validation (top-level domain corrections)
- Blocklist checking (known bad domains)
- ASCII-only validation (when enabled)

## Parameters

### email

`string`

The email address to validate

### options

[`EmailValidationOptions`](../type-aliases/EmailValidationOptions.md) = `{}`

Optional validation configuration

## Returns

[`ValidationResults`](../type-aliases/ValidationResults.md)

## Example

```typescript
const results = validateEmail('user@example.com')
// Basic validation with defaults

const customResults = validateEmail('user@typo.co', {
  fixTlds: { '.co': '.com' },
  asciiOnly: true
})
// Custom validation with TLD correction and ASCII-only
```
