[**@cartoonclouds/email-normaliser v0.1.0**](../README.md)

***

# Type Alias: EmailNormResult

> **EmailNormResult** = `object`

Defined in: [utils/email/types.ts:248](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L248)

The result of email normalization containing the processed email and metadata.

## Example

```typescript
const result = normaliseEmail('  User+tag@GMaÍl.com  ');
// result.email → 'user@gmail.com'
// result.valid → true
// result.changes → ["trimmed whitespace", "lowercased", "fixed common domain typo: gmai → gmail", "removed non-ASCII: É → E"]
// result.changeCodes → ["TRIM", "LOWERCASE", "FIX_DOMAIN_TYPO", "NON_ASCII_REMOVED"]
```

## Properties

### changeCodes

> **changeCodes**: [`EmailChangeCode`](EmailChangeCode.md)[]

Defined in: [utils/email/types.ts:256](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L256)

Machine-readable codes for all changes made during normalization

***

### changes

> **changes**: `string`[]

Defined in: [utils/email/types.ts:254](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L254)

Human-readable descriptions of all changes made during normalization

***

### email

> **email**: `string` \| `null`

Defined in: [utils/email/types.ts:250](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L250)

The normalized email address, or null if normalization failed

***

### valid

> **valid**: `boolean`

Defined in: [utils/email/types.ts:252](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L252)

Whether the final normalized email passes validation
