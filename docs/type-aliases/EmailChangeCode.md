[**@cartoonclouds/contact-normalisers v0.1.0**](../README.md)

***

# Type Alias: EmailChangeCode

> **EmailChangeCode** = *typeof* [`EmailChangeCodes`](../variables/EmailChangeCodes.md)\[keyof *typeof* [`EmailChangeCodes`](../variables/EmailChangeCodes.md)\]

Defined in: [utils/email/normaliseEmail.ts:88](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/normaliseEmail.ts#L88)

Machine-readable code for a single normalization change.

This is the union of the values from `EmailChangeCodes`. Use it to build
analytics, filtering, or to toggle UI badges without stringly-typed checks.

## Example

```ts
function hasAsciiFix(r: EmailNormResult) {
  return r.changeCodes.includes(EmailChangeCodes.NON_ASCII_REMOVED as EmailChangeCode);
}
```
