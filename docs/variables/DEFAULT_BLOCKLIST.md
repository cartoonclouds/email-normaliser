[**@cartoonclouds/email-normaliser v0.1.0**](../README.md)

***

# Variable: DEFAULT\_BLOCKLIST

> `const` **DEFAULT\_BLOCKLIST**: [`EmailBlockConfig`](../type-aliases/EmailBlockConfig.md)

Defined in: [utils/email/constants.ts:236](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/utils/email/constants.ts#L236)

Default email blocklist configuration to prevent invalid or unwanted email addresses.

This configuration defines patterns for blocking certain types of email addresses,
including test domains, temporary email services, and example domains that should
not be used in production environments.

## Example

```typescript
// These emails will be blocked:
normaliseEmail('user@example.com')      // blocked by exact match
normaliseEmail('user@test.mailinator.com') // blocked by wildcard pattern
normaliseEmail('user@domain.test')      // blocked by TLD
```

Blocking categories:
- **Exact domains** (5 entries): Specific domains like example.com, test.com
- **Suffix patterns** (2 entries): Domains ending with .example, .test
- **Wildcard patterns** (3 entries): Pattern matching for temporary email services
- **Blocked TLDs** (4 entries): Top-level domains like .test, .invalid, .example

The configuration also supports an allowlist that can override blocked domains
for specific exceptions when needed.
