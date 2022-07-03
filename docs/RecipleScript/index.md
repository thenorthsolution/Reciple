---
layout: default
title: "RecipleScript"
has_children: true
has_toc: false
nav_order: 1
---

[Reciple](../README.md) / [Exports](../modules.md) / RecipleScript

# Class: RecipleScript

## Table of contents

### Constructors

- [constructor](index.md#constructor)

### Properties

- [commands](index.md#commands)
- [versions](index.md#versions)

### Methods

- [onLoad](index.md#onload)
- [onStart](index.md#onstart)

## Constructors

### constructor

• **new RecipleScript**()

## Properties

### commands

• `Optional` **commands**: [`recipleCommandBuilders`](../modules.md#reciplecommandbuilders)[]

#### Defined in

[src/reciple/modules.ts:16](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/modules.ts#L16)

___

### versions

• **versions**: `string` \| `string`[]

#### Defined in

[src/reciple/modules.ts:15](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/modules.ts#L15)

## Methods

### onLoad

▸ `Optional` **onLoad**(`reciple`): `void` \| [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `reciple` | [`RecipleClient`](../RecipleClient/index.md)<`boolean`\> |

#### Returns

`void` \| [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`void`\>

___

### onStart

▸ **onStart**(`reciple`): `boolean` \| [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `reciple` | [`RecipleClient`](../RecipleClient/index.md)<`boolean`\> |

#### Returns

`boolean` \| [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`boolean`\>
