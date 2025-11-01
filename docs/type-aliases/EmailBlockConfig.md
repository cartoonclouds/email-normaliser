[**@cartoonclouds/contact-normalisers v0.1.0**](../README.md)

***

# Type Alias: EmailBlockConfig

> **EmailBlockConfig** = `object`

Defined in: [utils/email/normaliseEmail.ts:106](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/normaliseEmail.ts#L106)

Configuration object for email domain and pattern blocking.

Defines rules for blocking unwanted email addresses using various matching
strategies including exact matches, suffix patterns, wildcard patterns, and
TLD-based blocking. Also supports allowlist overrides.

## Example

```typescript
const blockConfig: EmailBlockConfig = {
  block: {
    exact: ['spam.com', 'fake.domain'],
    suffix: ['.temp', '.test'],
    wildcard: ['*.mailinator.*', '*.throwaway.*'],
    tlds: ['.invalid', '.test']
  },
  allow: {
    exact: ['important.test'] // Override block rules for specific domains
  }
}
```

## Properties

### allow?

> `optional` **allow**: `object`

Defined in: [utils/email/normaliseEmail.ts:132](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/normaliseEmail.ts#L132)

Allowlist configuration that overrides block rules for specific domains

#### exact?

> `optional` **exact**: `string`[]

Exact domain matches that should be allowed despite being in block rules

***

### block?

> `optional` **block**: `object`

Defined in: [utils/email/normaliseEmail.ts:107](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/normaliseEmail.ts#L107)

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
