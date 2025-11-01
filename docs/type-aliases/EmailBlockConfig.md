[**@cartoonclouds/contact-normalisers v0.1.0**](../README.md)

***

# Type Alias: EmailBlockConfig

> **EmailBlockConfig** = `object`

Defined in: [utils/email/normaliseEmail.ts:117](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/normaliseEmail.ts#L117)

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

Defined in: [utils/email/normaliseEmail.ts:143](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/normaliseEmail.ts#L143)

Allowlist configuration that overrides block rules for specific domains

#### exact?

> `optional` **exact**: `string`[]

Exact domain matches that should be allowed despite being in block rules

***

### block?

> `optional` **block**: `object`

Defined in: [utils/email/normaliseEmail.ts:118](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/normaliseEmail.ts#L118)

#### exact?

> `optional` **exact**: `string`[]

Exact match patterns.

#### suffix?

> `optional` **suffix**: `string`[]

Suffix match patterns.

E.g. ".example" matches "user@example", "

#### tlds?

> `optional` **tlds**: `string`[]

Top-level domains to block.

E.g. ".test", ".invalid"

#### wildcard?

> `optional` **wildcard**: `string`[]

Wildcard match patterns.

E.g. "*.mailinator.com" matches "abc.mailinator.com", "xyz.mailinator.com.au", etc.
