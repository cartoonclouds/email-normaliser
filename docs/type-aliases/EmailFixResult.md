[**@cartoonclouds/email-normaliser v1.0.0**](../README.md)

***

# Type Alias: EmailFixResult

> **EmailFixResult** = `object`

Defined in: [utils/email/types.ts:367](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/email-normaliser/src/utils/email/types.ts#L367)

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

Defined in: [utils/email/types.ts:371](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/email-normaliser/src/utils/email/types.ts#L371)

Whether any changes were made during the transformation

***

### out

> **out**: `string`

Defined in: [utils/email/types.ts:369](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/email-normaliser/src/utils/email/types.ts#L369)

The transformed email string after applying the fix
