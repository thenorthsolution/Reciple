[Reciple](../README.md) / [Exports](../modules.md) / MessageCommandOptionBuilder

# Class: MessageCommandOptionBuilder

## Table of contents

### Constructors

- [constructor](MessageCommandOptionBuilder.md#constructor)

### Properties

- [description](MessageCommandOptionBuilder.md#description)
- [name](MessageCommandOptionBuilder.md#name)
- [required](MessageCommandOptionBuilder.md#required)
- [validator](MessageCommandOptionBuilder.md#validator)

### Methods

- [setDescription](MessageCommandOptionBuilder.md#setdescription)
- [setName](MessageCommandOptionBuilder.md#setname)
- [setRequired](MessageCommandOptionBuilder.md#setrequired)
- [setValidator](MessageCommandOptionBuilder.md#setvalidator)

## Constructors

### constructor

• **new MessageCommandOptionBuilder**()

## Properties

### description

• **description**: `string` = `''`

#### Defined in

[src/reciple/classes/builders/MessageCommandOptionBuilder.ts:3](https://github.com/FalloutStudios/Reciple/blob/53bf2cd/src/reciple/classes/builders/MessageCommandOptionBuilder.ts#L3)

___

### name

• **name**: `string` = `''`

#### Defined in

[src/reciple/classes/builders/MessageCommandOptionBuilder.ts:2](https://github.com/FalloutStudios/Reciple/blob/53bf2cd/src/reciple/classes/builders/MessageCommandOptionBuilder.ts#L2)

___

### required

• **required**: `boolean` = `false`

#### Defined in

[src/reciple/classes/builders/MessageCommandOptionBuilder.ts:4](https://github.com/FalloutStudios/Reciple/blob/53bf2cd/src/reciple/classes/builders/MessageCommandOptionBuilder.ts#L4)

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

[src/reciple/classes/builders/MessageCommandOptionBuilder.ts:5](https://github.com/FalloutStudios/Reciple/blob/53bf2cd/src/reciple/classes/builders/MessageCommandOptionBuilder.ts#L5)

## Methods

### setDescription

▸ **setDescription**(`description`): [`MessageCommandOptionBuilder`](MessageCommandOptionBuilder.md)

Set command option description

#### Parameters

| Name | Type |
| :------ | :------ |
| `description` | `string` |

#### Returns

[`MessageCommandOptionBuilder`](MessageCommandOptionBuilder.md)

___

### setName

▸ **setName**(`name`): [`MessageCommandOptionBuilder`](MessageCommandOptionBuilder.md)

Set command option name

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

[`MessageCommandOptionBuilder`](MessageCommandOptionBuilder.md)

___

### setRequired

▸ **setRequired**(`required`): [`MessageCommandOptionBuilder`](MessageCommandOptionBuilder.md)

Set if this option is required

#### Parameters

| Name | Type |
| :------ | :------ |
| `required` | `boolean` |

#### Returns

[`MessageCommandOptionBuilder`](MessageCommandOptionBuilder.md)

___

### setValidator

▸ **setValidator**(`validator`): [`MessageCommandOptionBuilder`](MessageCommandOptionBuilder.md)

Set your custom function to validate given value for this option

#### Parameters

| Name | Type |
| :------ | :------ |
| `validator` | (`value`: `string`) => `boolean` |

#### Returns

[`MessageCommandOptionBuilder`](MessageCommandOptionBuilder.md)
