[**@cartoonclouds/email-normaliser v0.1.0**](../README.md)

***

# Type Alias: EmailFixResult

> **EmailFixResult** = `object`

Defined in: [utils/email/types.ts:361](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L361)

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

Defined in: [utils/email/types.ts:365](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L365)

Whether any changes were made during the transformation

***

### out

> **out**: `string`

Defined in: [utils/email/types.ts:363](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L363)

The transformed email string after applying the fix
