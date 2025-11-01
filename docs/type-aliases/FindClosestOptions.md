[**@cartoonclouds/email-normaliser v0.1.0**](../README.md)

***

# Type Alias: FindClosestOptions

> **FindClosestOptions** = `object`

Defined in: [utils/email/types.ts:418](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L418)

Options for fuzzy domain matching.

## Example

```typescript
const options: FindClosestOptions = {
  candidates: ['gmail.com', 'googlemail.com'],
  maxDistance: 2,
  normalize: true
}

const result = findClosestDomain('gmai.com', options);
```

## Properties

### candidates?

> `optional` **candidates**: `string`[]

Defined in: [utils/email/types.ts:420](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L420)

Array of candidate domains to match against

***

### maxDistance?

> `optional` **maxDistance**: `number`

Defined in: [utils/email/types.ts:427](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L427)

Optional max acceptable edit distance. If no candidate is at or under this
distance, `candidate` will be null and `index` = -1. If omitted, always returns the best.

A common heuristic is `Math.ceil(max(input.length, candidate.length) * 0.25)`

***

### normalize?

> `optional` **normalize**: `boolean`

Defined in: [utils/email/types.ts:431](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L431)

Pre-normalize (lowercase/trim) both input and candidates. Default true.
