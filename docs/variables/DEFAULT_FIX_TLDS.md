[**@cartoonclouds/email-normaliser v0.1.0**](../README.md)

***

# Variable: DEFAULT\_FIX\_TLDS

> `const` **DEFAULT\_FIX\_TLDS**: `Record`\<`string`, `string`\>

Defined in: [utils/email/constants.ts:142](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/constants.ts#L142)

Default Top-Level Domain (TLD) correction mappings for common typos.

This object contains mappings from commonly misspelled TLD endings
to their correct counterparts. It helps fix typos in email addresses
where users have mistyped the domain extension.

## Example

```typescript
// ".con" will be corrected to ".com"
// ".co,uk" will be corrected to ".co.uk"
normaliseEmail('user@example.con') // Returns email normalised to 'user@example.com'
```

Categories included:
- .com variations (16 mappings): .cpm, .con, .ocm, .vom, etc.
- .net variations (10 mappings): .ne, .nt, .bet, .met, etc.
- .org variations (8 mappings): .ogr, .or, .og, .orh, etc.
- .edu variations (5 mappings): .ed, .eud, .deu, etc.
- .co.uk variations (9 mappings): .co,uk, .couk, .co.k, etc.
- Generic TLD variations (4 mappings): .inf → .info, .bi → .biz
- Mobile TLD variations (2 mappings): .mob → .mobi, .mobile → .mobi
