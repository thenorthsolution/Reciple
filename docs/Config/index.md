---
layout: default
title: "Config"
has_children: true
has_toc: false
nav_order: 1
---

[Reciple](../README.md) / [Exports](../modules.md) / Config

# Interface: Config

## Table of contents

### Properties

- [client](index.md#client)
- [commands](index.md#commands)
- [fileLogging](index.md#filelogging)
- [ignoredChannels](index.md#ignoredchannels)
- [ignoredFiles](index.md#ignoredfiles)
- [messages](index.md#messages)
- [modulesFolder](index.md#modulesfolder)
- [permissions](index.md#permissions)
- [prefix](index.md#prefix)
- [token](index.md#token)
- [version](index.md#version)

## Properties

### client

• **client**: `ClientOptions`

#### Defined in

[src/reciple/classes/Config.ts:54](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/classes/Config.ts#L54)

___

### commands

• **commands**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `interactionCommand` | { `enabled`: `boolean` ; `guilds`: `string` \| `string`[] ; `registerCommands`: `boolean` ; `replyOnError`: `boolean` ; `setRequiredPermissions`: `boolean`  } |
| `interactionCommand.enabled` | `boolean` |
| `interactionCommand.guilds` | `string` \| `string`[] |
| `interactionCommand.registerCommands` | `boolean` |
| `interactionCommand.replyOnError` | `boolean` |
| `interactionCommand.setRequiredPermissions` | `boolean` |
| `messageCommand` | { `allowCommandAlias`: `boolean` ; `commandArgumentSeparator`: `string` ; `enabled`: `boolean` ; `replyOnError`: `boolean`  } |
| `messageCommand.allowCommandAlias` | `boolean` |
| `messageCommand.commandArgumentSeparator` | `string` |
| `messageCommand.enabled` | `boolean` |
| `messageCommand.replyOnError` | `boolean` |

#### Defined in

[src/reciple/classes/Config.ts:18](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/classes/Config.ts#L18)

___

### fileLogging

• **fileLogging**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `debugmode` | `boolean` |
| `enabled` | `boolean` |
| `logFilePath` | `string` |
| `stringifyLoggedJSON` | `boolean` |

#### Defined in

[src/reciple/classes/Config.ts:48](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/classes/Config.ts#L48)

___

### ignoredChannels

• **ignoredChannels**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `channels` | `string`[] |
| `convertToAllowList` | `boolean` |
| `enabled` | `boolean` |

#### Defined in

[src/reciple/classes/Config.ts:43](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/classes/Config.ts#L43)

___

### ignoredFiles

• **ignoredFiles**: `string`[]

#### Defined in

[src/reciple/classes/Config.ts:58](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/classes/Config.ts#L58)

___

### messages

• **messages**: `Object`

#### Index signature

▪ [messageKey: `string`]: `any`

#### Defined in

[src/reciple/classes/Config.ts:55](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/classes/Config.ts#L55)

___

### modulesFolder

• **modulesFolder**: `string`

#### Defined in

[src/reciple/classes/Config.ts:59](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/classes/Config.ts#L59)

___

### permissions

• **permissions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `interactionCommands` | { `commands`: [`ConfigCommandPermissions`](../ConfigCommandPermissions/index.md)[] ; `enabled`: `boolean`  } |
| `interactionCommands.commands` | [`ConfigCommandPermissions`](../ConfigCommandPermissions/index.md)[] |
| `interactionCommands.enabled` | `boolean` |
| `messageCommands` | { `commands`: [`ConfigCommandPermissions`](../ConfigCommandPermissions/index.md)[] ; `enabled`: `boolean`  } |
| `messageCommands.commands` | [`ConfigCommandPermissions`](../ConfigCommandPermissions/index.md)[] |
| `messageCommands.enabled` | `boolean` |

#### Defined in

[src/reciple/classes/Config.ts:33](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/classes/Config.ts#L33)

___

### prefix

• **prefix**: `string`

#### Defined in

[src/reciple/classes/Config.ts:17](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/classes/Config.ts#L17)

___

### token

• **token**: `string`

#### Defined in

[src/reciple/classes/Config.ts:16](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/classes/Config.ts#L16)

___

### version

• **version**: `string`

#### Defined in

[src/reciple/classes/Config.ts:60](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/classes/Config.ts#L60)
