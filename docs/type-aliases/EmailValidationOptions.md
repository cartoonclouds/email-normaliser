[**@cartoonclouds/contact-normalisers v0.1.0**](../README.md)

***

# Type Alias: EmailValidationOptions

> **EmailValidationOptions** = `object`

Defined in: [utils/email/validateEmail.ts:117](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/validateEmail.ts#L117)

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

Defined in: [utils/email/validateEmail.ts:144](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/validateEmail.ts#L144)

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

Defined in: [utils/email/validateEmail.ts:123](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/validateEmail.ts#L123)

Blocklist configuration for email validation.

#### Default

```ts
DEFAULT_BLOCKLIST
```

***

### fixDomains?

> `optional` **fixDomains**: `Record`\<`string`, `string`\>

Defined in: [utils/email/validateEmail.ts:129](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/validateEmail.ts#L129)

Fix common domain typos configuration.

#### Default

```ts
DEFAULT_FIX_DOMAINS
```

***

### fixTlds?

> `optional` **fixTlds**: `Record`\<`string`, `string`\>

Defined in: [utils/email/validateEmail.ts:135](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/validateEmail.ts#L135)

Fix common TLD typos configuration.

#### Default

```ts
DEFAULT_FIX_TLDS
```
