# Development Guide

This document provides comprehensive information for developers working on the `@cartoonclouds/email-normaliser` package.

## Local Development Setup

```bash
# Install dependencies (from the package directory)
npm install

# Build the package (required before using in the main project)
npm run build

# Run tests with coverage (100% coverage achieved for fuzzy matching)
npm test

# Run tests in watch mode during development
npm run test:watch

# Generate documentation
npm run docs

# Lint code
npm run lint
```

## Using in the Main Project

If you're working within the monorepo, the package is installed as a local dependency:

```json
{
  "dependencies": {
    "@cartoonclouds/email-normaliser": "./packages/plugins/email-normaliser"
  }
}
```

### Development Workflow

1. **Build the package**: `npm run build`
2. **Reinstall in main project**: `cd ../../ && npm install`
3. **Restart dev server**: changes will be reflected

### Hot Reload Development

```bash
npm run dev  # tsup watch
```

### Type Development Workflow

When working with the centralized type system:

1. **Adding New Types**:
   ```bash
   # Edit types in src/utils/email/types.ts
   # Add comprehensive JSDoc documentation
   # Include usage examples
   ```

2. **Type Validation**:
   ```bash
   npm run build  # Validates all type references
   npm test       # Ensures type consistency in tests
   ```

3. **IDE Integration**:
   - Use "Go to Definition" to navigate to centralized types
   - Leverage IntelliSense for comprehensive type information
   - Utilize JSDoc hover information for usage examples

## Package Structure

```
packages/plugins/email-normaliser/
├── src/
│   ├── directives/     # Vue directives
│   │   └── email.ts
│   ├── composables/    # Vue composables
│   │   └── useEmail.ts
│   ├── utils/
│   │   └── email/
│   │       ├── types.ts               # ⭐ Centralized type definitions
│   │       ├── normaliseEmail.ts       # Core normalization logic
│   │       ├── validateEmail.ts        # Validation functions
│   │       ├── aiSuggestEmail.ts       # AI-powered suggestions
│   │       ├── fuzzyDomainMatching.ts  # Levenshtein & closest-domain
│   │       └── constants.ts            # Default configs & candidates
│   └── index.ts
├── test/
│   ├── emailDirective.spec.ts
│   ├── normaliseEmail.spec.ts
│   ├── validateEmail.spec.ts
│   ├── useEmail.spec.ts
│   ├── fuzzyDomainMatching.spec.ts
│   └── aiSuggestEmail.spec.ts
├── dist/
├── coverage/
├── docs/
└── README.md
```

## Type System Architecture

### Centralized Type Definitions

All TypeScript types are consolidated in `src/utils/email/types.ts` for improved maintainability and developer experience. This centralized approach provides:

#### Benefits
- **Single Source of Truth**: All types defined in one location
- **Consistent Documentation**: Comprehensive JSDoc with examples for all types
- **Better Maintainability**: Changes only need to be made once
- **Improved Tree Shaking**: Import only needed types
- **Enhanced Developer Experience**: Easier type discovery and IDE support

#### Type Categories
- **Validation**: `ValidationResult`, `ValidationResults`, `EmailValidationOptions`
- **Normalization**: `EmailNormResult`, `EmailNormOptions`, `EmailBlockConfig`, `EmailFixResult`
- **Fuzzy Matching**: `DomainCandidate`, `ClosestDomainResult`, `FindClosestOptions`
- **AI/ML**: `AiEmailSuggestion`, `AiEmailOptions`
- **Vue Integration**: `UseEmailOptions`

### Development Guidelines

#### Adding New Types
1. Define types in `src/utils/email/types.ts` with comprehensive JSDoc
2. Include usage examples in the documentation
3. Export from main `index.ts` if they're part of the public API
4. Update tests to use centralized types
5. Update README examples to reference the centralized types

