[**@cartoonclouds/email-normaliser v0.1.0**](../README.md)

***

# Function: normaliseEmailWithAI()

> **normaliseEmailWithAI**(`raw`, `opts`): `Promise`\<[`EmailNormResultAI`](../type-aliases/EmailNormResultAI.md)\>

Defined in: [utils/email/normaliseEmail.ts:621](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/normaliseEmail.ts#L621)

Async version: uses the same normalization flow and, if invalid (or dubious),
queries transformers.js embeddings to suggest a domain.

## Parameters

### raw

`string`

### opts

[`EmailNormOptionsAI`](../type-aliases/EmailNormOptionsAI.md) = `{}`

## Returns

`Promise`\<[`EmailNormResultAI`](../type-aliases/EmailNormResultAI.md)\>
