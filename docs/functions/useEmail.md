[**@cartoonclouds/email-normaliser v0.1.0**](../README.md)

***

# Function: useEmail()

> **useEmail**(`initial`, `opts`): `object`

Defined in: [composables/useEmail.ts:24](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/composables/useEmail.ts#L24)

Vue composable for email normalization and validation.

Provides reactive email processing with automatic normalization, validation,
and optional auto-formatting. Returns reactive references and helper functions
to manage email input state.

## Parameters

### initial

`string` = `''`

Initial email value (default: '')

### opts

[`UseEmailOptions`](../type-aliases/UseEmailOptions.md) = `{}`

Configuration options

## Returns

Email composable interface

### apply()

> **apply**: () => `void`

Apply the normalized email to the input value.
Updates the input value with the normalized email if they differ.

#### Returns

`void`

### changes

> **changes**: `ComputedRef`\<`string`[]\>

### email

> **email**: `ComputedRef`\<`string` \| `null`\>

### valid

> **valid**: `ComputedRef`\<`boolean`\>

### validate()

> **validate**: () => `boolean`

Manually trigger validation of the current email value.

#### Returns

`boolean`

True if the email is valid (no changes needed), false otherwise

### value

> **value**: `Ref`\<`string`, `string`\>