#### Type Import Patterns
```typescript
// ✅ Preferred: Import from centralized types module
import type { EmailNormOptions, ValidationResult } from '../utils/email/types'

// ❌ Avoid: Local type definitions in utility modules  
// export type EmailNormOptions = { ... } // Don't do this anymore

// ✅ Public API exports (main package)
import type { EmailNormResult } from '@cartoonclouds/email-normaliser'
```

#### Migration Guidelines
When adding new functionality:
1. Define types first in `types.ts`
2. Import types in implementation files
3. Ensure all exports use centralized types
4. Update tests to use centralized type imports
5. Document type relationships and dependencies

## Testing

### Test Coverage

- **Overall**: 99%+ statements/lines, 100% functions in fuzzy matching
- **Modules**
  - `useEmail.ts`: 100% across the board
  - `email.ts` (directive): ~98% lines
  - `normaliseEmail.ts`: ~99% lines
  - `validateEmail.ts`: ~96% lines
  - `fuzzyDomainMatching.ts`: 100% lines/statements/functions, ~97% branches (one unreachable defensive branch)
  - `aiSuggestEmail.ts`: 100%

### Test Distribution & Key Areas

- **Email Directive**: 44 tests covering lifecycle, DOM interactions, SSR-ish jsdom
- **Email Normalization**: 100 tests for all transformation rules, ASCII conversion, edge cases  
- **Email Validation**: 110 tests for all rules, custom options, blocklist behavior
- **Composable**: 34 tests for reactivity & integration
- **Fuzzy Domain Matching**: 52 tests covering:
  - `levenshtein()` algorithm suite: exact/empty, insert/delete/substitute, early-exit, char-code paths
  - `findClosestDomain()` suite: exact matches, fuzzy typo correction, custom candidates/thresholds, normalization, large sets, Unicode
- **AI Suggestions**: 48 tests including suggestion logic, error handling, and advanced TypeScript mocking strategies
- **AI Integration**: 3 tests for end-to-end AI normalization workflows

#### Running Tests

```bash
npm test
npm run test:watch
npx vitest run test/fuzzyDomainMatching.spec.ts
npx vitest run test/aiSuggestEmail.spec.ts  # AI-specific tests with mock strategies
npx vitest run --coverage
```

### TypeScript Testing Strategies

#### Complex Interface Mocking

For third-party libraries with complex interfaces (like `@xenova/transformers`), we use simplified mocking strategies:

```typescript
// Instead of implementing full interfaces
const mockExtractor = vi.fn() as any

// This provides test efficiency while maintaining test reliability
// Full type safety is preserved in production code
```

#### AI Model Testing

The `aiSuggestEmail.spec.ts` file demonstrates advanced patterns for testing ML/AI integrations:

- **Simplified Mocks**: Using `vi.fn() as any` for complex pipeline interfaces
- **Embedding Testing**: Mock vector operations without full transformer implementation  
- **Confidence Testing**: Validate AI confidence thresholds and similarity calculations

## Building

Uses **tsup** for fast dual-builds and types.

```bash
npm run build
npm run dev
```

Outputs:
- **ESM**: `dist/index.js`
- **CJS**: `dist/index.cjs`
- **Types**: `dist/index.d.ts`
- **Source maps** for both

## Documentation

Generate API docs with **TypeDoc**:

```bash
npm run docs
```

### Public API (Reference)

> (Consolidated from previous sections, including fuzzy matching + custom options)

```ts
// Fuzzy algorithms
export function levenshtein(a: string, b: string, maxDistance?: number): number

export interface FindClosestOptions {
  candidates?: readonly string[]
  maxDistance?: number
  normalise?: boolean
}
export interface ClosestDomainResult {
  input: string
  match?: string
  distance: number
}
export function findClosestDomain(input: string, options?: FindClosestOptions): ClosestDomainResult

// Validation/normalisation options
export type EmailBlockConfig = (email: string) => boolean | RegExp[] | string[]

export type EmailValidationOptions = {
  blocklist?: EmailBlockConfig
  fixDomains?: Record<string, string>
  fixTlds?: Record<string, string>
  asciiOnly?: boolean
}
export type EmailNormOptions = EmailValidationOptions

export function validateEmail(email: string, options?: EmailValidationOptions): ValidationResults
export function normaliseEmail(email: string, options?: EmailNormOptions): EmailNormResult
```

