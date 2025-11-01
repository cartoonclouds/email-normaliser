[**@cartoonclouds/contact-normalisers v0.1.0**](../README.md)

***

# Type Alias: EmailFixResult

> **EmailFixResult** = `object`

Defined in: [utils/email/normaliseEmail.ts:212](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/normaliseEmail.ts#L212)

Result object returned by individual email transformation functions.

Used internally by normalization helper functions to indicate whether
a specific transformation was applied and what the resulting string is.

## Example

```typescript
const result: EmailFixResult = toAsciiLike('ｊｏｈｎ＠ｅｘａｍｐｌｅ．ｃｏｍ');
// result.out    → "john@example.com"
// result.changed → true
```

## Properties

### changed

> **changed**: `boolean`

Defined in: [utils/email/normaliseEmail.ts:216](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/normaliseEmail.ts#L216)

Whether any changes were made during the transformation

***

### out

> **out**: `string`

Defined in: [utils/email/normaliseEmail.ts:214](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/normaliseEmail.ts#L214)

The transformed email string after applying the fix
