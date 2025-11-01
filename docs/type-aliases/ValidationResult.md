[**@cartoonclouds/contact-normalisers v0.1.0**](../README.md)

***

# Type Alias: ValidationResult

> **ValidationResult** = `object`

Defined in: [utils/email/validateEmail.ts:71](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/validateEmail.ts#L71)

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

Defined in: [utils/email/validateEmail.ts:73](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/validateEmail.ts#L73)

Whether this specific validation check passed

***

### validationCode

> **validationCode**: [`EmailValidationCode`](EmailValidationCode.md)

Defined in: [utils/email/validateEmail.ts:75](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/validateEmail.ts#L75)

The specific validation code that was triggered

***

### validationMessage

> **validationMessage**: `string`

Defined in: [utils/email/validateEmail.ts:77](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/validateEmail.ts#L77)

Human-readable explanation of the validation result
