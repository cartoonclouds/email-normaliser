[**@cartoonclouds/contact-normalisers v0.1.0**](../README.md)

***

# Variable: DEFAULT\_FIX\_DOMAINS

> `const` **DEFAULT\_FIX\_DOMAINS**: `Record`\<`string`, `string`\>

Defined in: [utils/email/constants.ts:28](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/contact-normalisers/src/utils/email/constants.ts#L28)

Default domain correction mappings for common email provider typos and variations.

This object contains mappings from commonly misspelled or variant domain names
to their correct counterparts. It includes typos for major email providers
like Gmail, Hotmail, Outlook, Yahoo, iCloud, and others.

## Example

```typescript
// "gamil.com" will be corrected to "gmail.com"
// "hotmial.com" will be corrected to "hotmail.com"
normaliseEmail('user@gamil.com') // Returns email normalized to 'user@gmail.com'
```

Categories included:
- Gmail variations (15 mappings)
- Hotmail variations (9 mappings)
- Outlook variations (9 mappings)
- Yahoo variations (9 mappings)
- iCloud variations (7 mappings)
- UK domain variations (6 mappings)
- Other providers (9 mappings)
- Business domains (3 mappings)
- Additional typos (4 mappings)
