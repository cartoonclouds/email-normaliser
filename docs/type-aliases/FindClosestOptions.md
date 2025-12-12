[**@cartoonclouds/email-normaliser v1.0.0**](../README.md)

***

# Type Alias: FindClosestOptions

> **FindClosestOptions** = `object`

Defined in: [utils/email/types.ts:424](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/email-normaliser/src/utils/email/types.ts#L424)

Options for fuzzy domain matching.

## Example

```typescript
const options: FindClosestOptions = {
  candidates: ['gmail.com', 'googlemail.com'],
  maxDistance: 2,
  normalise: true
}

const result = findClosestDomain('gmai.com', options);
```

## Properties

### candidates?

> `optional` **candidates**: `string`[]

Defined in: [utils/email/types.ts:426](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/email-normaliser/src/utils/email/types.ts#L426)

Array of candidate domains to match against

***

### maxDistance?

> `optional` **maxDistance**: `number`

Defined in: [utils/email/types.ts:433](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/email-normaliser/src/utils/email/types.ts#L433)

Optional max acceptable edit distance. If no candidate is at or under this
distance, `candidate` will be null and `index` = -1. If omitted, always returns the best.

A common heuristic is `Math.ceil(max(input.length, candidate.length) * 0.25)`

***

### normalise?

> `optional` **normalise**: `boolean`

Defined in: [utils/email/types.ts:437](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/email-normaliser/src/utils/email/types.ts#L437)

Pre-normalise (lowercase/trim) both input and candidates. Default true.
