[Reciple](../README.md) / [Exports](../modules.md) / RecipleScript

# Class: RecipleScript

## Table of contents

### Constructors

- [constructor](RecipleScript.md#constructor)

### Properties

- [commands](RecipleScript.md#commands)
- [versions](RecipleScript.md#versions)

### Methods

- [onLoad](RecipleScript.md#onload)
- [onStart](RecipleScript.md#onstart)

## Constructors

### constructor

• **new RecipleScript**()

## Properties

### commands

• `Optional` **commands**: [`recipleCommandBuilders`](../modules.md#reciplecommandbuilders)[]

#### Defined in

[src/reciple/modules.ts:16](https://github.com/FalloutStudios/Reciple/blob/53bf2cd/src/reciple/modules.ts#L16)

___

### versions

• **versions**: `string` \| `string`[]

#### Defined in

[src/reciple/modules.ts:15](https://github.com/FalloutStudios/Reciple/blob/53bf2cd/src/reciple/modules.ts#L15)

## Methods

### onLoad

▸ `Optional` **onLoad**(`reciple`): `void` \| [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `reciple` | [`RecipleClient`](RecipleClient.md)<`boolean`\> |

#### Returns

`void` \| [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`void`\>

___

### onStart

▸ **onStart**(`reciple`): `boolean` \| [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `reciple` | [`RecipleClient`](RecipleClient.md)<`boolean`\> |

#### Returns

`boolean` \| [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`boolean`\>
