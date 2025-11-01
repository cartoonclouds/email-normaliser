[**@cartoonclouds/contact-normalisers v0.1.0**](../README.md)

***

# Type Alias: EmailValidationOptions

> **EmailValidationOptions** = `object`

Defined in: [utils/email/validateEmail.ts:110](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/validateEmail.ts#L110)

Configuration options for email validation.

Allows customization of the validation process by providing custom
domain corrections, TLD corrections, blocklist rules, and ASCII-only validation.

## Example

```typescript
const options: EmailValidationOptions = {
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

Defined in: [utils/email/validateEmail.ts:137](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/validateEmail.ts#L137)

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

Defined in: [utils/email/validateEmail.ts:116](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/validateEmail.ts#L116)

Blocklist configuration for email validation.

#### Default

```ts
DEFAULT_BLOCKLIST
```

***

### fixDomains?

> `optional` **fixDomains**: `Record`\<`string`, `string`\>

Defined in: [utils/email/validateEmail.ts:122](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/validateEmail.ts#L122)

Fix common domain typos configuration.

#### Default

```ts
DEFAULT_FIX_DOMAINS
```

***

### fixTlds?

> `optional` **fixTlds**: `Record`\<`string`, `string`\>

Defined in: [utils/email/validateEmail.ts:128](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/validateEmail.ts#L128)

Fix common TLD typos configuration.

#### Default

```ts
DEFAULT_FIX_TLDS
```
