[**@cartoonclouds/email-normaliser v0.1.0**](../README.md)

***

# Type Alias: AiEmailSuggestion

> **AiEmailSuggestion** = `object`

Defined in: [utils/email/types.ts:448](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L448)

AI-powered email domain suggestion result.

## Example

```typescript
const suggestion: AiEmailSuggestion = {
  suggestion: 'gmail.com',
  confidence: 0.92,
  reason: 'embedding_similarity'
}
```

## Properties

### confidence

> **confidence**: `number`

Defined in: [utils/email/types.ts:452](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L452)

Confidence score for the suggestion (0-1)

***

### reason

> **reason**: `"embedding_similarity"`

Defined in: [utils/email/types.ts:454](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L454)

Method used to generate the suggestion

***

### suggestion

> **suggestion**: `string`

Defined in: [utils/email/types.ts:450](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/types.ts#L450)

The suggested domain correction
