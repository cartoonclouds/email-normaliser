[**@cartoonclouds/email-normaliser v0.1.0**](../README.md)

***

# Type Alias: EmailValidationCode

> **EmailValidationCode** = *typeof* [`EmailValidationCodes`](../variables/EmailValidationCodes.md)\[keyof *typeof* [`EmailValidationCodes`](../variables/EmailValidationCodes.md)\]

Defined in: [utils/email/constants.ts:299](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/constants.ts#L299)

Type representing any valid email validation code from the EmailValidationCodes enumeration.

This is a union type of all possible validation code values that can be returned
during email validation.

## Example

```ts
function isFormatError(code: EmailValidationCode) {
  return code === EmailValidationCodes.INVALID_FORMAT;
}
```
