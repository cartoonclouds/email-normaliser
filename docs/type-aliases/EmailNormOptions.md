[**@cartoonclouds/email-normaliser v0.1.0**](../README.md)

***

# Type Alias: EmailNormOptions

> **EmailNormOptions** = `object`

Defined in: [utils/email/types.ts:278](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L278)

Options that influence normalisation behaviour.

All maps are merged with sensible defaults (see constants). Set `asciiOnly`
to `false` to accept internationalised mail addresses (IDN/UTF-8 local-parts).

## Example

```ts
const opts: EmailNormOptions = {
  blocklist: { block: { wildcard: ['*.throwaway.*'] } },
  fixDomains: { 'gmai.com': 'gmail.com' },
  fixTlds: { '.con': '.com' },
  asciiOnly: true
};

const r = normaliseEmail('José@exämple.con', opts);
// → "jose@example.com"
```

## Properties

### asciiOnly?

> `optional` **asciiOnly**: `boolean`

Defined in: [utils/email/types.ts:306](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L306)

Whether to allow only ASCII characters in email addresses.

When `true` (default), non-ASCII characters will be considered invalid and
the normalization process will attempt to remove or transliterate them.
When `false`, international characters are allowed.

#### Default

```ts
true
```

***

### blocklist?

> `optional` **blocklist**: [`EmailBlockConfig`](EmailBlockConfig.md)

Defined in: [utils/email/types.ts:284](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L284)

Blocklist configuration for email validation (merges with default).

#### Default

```ts
DEFAULT_BLOCKLIST
```

***

### fixDomains?

> `optional` **fixDomains**: `Record`\<`string`, `string`\>

Defined in: [utils/email/types.ts:290](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L290)

Fix common domain typos (merges with default).

#### Default

```ts
DEFAULT_FIX_DOMAINS
```

***

### fixTlds?

> `optional` **fixTlds**: `Record`\<`string`, `string`\>

Defined in: [utils/email/types.ts:296](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L296)

Fix common TLD typos (merges with default).

#### Default

```ts
DEFAULT_FIX_TLDS
```

***

### fuzzyMatching?

> `optional` **fuzzyMatching**: `object`

Defined in: [utils/email/types.ts:313](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L313)

Fuzzy domain matching configuration for intelligent domain corrections.

When enabled, applies fuzzy string matching to detect and correct
potential domain typos that aren't covered by the exact fix mappings.

#### candidates?

> `optional` **candidates**: `string`[]

Additional domain candidates for fuzzy matching.
These will be combined with the built-in DEFAULT_FUZZY_DOMAIN_CANDIDATES list.

##### Default

```ts
[]
```

#### enabled?

> `optional` **enabled**: `boolean`

Whether to enable fuzzy domain matching.

##### Default

```ts
false
```

#### findClosestOptions?

> `optional` **findClosestOptions**: `Omit`\<[`FindClosestOptions`](FindClosestOptions.md), `"candidates"` \| `"maxDistance"`\>

Additional fuzzy matching options passed to findClosestDomain.

#### maxDistance?

> `optional` **maxDistance**: `number`

Maximum edit distance for domain corrections.
Lower values are more restrictive, higher values allow more distant matches.

##### Default

```ts
5
```

#### minConfidence?

> `optional` **minConfidence**: `number`

Minimum confidence score (0-1) for domain corrections.
Higher values only apply very confident corrections.

##### Default

```ts
0.8
```
