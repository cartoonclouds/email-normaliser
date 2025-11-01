[**@cartoonclouds/email-normaliser v0.1.0**](../README.md)

***

# Type Alias: EmailBlockConfig

> **EmailBlockConfig** = `object`

Defined in: [utils/email/types.ts:106](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L106)

Block/allow configuration for domains and TLDs.

You can combine exact, suffix, wildcard and TLD rules, and then punch holes
via `allow.exact`. Values are compared case-insensitively.

## Examples

```ts
const cfg: EmailBlockConfig = {
  block: {
    exact: ['example.com', 'test.local'],
    suffix: ['.invalid', '.local'],
    wildcard: ['*.mailinator.com', '*.disposable.*'],
    tlds: ['.zip', '.example']
  },
  allow: { exact: ['my-team.example.com'] }
};
```

```ts
// Checking a domain against the config:
isBlocked('user@mailinator.com', cfg)  // → true (wildcard)
isBlocked('boss@my-team.example.com', cfg) // → false (allow.exact)
```

## Properties

### allow?

> `optional` **allow**: `object`

Defined in: [utils/email/types.ts:132](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L132)

#### exact?

> `optional` **exact**: `string`[]

Exact match patterns that override the block list.

E.g. if you block "*.example.com" but want to allow "company.example.com"

***

### block?

> `optional` **block**: `object`

Defined in: [utils/email/types.ts:107](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L107)

#### exact?

> `optional` **exact**: `string`[]

Exact match patterns.

#### suffix?

> `optional` **suffix**: `string`[]

Suffix match patterns.

E.g. ".example" matches "user@example", "user@sub.example", etc.

#### tlds?

> `optional` **tlds**: `string`[]

TLD-only match patterns.

E.g. ".zip", ".example" to block those TLDs.

#### wildcard?

> `optional` **wildcard**: `string`[]

Wildcard patterns (*, ** supported).

E.g. "*.mailinator.com" matches "user@123.mailinator.com"
E.g. "*.disposable.*" matches "user@temp.disposable.email"
