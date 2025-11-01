[**@cartoonclouds/email-normaliser v0.1.0**](../README.md)

***

# Variable: DEFAULT\_FUZZY\_DOMAIN\_CANDIDATES

> `const` **DEFAULT\_FUZZY\_DOMAIN\_CANDIDATES**: readonly \[`"gmail.com"`, `"outlook.com"`, `"hotmail.com"`, `"live.com"`, `"msn.com"`, `"icloud.com"`, `"me.com"`, `"mac.com"`, `"yahoo.com"`, `"yahoo.co.uk"`, `"googlemail.com"`, `"proton.me"`, `"fastmail.com"`, `"zoho.com"`, `"btinternet.co.uk"`, `"talktalk.net"`, `"talktalk.co.uk"`, `"sky.com"`, `"sky.co.uk"`, `"virginmedia.com"`, `"virginmedia.co.uk"`, `"blueyonder.co.uk"`, `"ntlworld.com"`, `"ntlworld.co.uk"`\]

Defined in: [utils/email/constants.ts:373](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/constants.ts#L373)

Default list of popular email domains used for fuzzy domain matching.

This readonly array contains a curated list of common email service provider
domains. It is used as the default candidate list for fuzzy matching algorithms
to suggest corrections for misspelled or mistyped email domains.

## Example

```typescript
// "gmai.com" will be suggested as "gmail.com"
const suggestion = findClosestDomain('gmai.com', DEFAULT_FUZZY_DOMAIN_CANDIDATES);
console.log(suggestion); // { domain: 'gmail.com', distance: 1 }
```
