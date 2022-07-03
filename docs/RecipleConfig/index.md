---
layout: default
title: "RecipleConfig"
has_children: true
has_toc: false
nav_order: 1
---

[Reciple](../README.md) / [Exports](../modules.md) / RecipleConfig

# Class: RecipleConfig

## Table of contents

### Constructors

- [constructor](index.md#constructor)

### Properties

- [config](index.md#config)
- [configPath](index.md#configpath)

### Methods

- [askToken](index.md#asktoken)
- [getConfig](index.md#getconfig)
- [isSupportedConfig](index.md#issupportedconfig)
- [parseConfig](index.md#parseconfig)
- [parseToken](index.md#parsetoken)

## Constructors

### constructor

• **new RecipleConfig**(`configPath`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `configPath` | `string` |

## Properties

### config

• `Optional` **config**: [`Config`](../Config/index.md)

#### Defined in

[src/reciple/classes/Config.ts:64](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/classes/Config.ts#L64)

___

### configPath

• **configPath**: `string` = `'./reciple.yml'`

#### Defined in

[src/reciple/classes/Config.ts:65](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/classes/Config.ts#L65)

## Methods

### askToken

▸ `Private` **askToken**(): ``null`` \| `string`

#### Returns

``null`` \| `string`

___

### getConfig

▸ **getConfig**(): [`Config`](../Config/index.md)

#### Returns

[`Config`](../Config/index.md)

___

### isSupportedConfig

▸ `Private` **isSupportedConfig**(): `boolean`

#### Returns

`boolean`

___

### parseConfig

▸ **parseConfig**(): [`RecipleConfig`](index.md)

#### Returns

[`RecipleConfig`](index.md)

___

### parseToken

▸ **parseToken**(`askIfNull?`): ``null`` \| `string`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `askIfNull` | `boolean` | `true` |

#### Returns

``null`` \| `string`
