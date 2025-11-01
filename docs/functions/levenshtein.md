[**@cartoonclouds/email-normaliser v0.1.0**](../README.md)

***

# Function: levenshtein()

> **levenshtein**(`a`, `b`, `maxDistance?`): `number`

Defined in: [utils/email/fuzzyDomainMatching.ts:20](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/fuzzyDomainMatching.ts#L20)

Compute Levenshtein distance (edit distance) between two ASCII-ish strings.
Optimized with two rolling rows; optional early exit with `maxDistance`.

## Parameters

### a

`string`

The first string

### b

`string`

The second string

### maxDistance?

`number` = `Infinity`

Optional max distance for early exit

## Returns

`number`

The Levenshtein distance between the two strings

## Example

```ts
levenshtein('gmai.com', 'gmail.com') // -> 1
```
