
# @cartoonclouds/contact-normalisers

A comprehensive email normalization and validation library with Vue 3 directives, composables, and AI-powered domain suggestions.

## Features

✨ **Email Normalization**: Automatic fixing of common typos, formatting issues, and obfuscation  
🔍 **Smart Validation**: Multi-layered validation with customizable blocklists  
🤖 **AI Domain Suggestions**: Machine learning-powered typo correction for email domains  
⚡ **Vue 3 Integration**: Ready-to-use composables and directives  
🌳 **Tree Shakeable**: Import only what you need  
📱 **TypeScript Support**: Full type safety with comprehensive type definitions  
🎯 **67+ Domain Corrections**: Built-in fixes for common email provider typos  
🌐 **51+ TLD Corrections**: Smart handling of TLD misspellings  

## Installation

```bash
npm install @cartoonclouds/contact-normalisers
```

## Quick Start

### Basic Email Normalization

```typescript
import { normaliseEmail } from '@cartoonclouds/contact-normalisers'

const result = normaliseEmail('user@gamil.com') // Fixes gamil.com → gmail.com
console.log(result.email) // 'user@gmail.com'
console.log(result.valid) // true
console.log(result.changes) // ['Corrected common domain or TLD typos.']
```

### Vue 3 Composable

```vue
<script setup>
import { useEmail } from '@cartoonclouds/contact-normalisers'

const { value, email, valid, changes, apply } = useEmail('', {
  autoFormat: true
})
</script>

<template>
  <input v-model="value" placeholder="Enter email" />
  <p v-if="!valid">{{ changes.join(', ') }}</p>
  <button @click="apply">Fix Email</button>
</template>
```

### Vue 3 Directive

#### Global Registration

Register the directive globally in your Vue 3 application:

```typescript
// main.ts or main.js
import { createApp } from 'vue'
import { EmailDirective } from '@cartoonclouds/contact-normalisers'
import App from './App.vue'

const app = createApp(App)

// Register the directive globally
app.directive('email', EmailDirective)

app.mount('#app')
```

After global registration, use the directive in any component without importing:

```vue
<template>
  <input 
    v-email="{ 
      autoFormat: true, 
      previewSelector: '#email-preview' 
    }" 
    placeholder="Enter email"
  />
  <div id="email-preview"></div>
</template>
```

#### Component-Level Usage

Alternatively, import and use the directive in individual components:

```vue
<script setup>
import { EmailDirective } from '@cartoonclouds/contact-normalisers'
</script>

<template>
  <input 
    v-email="{ 
      autoFormat: true, 
      previewSelector: '#email-preview' 
    }" 
    placeholder="Enter email"
  />
  <div id="email-preview"></div>
</template>
```

## API Reference

### Core Functions

#### `normaliseEmail(email, options?)`

Normalize and validate an email address with comprehensive error checking.

```typescript
interface EmailNormResult {
  email: string | null      // Normalized email or null if invalid
  valid: boolean           // Whether the email is valid
  changes: string[]        // Human-readable list of changes made
  changeCodes: EmailChangeCode[] // Machine-readable change codes
}

const result = normaliseEmail('User@GMAIL.CO', {
  fixDomains: { 'custom.typo': 'correct.domain' },
  fixTlds: { '.co': '.com' },
  blocklist: { 
    block: { exact: ['spam.com'] } 
  }
})
```

**Built-in Corrections:**
- **Unicode Normalization**: Converts fullwidth @ and . characters
- **Display Name Removal**: Strips `"Name" <email@domain.com>` format
- **Obfuscation Fixing**: Converts `user[at]domain[dot]com` → `user@domain.com`
- **Punctuation Cleanup**: Fixes spacing, trailing punctuation, comma errors
- **Domain Typos**: 67+ common corrections (gmail.co → gmail.com, etc.)
- **TLD Typos**: 51+ TLD fixes (.con → .com, .co,uk → .co.uk, etc.)
- **Case Normalization**: Lowercases domains while preserving local parts

#### `validateEmail(email)`

Validate an email address and return detailed validation results.

```typescript
const results = validateEmail('user@invalid-domain.test')
// Returns array of validation results:
// [{ isValid: false, validationCode: 'BLOCKLISTED', validationMessage: '...' }]
```

