[**@cartoonclouds/email-normaliser v0.1.0**](../README.md)

***

# Type Alias: EmailNormOptionsAI

> **EmailNormOptionsAI** = [`EmailNormOptions`](EmailNormOptions.md) & `object`

Defined in: [utils/email/types.ts:509](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L509)

Options for AI-powered email normalization.

Extends EmailNormOptions with AI functionality for intelligent domain suggestions.

## Type Declaration

### ai?

> `optional` **ai**: `object`

AI-powered domain suggestion configuration

#### ai.candidates?

> `optional` **candidates**: `string`[]

Custom candidate domains for suggestions

#### ai.enabled?

> `optional` **enabled**: `boolean`

Whether to enable AI domain suggestions

#### ai.maxEdits?

> `optional` **maxEdits**: `number`

Maximum edit distance to consider

#### ai.model?

> `optional` **model**: `string`

Transformer model to use for embeddings

#### ai.threshold?

> `optional` **threshold**: `number`

Minimum confidence threshold for suggestions
