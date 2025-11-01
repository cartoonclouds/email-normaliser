[**@cartoonclouds/email-normaliser v0.1.0**](../README.md)

***

# Type Alias: UseEmailOptions

> **UseEmailOptions** = [`EmailNormOptions`](EmailNormOptions.md) & `object`

Defined in: [utils/email/types.ts:499](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L499)

Configuration options for the Vue email composable.

Extends EmailNormOptions with additional Vue-specific features.

## Type Declaration

### autoFormat?

> `optional` **autoFormat**: `boolean`

Whether to automatically apply normalization to the input value

## Example

```typescript
const options: UseEmailOptions = {
  autoFormat: true,
  fixDomains: { 'gmai.com': 'gmail.com' },
  blocklist: {
    block: { exact: ['spam.com'] }
  }
}
```
