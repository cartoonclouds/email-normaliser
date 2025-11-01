[**@cartoonclouds/email-normaliser v0.1.0**](../README.md)

***

# Type Alias: AiEmailOptions

> **AiEmailOptions** = `object`

Defined in: [utils/email/types.ts:470](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L470)

Configuration options for AI-powered email suggestions.

## Example

```typescript
const options: AiEmailOptions = {
  candidates: ['gmail.com', 'outlook.com'],
  model: 'Xenova/all-MiniLM-L6-v2',
  threshold: 0.8,
  maxEdits: 3
}
```

## Properties

### candidates?

> `optional` **candidates**: `string`[]

Defined in: [utils/email/types.ts:472](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L472)

Custom candidate domains for suggestions

***

### maxEdits?

> `optional` **maxEdits**: `number`

Defined in: [utils/email/types.ts:478](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L478)

Maximum edit distance to consider

***

### model?

> `optional` **model**: `string`

Defined in: [utils/email/types.ts:474](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L474)

Transformer model to use for embeddings

***

### threshold?

> `optional` **threshold**: `number`

Defined in: [utils/email/types.ts:476](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L476)

Minimum confidence threshold for suggestions