**Validation Checks:**
- Empty/whitespace validation
- Format validation (RFC-compliant regex)
- Domain typo detection
- TLD typo detection  
- Blocklist checking (exact, suffix, wildcard, TLD patterns)

#### `aiSuggestEmailDomain(domain, options?)`

AI-powered domain suggestion using transformer embeddings.

```typescript
const suggestion = await aiSuggestEmailDomain('gmial.com', {
  model: 'Xenova/all-MiniLM-L6-v2',
  threshold: 0.82,
  maxEdits: 2,
  candidates: ['gmail.com', 'hotmail.com', 'outlook.com']
})

console.log(suggestion)
// { suggestion: 'gmail.com', confidence: 0.94, reason: 'embedding_similarity' }
```

### Vue Integration

#### `useEmail(initialValue?, options?)`

Reactive email composable for Vue 3.

```typescript
interface UseEmailOptions extends EmailNormOptions {
  autoFormat?: boolean // Auto-apply corrections on input
}

const {
  value,      // Ref<string> - Raw input value
  email,      // ComputedRef<string | null> - Normalized email
  valid,      // ComputedRef<boolean> - Validation status
  changes,    // ComputedRef<string[]> - List of changes made
  result,     // ComputedRef<EmailNormResult> - Full normalization result
  apply,      // () => void - Apply normalized email to input
  validate    // () => boolean - Manually trigger validation
} = useEmail('initial@email.com', { autoFormat: true })
```

#### Email Directive

Full-featured Vue directive for automatic email processing.

```vue
<template>
  <!-- Basic usage -->
  <input v-email />
  
  <!-- With auto-formatting -->
  <input v-email="{ autoFormat: true }" />
  
  <!-- With preview element -->
  <input v-email="{ 
    autoFormat: true,
    previewSelector: '#preview',
    onNormalized: (result) => console.log(result)
  }" />
  <div id="preview"></div>
  
  <!-- Custom validation events -->
  <input v-email="{
    autoFormat: true,
    autoFormatEvents: { onInput: true, onBlur: false }
  }" />
</template>
```

### Constants & Configuration

The library includes comprehensive built-in correction lists for common email typos and validation rules.

#### Default Domain Corrections (67 corrections)

```typescript
import { DEFAULT_FIX_DOMAINS } from '@cartoonclouds/contact-normalisers'
```

**Gmail variations (15):**
```typescript
{
  'gamil.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'googlemail.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmali.com': 'gmail.com',
  'gail.com': 'gmail.com',
  'gmeil.com': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmail.cim': 'gmail.com',
  'gmail.vom': 'gmail.com',
  'gmail.c0m': 'gmail.com',
  'gmsil.com': 'gmail.com'
}
```

**Hotmail variations (9):**
```typescript
{
  'hotnail.com': 'hotmail.com',
  'hotmial.com': 'hotmail.com',
  'hotmali.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmil.com': 'hotmail.com',
  'hotmaill.com': 'hotmail.com',
  'hotmail.co': 'hotmail.com',
  'hotmail.con': 'hotmail.com',
  'hotmeil.com': 'hotmail.com'
}
```

**Outlook variations (9):**
```typescript
{
  'outlok.com': 'outlook.com',
  'outllok.com': 'outlook.com',
  'outlool.com': 'outlook.com',
  'outloook.com': 'outlook.com',
  'outlook.co': 'outlook.com',
  'outlook.con': 'outlook.com',
  'outlookl.com': 'outlook.com',
  'outook.com': 'outlook.com',
  'otlook.com': 'outlook.com'
}
```

**Yahoo variations (9):**
```typescript
{
  'yahho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'yahoo.co': 'yahoo.com',
  'yahoo.con': 'yahoo.com',
  'yohoo.com': 'yahoo.com',
  'yhoo.com': 'yahoo.com',
  'yahool.com': 'yahoo.com',
  'yaoo.com': 'yahoo.com'
}
```

**iCloud variations (7):**
```typescript
{
  'icloud.co': 'icloud.com',
  'icloud.con': 'icloud.com',
  'icould.com': 'icloud.com',
  'iclound.com': 'icloud.com',
  'iclod.com': 'icloud.com',
  'iclud.com': 'icloud.com',
  'icaloud.com': 'icloud.com'
}
```

