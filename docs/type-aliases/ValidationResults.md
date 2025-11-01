[**@cartoonclouds/contact-normalisers v0.1.0**](../README.md)

***

# Type Alias: ValidationResults

> **ValidationResults** = [`ValidationResult`](ValidationResult.md)[]

Defined in: [utils/email/validateEmail.ts:90](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/validateEmail.ts#L90)

Array of validation results from all validation checks performed on an email address.

If the email is valid, this will contain a single ValidationResult with isValid: true.
If the email is invalid, this will contain one or more ValidationResult objects
describing each validation failure.

## Example

```typescript
const results: ValidationResults = validateEmail('invalid@')
// results = [{
//   isValid: false,
//   validationCode: 'INVALID_FORMAT',
//   validationMessage: 'Email is not in a valid format.'
// }]
```
