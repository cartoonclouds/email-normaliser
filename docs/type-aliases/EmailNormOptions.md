[**@cartoonclouds/contact-normalisers v0.1.0**](../README.md)

***

# Type Alias: EmailNormOptions

> **EmailNormOptions** = `object`

Defined in: [utils/email/normaliseEmail.ts:157](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/normaliseEmail.ts#L157)

Configuration options for email normalization behavior.

Allows customization of the normalization process by providing custom
domain corrections, TLD corrections, and blocklist rules that will be
merged with the default configurations.

## Example

```typescript
const options: EmailNormOptions = {
  fixDomains: { 'mytypo.com': 'correct.com' },
  fixTlds: { '.typo': '.com' },
  blocklist: {
    block: { exact: ['unwanted.domain'] }
  },
  asciiOnly: true
}
```

## Properties

### asciiOnly?

> `optional` **asciiOnly**: `boolean`

Defined in: [utils/email/normaliseEmail.ts:185](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/normaliseEmail.ts#L185)

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

Defined in: [utils/email/normaliseEmail.ts:163](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/normaliseEmail.ts#L163)

Blocklist configuration for email validation (merges with default).

#### Default

```ts
DEFAULT_BLOCKLIST
```

***

### fixDomains?

> `optional` **fixDomains**: `Record`\<`string`, `string`\>

Defined in: [utils/email/normaliseEmail.ts:169](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/normaliseEmail.ts#L169)

Fix common domain typos (merges with default).

#### Default

```ts
DEFAULT_FIX_DOMAINS
```

***

### fixTlds?

> `optional` **fixTlds**: `Record`\<`string`, `string`\>

Defined in: [utils/email/normaliseEmail.ts:175](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/normaliseEmail.ts#L175)

Fix common TLD typos (merges with default).

#### Default

```ts
DEFAULT_FIX_TLDS
```
