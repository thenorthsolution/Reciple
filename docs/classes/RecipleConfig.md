[Reciple](../README.md) / [Exports](../modules.md) / RecipleConfig

# Class: RecipleConfig

## Table of contents

### Constructors

- [constructor](RecipleConfig.md#constructor)

### Properties

- [config](RecipleConfig.md#config)
- [configPath](RecipleConfig.md#configpath)

### Methods

- [askToken](RecipleConfig.md#asktoken)
- [getConfig](RecipleConfig.md#getconfig)
- [isSupportedConfig](RecipleConfig.md#issupportedconfig)
- [parseConfig](RecipleConfig.md#parseconfig)
- [parseToken](RecipleConfig.md#parsetoken)

## Constructors

### constructor

• **new RecipleConfig**(`configPath`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `configPath` | `string` |

## Properties

### config

• `Optional` **config**: [`Config`](../interfaces/Config.md)

#### Defined in

[src/reciple/classes/Config.ts:64](https://github.com/FalloutStudios/Reciple/blob/53bf2cd/src/reciple/classes/Config.ts#L64)

___

### configPath

• **configPath**: `string` = `'./reciple.yml'`

#### Defined in

[src/reciple/classes/Config.ts:65](https://github.com/FalloutStudios/Reciple/blob/53bf2cd/src/reciple/classes/Config.ts#L65)

## Methods

### askToken

▸ `Private` **askToken**(): ``null`` \| `string`

#### Returns

``null`` \| `string`

___

### getConfig

▸ **getConfig**(): [`Config`](../interfaces/Config.md)

#### Returns

[`Config`](../interfaces/Config.md)

___

### isSupportedConfig

▸ `Private` **isSupportedConfig**(): `boolean`

#### Returns

`boolean`

___

### parseConfig

▸ **parseConfig**(): [`RecipleConfig`](RecipleConfig.md)

#### Returns

[`RecipleConfig`](RecipleConfig.md)

___

### parseToken

▸ **parseToken**(`askIfNull?`): ``null`` \| `string`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `askIfNull` | `boolean` | `true` |

#### Returns

``null`` \| `string`
