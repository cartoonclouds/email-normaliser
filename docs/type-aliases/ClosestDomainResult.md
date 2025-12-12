[**@cartoonclouds/email-normaliser v1.0.0**](../README.md)

***

# Type Alias: ClosestDomainResult

> **ClosestDomainResult** = `object`

Defined in: [utils/email/types.ts:397](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/email-normaliser/src/utils/email/types.ts#L397)

Result of finding the closest domain match using fuzzy matching.

## Example

```typescript
const result: ClosestDomainResult = {
  input: 'gmai.com',
  candidate: 'gmail.com',
  distance: 1,
  normalisedScore: 0.89,
  index: 0
}
```

## Properties

### candidate

> **candidate**: `string` \| `null`

Defined in: [utils/email/types.ts:401](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/email-normaliser/src/utils/email/types.ts#L401)

The best matching candidate domain, or null if no suitable match found

***

### distance

> **distance**: `number`

Defined in: [utils/email/types.ts:403](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/email-normaliser/src/utils/email/types.ts#L403)

Edit distance to the best candidate (0 = exact match)

***

### index

> **index**: `number`

Defined in: [utils/email/types.ts:407](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/email-normaliser/src/utils/email/types.ts#L407)

Index of the candidate in the candidates array (-1 if no match)

***

### input

> **input**: `string`

Defined in: [utils/email/types.ts:399](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/email-normaliser/src/utils/email/types.ts#L399)

The input domain that was matched against

***

### normalisedScore

> **normalisedScore**: `number`

Defined in: [utils/email/types.ts:405](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/email-normaliser/src/utils/email/types.ts#L405)

normalised similarity score (0-1, where 1 = exact match)
