import { defineConfig } from 'tsup'

export default defineConfig({
  clean: true,
  dts: true,
  format: ['esm', 'cjs'],
  sourcemap: true,
  entry: {
    index: 'src/index.ts',
    'utils/email/normaliseEmail': 'src/utils/email/normaliseEmail.ts',
    'utils/email/aiSuggestEmail': 'src/utils/email/aiSuggestEmail.ts',
    'utils/email/fuzzyDomainMatching': 'src/utils/email/fuzzyDomainMatching.ts',
    'composables/useEmail': 'src/composables/useEmail.ts',
    'directives/email': 'src/directives/email.ts',
  },
  treeshake: true,
  minify: false,
  splitting: true,
  target: 'es2020',
})
