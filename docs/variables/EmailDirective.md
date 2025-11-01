[**@cartoonclouds/email-normaliser v0.1.0**](../README.md)

***

# Variable: EmailDirective

> **EmailDirective**: `object`

Defined in: [directives/email.ts:138](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/directives/email.ts#L138)

Vue directive for normalizing and validating email inputs.

Usage:
<input v-email="{ autoFormat: true, previewSelector: '#emailPreview' }" />
<input v-email="{ onnormalised: (result) => console.log(result) }" />

The directive emits a 'directive:email:normalised' event when email normalization is complete.

## Type Declaration

### beforeUnmount()

> **beforeUnmount**(`el`): `void`

Cleans up event listeners and state when the directive is unbound.

#### Parameters

##### el

`HTMLInputElement`

The element the directive is bound to

#### Returns

`void`

### mounted()

> **mounted**(`el`, `binding`): `void`

#### Parameters

##### el

`HTMLInputElement`

##### binding

###### value?

[`EmailOpts`](../type-aliases/EmailOpts.md)

#### Returns

`void`

### updated()

> **updated**(`el`, `binding`): `void`

Runs the normalisation process and updates the email directive's options and preview element.

#### Parameters

##### el

`HTMLInputElement`

The element the directive is bound to

##### binding

The directive binding

###### value?

[`EmailOpts`](../type-aliases/EmailOpts.md)

#### Returns

`void`

## Param

The element the directive is bound to

## Param

The directive binding

## Returns
