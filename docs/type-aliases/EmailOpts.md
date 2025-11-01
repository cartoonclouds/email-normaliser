[**@cartoonclouds/email-normaliser v0.1.0**](../README.md)

***

# Type Alias: EmailOpts

> **EmailOpts** = [`EmailNormOptions`](EmailNormOptions.md) & `object`

Defined in: [directives/email.ts:17](https://gitlab.com/good-life/glp-frontend/-/blob/main/packages/plugins/email-normaliser/src/directives/email.ts#L17)

Email directive configurations

Usage:
<input v-email="{ autoFormat: true, previewSelector: '#emailPreview' }" />
<input v-email="{ onnormalised: (result) => console.log(result) }" />

## Type Declaration

### autoFormat?

> `optional` **autoFormat**: `boolean`

Automatically format the email input value on input/blur events

#### Default

```ts
false
```

### autoFormatEvents?

> `optional` **autoFormatEvents**: `object`

Auto format events to listen to.

#### Default

```ts
{ onInput: true, onBlur: true }
```

#### autoFormatEvents.onBlur?

> `optional` **onBlur**: `boolean`

#### autoFormatEvents.onInput?

> `optional` **onInput**: `boolean`

### onnormalised()?

> `optional` **onnormalised**: (`r`) => `void`

Callback function called when the email is normalised

#### Parameters

##### r

`ReturnType`\<*typeof* [`normaliseEmail`](../functions/normaliseEmail.md)\>

The result of the normalization

#### Returns

`void`

void

### previewSelector?

> `optional` **previewSelector**: `string`

CSS selector for an element to preview the normalised email and its validity
