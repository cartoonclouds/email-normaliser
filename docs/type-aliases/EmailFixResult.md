[**@cartoonclouds/contact-normalisers v0.1.0**](../README.md)

***

# Type Alias: EmailFixResult

> **EmailFixResult** = `object`

Defined in: [utils/email/normaliseEmail.ts:200](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/normaliseEmail.ts#L200)

Result object returned by individual email transformation functions.

Used internally by normalization helper functions to indicate whether
a specific transformation was applied and what the resulting string is.

## Example

```typescript
const result = toAsciiLike('user＠domain．com')
// result = { out: 'user@domain.com', changed: true }
```

## Properties

### changed

> **changed**: `boolean`

Defined in: [utils/email/normaliseEmail.ts:204](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/normaliseEmail.ts#L204)

Whether any changes were made during the transformation

***

### out

> **out**: `string`

Defined in: [utils/email/normaliseEmail.ts:202](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/normaliseEmail.ts#L202)

The transformed email string after applying the fix
