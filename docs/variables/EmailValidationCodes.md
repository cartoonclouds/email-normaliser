[**@cartoonclouds/email-normaliser v0.1.0**](../README.md)

***

# Variable: EmailValidationCodes

> `const` **EmailValidationCodes**: `Readonly`\<\{ `BLOCKLISTED`: `"BLOCKLISTED"`; `DOMAIN_SUGGESTION`: `"DOMAIN_SUGGESTION"`; `EMPTY`: `"EMPTY"`; `INVALID_DOMAIN`: `"INVALID_DOMAIN"`; `INVALID_FORMAT`: `"INVALID_FORMAT"`; `INVALID_TLD`: `"INVALID_TLD"`; `NON_ASCII_CHARACTERS`: `"NON_ASCII_CHARACTERS"`; `VALID`: `"VALID"`; \}\>

Defined in: [utils/email/constants.ts:267](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/constants.ts#L267)

Enumeration of all possible email validation result codes.

These codes represent the different validation states an email address
can have during the validation process. Each code corresponds to a
specific validation check.

## Example

```typescript
const results = validateEmail('user@invalid-domain')
// results[0].validationCode might be EmailValidationCodes.INVALID_DOMAIN
```
