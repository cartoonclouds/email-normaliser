[**@cartoonclouds/contact-normalisers v0.1.0**](../README.md)

***

# Function: aiSuggestEmailDomain()

> **aiSuggestEmailDomain**(`domain`, `options`): `Promise`\<[`AiEmailSuggestion`](../type-aliases/AiEmailSuggestion.md) \| `null`\>

Defined in: [utils/email/aiSuggestEmail.ts:123](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/aiSuggestEmail.ts#L123)

Suggest a corrected email domain using AI-based semantic similarity.

Uses transformer embeddings to find the most similar domain from a list of candidates.
Combines both semantic similarity (cosine similarity of embeddings) and edit distance
to provide intelligent domain suggestions for misspelled email addresses.

## Parameters

### domain

`string`

The potentially misspelled email domain

### options

[`AiEmailOptions`](../type-aliases/AiEmailOptions.md) = `{}`

Configuration options for the suggestion algorithm

## Returns

`Promise`\<[`AiEmailSuggestion`](../type-aliases/AiEmailSuggestion.md) \| `null`\>

Suggestion object with corrected domain and confidence, or null if no good match