**UK domain comma fixes (6):**
```typescript
{
  'outlook.co,uk': 'outlook.co.uk',
  'hotmail.co,uk': 'hotmail.co.uk',
  'btinternet.co,uk': 'btinternet.co.uk',
  'gmail.co,uk': 'gmail.co.uk',
  'yahoo.co,uk': 'yahoo.co.uk',
  'live.co,uk': 'live.co.uk'
}
```

**Other common providers (9):**
```typescript
{
  'aol.co': 'aol.com',
  'aol.con': 'aol.com',
  'comcast.nte': 'comcast.net',
  'comcas.net': 'comcast.net',
  'verizon.nte': 'verizon.net',
  'verison.net': 'verizon.net',
  'sbcglobal.nte': 'sbcglobal.net',
  'earthlink.nte': 'earthlink.net',
  'cox.nte': 'cox.net'
}
```

**Business/Corporate domains (3):**
```typescript
{
  'compan.com': 'company.com',
  'compnay.com': 'company.com',
  'corperation.com': 'corporation.com'
}
```

**Additional common typos (4):**
```typescript
{
  'live.co': 'live.com',
  'live.con': 'live.com',
  'msn.co': 'msn.com',
  'msn.con': 'msn.com'
}
```

#### Default TLD Corrections (51 corrections)

```typescript
import { DEFAULT_FIX_TLDS } from '@cartoonclouds/contact-normalisers'
```

**Common .com typos (16):**
```typescript
{
  '.cpm': '.com',
  '.con': '.com',
  '.ocm': '.com',
  '.vom': '.com',
  '.co': '.com',
  '.cm': '.com',
  '.om': '.com',
  '.cmo': '.com',
  '.comm': '.com',
  '.comn': '.com',
  '.c0m': '.com',
  '.cim': '.com',
  '.xom': '.com',
  '.fom': '.com',
  '.dom': '.com',
  '.coom': '.com'
}
```

**Common .net typos (10):**
```typescript
{
  '.ne': '.net',
  '.nt': '.net',
  '.bet': '.net',
  '.met': '.net',
  '.jet': '.net',
  '.nett': '.net',
  '.netr': '.net',
  '.het': '.net',
  '.nwt': '.net',
  '.nte': '.net'
}
```

**Common .org typos (8):**
```typescript
{
  '.ogr': '.org',
  '.or': '.org',
  '.og': '.org',
  '.orh': '.org',
  '.orgg': '.org',
  '.orgr': '.org',
  '.0rg': '.org',
  '.prg': '.org'
}
```

**Common .edu typos (5):**
```typescript
{
  '.ed': '.edu',
  '.eud': '.edu',
  '.deu': '.edu',
  '.eduu': '.edu',
  '.wdu': '.edu'
}
```

**UK domain variations (9):**
```typescript
{
  '.co,uk': '.co.uk',  // Comma instead of dot
  '.couk': '.co.uk',   // Missing dot
  '.co.k': '.co.uk',   // Missing 'u'
  '.co.u': '.co.uk',   // Missing 'k'
  '.c.uk': '.co.uk',   // Missing 'o'
  '.co.ik': '.co.uk',  // 'i' instead of 'u'
  '.co.ul': '.co.uk',  // 'l' instead of 'k'
  '.co.ukk': '.co.uk', // Double 'k'
  '.cou.k': '.co.uk'   // Dot misplacement
}
```

**Generic TLD typos (4):**
```typescript
{
  '.inf': '.info',
  '.inof': '.info',
  '.bi': '.biz',
  '.bizz': '.biz'
}
```

**Mobile/New TLD typos (2):**
```typescript
{
  '.mob': '.mobi',
  '.mobile': '.mobi'
}
```

#### Default Blocklist Configuration

```typescript
import { DEFAULT_BLOCKLIST } from '@cartoonclouds/contact-normalisers'

{
  block: {
    // Exact domain matches
    exact: [
      'example.com',
      'test.com', 
      'mailinator.com',
      '10minutemail.com',
      'guerrillamail.com'
    ],
    
    // Domains ending with these suffixes
    suffix: [
      '.example',
      '.test'
    ],
    
    // Wildcard patterns (supports * and ?)
    wildcard: [
      '*.mailinator.com',  // Any subdomain of mailinator.com
      '*.tempmail.*',      // Any domain containing 'tempmail'
      '*.discard.email'    // Any subdomain of discard.email
    ],
    
    // Blocked top-level domains
    tlds: [
      '.test',
      '.invalid', 
      '.example',
      '.localhost'
    ]
  },
  
  // Override blocks for specific domains
  allow: {
    exact: [] // Empty by default - add domains to override blocks
  }
}
```