#### JSDoc Standards

Document public APIs with examples:

```ts
/**
 * normalise and validate an email address.
 * @example
 * const r = normaliseEmail('user@gamil.com')
 * r.email  // 'user@gmail.com'
 * r.valid  // true
 */
```

## Code Quality

- ESLint + TS strict
- Typed public surface
- Generic & branded types where appropriate

## Adding New Features

### Email Normalization Rules

1. Update `src/utils/email/constants.ts`
2. Update `src/utils/email/normaliseEmail.ts`
3. Add comprehensive tests
4. Update docs & examples

### Fuzzy Domain Matching *(merged from Recent Features)*

- Algorithms live in `src/utils/email/fuzzyDomainMatching.ts`
- Extend `DEFAULT_AI_EMBEDDING_CANDIDATES` in `constants.ts` if adding built-in domains
- Keep `FindClosestOptions` conservative; ship safe defaults
- Ensure early-exit/threshold changes include perf tests
- Maintain 100% statement/line/function coverage for this module

### Custom Validation Options *(merged from Recent Features)*

- Options accepted by **both** `validateEmail` and `normaliseEmail`
  - `fixDomains`, `fixTlds`: **merge** with 67+ built-ins
  - `blocklist`: **replaces** default when provided
  - `asciiOnly`: off by default; enables transliteration + strict validation

## Release Process

1. Bump version in `package.json`
2. `npm run build`
3. `npm test`
4. `npm run docs`
5. Commit + tag

## API Compatibility

### Backward Compatible (current)

- All new params optional with sensible defaults
- Existing calls unchanged (`validateEmail(email)`, `normaliseEmail(email)`)
- Return shapes preserved
- International characters still allowed by default

### New Functionality *(merged)*

- **Fuzzy matching**: `levenshtein()` + `findClosestDomain()` with configurable candidates/thresholds
- **Options**: `fixDomains`, `fixTlds`, `blocklist`, `asciiOnly`
- **ASCII-Only Mode**:
  - transliteration (e.g., ü→u, ñ→n, ß→ss)
  - change code: `CONVERTED_TO_ASCII`
  - validation code: `NON_ASCII_CHARACTERS`

### Migration Guide

No changes required:

```ts
// still works
const r = normaliseEmail('user@gmail.com')
const v = validateEmail('user@example.com')

// new options
const r2 = normaliseEmail('üser@typo.co', {
  asciiOnly: true,
  fixDomains: { 'typo.co': 'example.com' },
})
```

## Contributing Guidelines

- Add/maintain tests; don’t regress coverage
- Follow established patterns & strict TS
- JSDoc public APIs
- Test built artefacts too
- Add i18n/ASCII tests when relevant
- Validate backward compatibility for option additions

## Troubleshooting

**Import resolution**
```bash
npm run build
cd ../../ && npm install
```

**Type errors**
```bash
npx tsc --noEmit
npm run build
```

**TypeScript interface mocking issues**
For complex third-party interfaces, use simplified mocking:
```typescript
// Instead of full interface implementation
const mockPipeline = vi.fn() as any
// Provides test efficiency while maintaining reliability
```

**Tests**
```bash
npx vitest run --reporter=verbose
npx vitest run test/specific-test.spec.ts
npx vitest run test/aiSuggestEmail.spec.ts  # AI testing with simplified mocks
```

### Performance Notes

- AI suggestion models download on first use (~23MB)
- Outputs are tree-shakeable; prefer targeted imports
- For fuzzy matching thresholds, validate with large candidate sets
