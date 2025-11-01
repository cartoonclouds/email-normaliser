[**@cartoonclouds/contact-normalisers v0.1.0**](../README.md)

***

# Type Alias: EmailNormOptions

> **EmailNormOptions** = `object`

Defined in: [utils/email/normaliseEmail.ts:168](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/normaliseEmail.ts#L168)

Options that influence normalisation behaviour.

All maps are merged with sensible defaults (see constants). Set `ascii.only`
to `false` to accept internationalised mail addresses (IDN/UTF-8 local-parts).

## Example

```ts
const opts: EmailNormOptions = {
  blocklist: { block: { wildcard: ['*.throwaway.*'] } },
  fixDomains: { 'gmai.com': 'gmail.com' },
  fixTlds: { '.con': '.com' },
  ascii: { only: true, transliterate: true }
};

const r = normaliseEmail('José@exämple.con', opts);
// → "jose@example.com"
```

## Properties

### asciiOnly?

> `optional` **asciiOnly**: `boolean`

Defined in: [utils/email/normaliseEmail.ts:196](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/normaliseEmail.ts#L196)

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

Defined in: [utils/email/normaliseEmail.ts:174](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/normaliseEmail.ts#L174)

Blocklist configuration for email validation (merges with default).

#### Default

```ts
DEFAULT_BLOCKLIST
```

***

### fixDomains?

> `optional` **fixDomains**: `Record`\<`string`, `string`\>

Defined in: [utils/email/normaliseEmail.ts:180](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/normaliseEmail.ts#L180)

Fix common domain typos (merges with default).

#### Default

```ts
DEFAULT_FIX_DOMAINS
```

***

### fixTlds?

> `optional` **fixTlds**: `Record`\<`string`, `string`\>

Defined in: [utils/email/normaliseEmail.ts:186](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/normaliseEmail.ts#L186)

Fix common TLD typos (merges with default).

#### Default

```ts
DEFAULT_FIX_TLDS
```
