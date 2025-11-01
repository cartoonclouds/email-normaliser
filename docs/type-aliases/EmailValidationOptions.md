[**@cartoonclouds/email-normaliser v0.1.0**](../README.md)

***

# Type Alias: EmailValidationOptions

> **EmailValidationOptions** = `object`

Defined in: [utils/email/types.ts:166](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L166)

Configuration options for email validation.

Allows customization of the validation process by providing custom
domain corrections, TLD corrections, blocklist rules, ASCII-only validation,
and fuzzy domain matching for intelligent suggestions.

## Example

```typescript
const options: EmailValidationOptions = {
  fixDomains: { 'mytypo.com': 'correct.com' },
  fixTlds: { '.typo': '.com' },
  blocklist: {
    block: { exact: ['unwanted.domain'] }
  },
  asciiOnly: true,
  fuzzyMatching: {
    enabled: true,
    maxDistance: 2,
    minConfidence: 0.7
  }
}
```

## Properties

### asciiOnly?

> `optional` **asciiOnly**: `boolean`

Defined in: [utils/email/types.ts:193](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L193)

Whether to allow only ASCII characters in email addresses.

When `true` (default), non-ASCII characters will be considered invalid.
When `false`, international characters are allowed.

#### Default

```ts
true
```

***

### blocklist?

> `optional` **blocklist**: [`EmailBlockConfig`](EmailBlockConfig.md)

Defined in: [utils/email/types.ts:172](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L172)

Blocklist configuration for email validation.

#### Default

```ts
DEFAULT_BLOCKLIST
```

***

### fixDomains?

> `optional` **fixDomains**: `Record`\<`string`, `string`\>

Defined in: [utils/email/types.ts:178](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L178)

Fix common domain typos configuration.

#### Default

```ts
DEFAULT_FIX_DOMAINS
```

***

### fixTlds?

> `optional` **fixTlds**: `Record`\<`string`, `string`\>

Defined in: [utils/email/types.ts:184](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L184)

Fix common TLD typos configuration.

#### Default

```ts
DEFAULT_FIX_TLDS
```

***

### fuzzyMatching?

> `optional` **fuzzyMatching**: `object`

Defined in: [utils/email/types.ts:199](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L199)

Configuration for fuzzy domain matching.

When enabled, provides intelligent domain suggestions for typos.

#### candidates?

> `optional` **candidates**: `string`[]

Additional domain candidates for fuzzy matching.
These will be combined with the built-in DEFAULT_FUZZY_DOMAIN_CANDIDATES list.

##### Default

```ts
DEFAULT_FUZZY_DOMAIN_CANDIDATES
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

Maximum edit distance for domain suggestions.
Lower values are more restrictive, higher values allow more distant matches.

##### Default

```ts
2
```

#### minConfidence?

> `optional` **minConfidence**: `number`

Minimum confidence score (0-1) for domain suggestions.
Higher values only suggest very confident matches.

##### Default

```ts
0.7
```