**Blocklist Behavior:**
- **Exact matching**: Domain must match exactly (case-insensitive)
- **Suffix matching**: Domain must end with the specified suffix  
- **Wildcard matching**: Supports `*` (any characters) and `?` (single character)
- **TLD blocking**: Blocks domains with specific top-level domains
- **Allow overrides**: Domains in the allow list bypass all block rules

## Advanced Usage

### Custom Configuration

```typescript
const result = normaliseEmail('user@custom-typo.co', {
  // Extend built-in domain corrections
  fixDomains: {
    ...DEFAULT_FIX_DOMAINS,
    'mycorp.typo': 'mycorp.com'
  },
  
  // Extend built-in TLD corrections
  fixTlds: {
    ...DEFAULT_FIX_TLDS,
    '.internal': '.com'
  },
  
  // Custom blocklist
  blocklist: {
    block: {
      exact: ['competitor.com'],
      wildcard: ['*.temp.*', '*.disposable.*']
    },
    allow: {
      exact: ['important-temp-domain.com'] // Override blocks
    }
  }
})
```

### Error Handling

```typescript
try {
  const result = normaliseEmail(emailInput)
  
  if (!result.valid) {
    console.log('Validation failed:', result.changes)
    // Handle validation errors
  }
  
  if (result.changeCodes.length > 0) {
    console.log('Email was corrected:', result.changeCodes)
    // Maybe show user what was fixed
  }
  
} catch (error) {
  console.error('Normalization failed:', error)
}
```

### Tree-Shakeable Imports

Import only the functions you need to minimize bundle size:

```typescript
// Individual function imports
import { normaliseEmail } from '@cartoonclouds/contact-normalisers/utils/email/normaliseEmail'
import { validateEmail } from '@cartoonclouds/contact-normalisers/utils/email/validateEmail'
import { aiSuggestEmailDomain } from '@cartoonclouds/contact-normalisers/utils/email/aiSuggestEmail'

// Vue-specific imports
import { useEmail } from '@cartoonclouds/contact-normalisers/composables/useEmail'
import EmailDirective from '@cartoonclouds/contact-normalisers/directives/email'

// Constants only
import { 
  DEFAULT_FIX_DOMAINS, 
  DEFAULT_FIX_TLDS, 
  DEFAULT_BLOCKLIST 
} from '@cartoonclouds/contact-normalisers/utils/email/constants'
```

## Common Use Cases

### Form Validation

```typescript
// Real-time validation with suggestions
const { value, valid, changes, apply } = useEmail('', {
  autoFormat: false // Don't auto-fix, let user decide
})

watch(value, async (newEmail) => {
  if (!valid.value && newEmail.includes('@')) {
    const domain = newEmail.split('@')[1]
    const suggestion = await aiSuggestEmailDomain(domain)
    if (suggestion) {
      // Show suggestion to user
      console.log(`Did you mean: ${newEmail.split('@')[0]}@${suggestion.suggestion}?`)
    }
  }
})
```

### Bulk Email Processing

```typescript
const emails = ['user@gmial.com', 'test@yahoo.co', 'invalid@domain..com']

const results = emails.map(email => {
  const result = normaliseEmail(email)
  return {
    original: email,
    normalized: result.email,
    valid: result.valid,
    changes: result.changes
  }
})

// Filter out invalid emails
const validEmails = results
  .filter(r => r.valid)
  .map(r => r.normalized)
```

### Integration with Forms Libraries

```vue
<!-- With VeeValidate -->
<script setup>
import { useField } from 'vee-validate'
import { useEmail } from '@cartoonclouds/contact-normalisers'

const { value, errorMessage } = useField('email', (value) => {
  const result = normaliseEmail(value)
  return result.valid ? true : result.changes.join(', ')
})

const { email, apply } = useEmail(value)
</script>

<template>
  <input v-model="value" />
  <button @click="apply">Fix Email</button>
  <span v-if="errorMessage">{{ errorMessage }}</span>
</template>
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build package
npm run build

# Generate documentation
npm run docs

# Type check
npm run type-check
```

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests for any improvements.

---

**Note**: The AI-powered domain suggestions require downloading transformer models (~23MB) on first use. This happens automatically in the browser or Node.js environment.
