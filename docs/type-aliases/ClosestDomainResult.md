[**@cartoonclouds/email-normaliser v0.1.0**](../README.md)

***

# Type Alias: ClosestDomainResult

> **ClosestDomainResult** = `object`

Defined in: [utils/email/types.ts:391](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L391)

Result of finding the closest domain match using fuzzy matching.

## Example

```typescript
const result: ClosestDomainResult = {
  input: 'gmai.com',
  candidate: 'gmail.com',
  distance: 1,
  normalizedScore: 0.89,
  index: 0
}
```

## Properties

### candidate

> **candidate**: `string` \| `null`

Defined in: [utils/email/types.ts:395](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L395)

The best matching candidate domain, or null if no suitable match found

***

### distance

> **distance**: `number`

Defined in: [utils/email/types.ts:397](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L397)

Edit distance to the best candidate (0 = exact match)

***

### index

> **index**: `number`

Defined in: [utils/email/types.ts:401](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L401)

Index of the candidate in the candidates array (-1 if no match)

***

### input

> **input**: `string`

Defined in: [utils/email/types.ts:393](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L393)

The input domain that was matched against

***

### normalizedScore

> **normalizedScore**: `number`

Defined in: [utils/email/types.ts:399](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L399)

Normalized similarity score (0-1, where 1 = exact match)
