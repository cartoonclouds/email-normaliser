[**@cartoonclouds/email-normaliser v0.1.0**](../README.md)

***

# Variable: EmailChangeCodes

> `const` **EmailChangeCodes**: `Readonly`\<\{ `BLOCKED_BY_LIST`: `"blocked_by_list"`; `CONVERTED_TO_ASCII`: `"converted_to_ascii"`; `DEOBFUSCATED_AT_AND_DOT`: `"deobfuscated_at_and_dot"`; `EMPTY`: `"empty"`; `FIXED_DOMAIN_AND_TLD_TYPOS`: `"fixed_domain_and_tld_typos"`; `FUZZY_DOMAIN_CORRECTION`: `"fuzzy_domain_correction"`; `INVALID_EMAIL_SHAPE`: `"invalid_email_shape"`; `LOWERCASED_DOMAIN`: `"lowercased_domain"`; `NORMALIZED_UNICODE_SYMBOLS`: `"normalized_unicode_symbols"`; `STRIPPED_DISPLAY_NAME_AND_COMMENTS`: `"stripped_display_name_and_comments"`; `TIDIED_PUNCTUATION_AND_SPACING`: `"tidied_punctuation_and_spacing"`; \}\>

Defined in: [utils/email/constants.ts:318](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/constants.ts#L318)

Enumeration of all possible email normalization change codes.

These machine-readable codes represent specific transformations that can be
applied during the email normalization process. Each code corresponds to a
specific step in the normalization pipeline.

## Example

```typescript
const result = normaliseEmail('User (comment) at gmail dot com')
// result.changeCodes might include:
// ['stripped_display_name_and_comments', 'deobfuscated_at_and_dot', 'lowercased_domain']
```
