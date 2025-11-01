[**@cartoonclouds/email-normaliser v0.1.0**](../README.md)

***

# Function: findClosestDomain()

> **findClosestDomain**(`input`, `opts?`): [`ClosestDomainResult`](../type-aliases/ClosestDomainResult.md)

Defined in: [utils/email/fuzzyDomainMatching.ts:83](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/fuzzyDomainMatching.ts#L83)

Find the closest domain from a list of candidates using Levenshtein distance.

## Parameters

### input

`string`

The input domain to match

### opts?

[`FindClosestOptions`](../type-aliases/FindClosestOptions.md) = `{}`

Options for finding the closest domain

## Returns

[`ClosestDomainResult`](../type-aliases/ClosestDomainResult.md)

The closest domain result

## Examples

```ts
findClosestDomain('gmai.com')
// → gmail.com (distance 1, score ~0.88)
```

```ts
findClosestDomain('virginmeda.co.uk', { maxDistance: 3 })
// → virginmedia.co.uk (distance 1, score ~0.92)
```
