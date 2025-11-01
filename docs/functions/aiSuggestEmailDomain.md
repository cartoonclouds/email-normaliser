[**@cartoonclouds/email-normaliser v0.1.0**](../README.md)

***

# Function: aiSuggestEmailDomain()

> **aiSuggestEmailDomain**(`domain`, `options`): `Promise`\<[`AiEmailSuggestion`](../type-aliases/AiEmailSuggestion.md) \| `null`\>

Defined in: [utils/email/aiSuggestEmail.ts:89](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/aiSuggestEmail.ts#L89)

Get a domain suggestion using transformer embeddings vs a curated list.
Returns null if we’re not confident enough.

## Parameters

### domain

`string`

### options

[`AiEmailOptions`](../type-aliases/AiEmailOptions.md) = `{}`

## Returns

`Promise`\<[`AiEmailSuggestion`](../type-aliases/AiEmailSuggestion.md) \| `null`\>
