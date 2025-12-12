[**@cartoonclouds/email-normaliser v1.0.0**](../README.md)

***

# Type Alias: EmailChangeCode

> **EmailChangeCode** = *typeof* [`EmailChangeCodes`](../variables/EmailChangeCodes.md)\[keyof *typeof* [`EmailChangeCodes`](../variables/EmailChangeCodes.md)\]

Defined in: [utils/email/constants.ts:422](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/email-normaliser/src/utils/email/constants.ts#L422)

Machine-readable code for a single normalization change.

This is the union of the values from `EmailChangeCodes`. Use it to build
analytics, filtering, or to toggle UI badges without stringly-typed checks.

## Example

```ts
function hasAsciiFix(r: EmailNormResult) {
  return r.changeCodes.includes(EmailChangeCodes.CONVERTED_TO_ASCII as EmailChangeCode);
}
```
