---
layout: default
title: "MessageCommandOptionBuilder"
has_children: true
has_toc: false
nav_order: 1
---

[Reciple](../README.md) / [Exports](../modules.md) / MessageCommandOptionBuilder

# Class: MessageCommandOptionBuilder

## Table of contents

### Constructors

- [constructor](index.md#constructor)

### Properties

- [description](index.md#description)
- [name](index.md#name)
- [required](index.md#required)
- [validator](index.md#validator)

### Methods

- [setDescription](index.md#setdescription)
- [setName](index.md#setname)
- [setRequired](index.md#setrequired)
- [setValidator](index.md#setvalidator)

## Constructors

### constructor

• **new MessageCommandOptionBuilder**()

## Properties

### description

• **description**: `string` = `''`

#### Defined in

[src/reciple/classes/builders/MessageCommandOptionBuilder.ts:3](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/classes/builders/MessageCommandOptionBuilder.ts#L3)

___

### name

• **name**: `string` = `''`

#### Defined in

[src/reciple/classes/builders/MessageCommandOptionBuilder.ts:2](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/classes/builders/MessageCommandOptionBuilder.ts#L2)

___

### required

• **required**: `boolean` = `false`

#### Defined in

[src/reciple/classes/builders/MessageCommandOptionBuilder.ts:4](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/classes/builders/MessageCommandOptionBuilder.ts#L4)

___

### validator

• **validator**: (`value`: `string`) => `boolean`

#### Type declaration

▸ (`value`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` |

##### Returns

`boolean`

#### Defined in

[src/reciple/classes/builders/MessageCommandOptionBuilder.ts:5](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/classes/builders/MessageCommandOptionBuilder.ts#L5)

## Methods

### setDescription

▸ **setDescription**(`description`): [`MessageCommandOptionBuilder`](index.md)

Set command option description

#### Parameters

| Name | Type |
| :------ | :------ |
| `description` | `string` |

#### Returns

[`MessageCommandOptionBuilder`](index.md)

___

### setName

▸ **setName**(`name`): [`MessageCommandOptionBuilder`](index.md)

Set command option name

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

[`MessageCommandOptionBuilder`](index.md)

___

### setRequired

▸ **setRequired**(`required`): [`MessageCommandOptionBuilder`](index.md)

Set if this option is required

#### Parameters

| Name | Type |
| :------ | :------ |
| `required` | `boolean` |

#### Returns

[`MessageCommandOptionBuilder`](index.md)

___

### setValidator

▸ **setValidator**(`validator`): [`MessageCommandOptionBuilder`](index.md)

Set your custom function to validate given value for this option

#### Parameters

| Name | Type |
| :------ | :------ |
| `validator` | (`value`: `string`) => `boolean` |

#### Returns

[`MessageCommandOptionBuilder`](index.md)
