[**@cartoonclouds/email-normaliser v0.1.0**](../README.md)

***

# Type Alias: ValidationResult

> **ValidationResult** = `object`

Defined in: [utils/email/types.ts:43](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L43)

Individual validation result for a specific validation check.

Contains the validation status, the specific validation code that was triggered,
and a human-readable message explaining the validation result. For domain
suggestion validation results, includes the suggested domain correction.

## Example

```typescript
const result: ValidationResult = {
  isValid: false,
  validationCode: EmailValidationCodes.INVALID_FORMAT,
  validationMessage: 'Email is not in a valid format.'
}

const suggestionResult: ValidationResult = {
  isValid: false,
  validationCode: EmailValidationCodes.DOMAIN_SUGGESTION,
  validationMessage: 'Did you mean: user@gmail.com?',
  suggestion: {
    originalDomain: 'gmai.com',
    suggestedDomain: 'gmail.com',
    confidence: 0.89
  }
}
```

## Properties

### isValid

> **isValid**: `boolean`

Defined in: [utils/email/types.ts:45](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L45)

Whether this specific validation check passed

***

### suggestion?

> `optional` **suggestion**: `object`

Defined in: [utils/email/types.ts:51](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L51)

Domain suggestion information (only present for DOMAIN_SUGGESTION validation code)

#### confidence

> **confidence**: `number`

Confidence score for the suggestion (0-1, where 1 is highest confidence)

#### originalDomain

> **originalDomain**: `string`

The original domain from the email

#### suggestedDomain

> **suggestedDomain**: `string`

The suggested corrected domain

***

### validationCode

> **validationCode**: [`EmailValidationCode`](EmailValidationCode.md)

Defined in: [utils/email/types.ts:47](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L47)

The specific validation code that was triggered

***

### validationMessage

> **validationMessage**: `string`

Defined in: [utils/email/types.ts:49](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L49)

Human-readable explanation of the validation result
