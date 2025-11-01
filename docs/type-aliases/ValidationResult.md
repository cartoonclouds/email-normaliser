[**@cartoonclouds/contact-normalisers v0.1.0**](../README.md)

***

# Type Alias: ValidationResult

> **ValidationResult** = `object`

Defined in: [utils/email/validateEmail.ts:64](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/validateEmail.ts#L64)

Individual validation result for a specific validation check.

Contains the validation status, the specific validation code that was triggered,
and a human-readable message explaining the validation result.

## Example

```typescript
const result: ValidationResult = {
  isValid: false,
  validationCode: EmailValidationCodes.INVALID_FORMAT,
  validationMessage: 'Email is not in a valid format.'
}
```

## Properties

### isValid

> **isValid**: `boolean`

Defined in: [utils/email/validateEmail.ts:66](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/validateEmail.ts#L66)

Whether this specific validation check passed

***

### validationCode

> **validationCode**: [`EmailValidationCode`](EmailValidationCode.md)

Defined in: [utils/email/validateEmail.ts:68](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/validateEmail.ts#L68)

The specific validation code that was triggered

***

### validationMessage

> **validationMessage**: `string`

Defined in: [utils/email/validateEmail.ts:70](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/validateEmail.ts#L70)

Human-readable explanation of the validation result
