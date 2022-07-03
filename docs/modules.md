---
layout: default
title: "Reciple"
has_children: true
has_toc: false
nav_order: 1
---

[Reciple](README.md) / Exports

# Reciple

## Table of contents

### Classes

- [InteractionCommandBuilder](InteractionCommandBuilder/index.md)
- [MessageCommandBuilder](MessageCommandBuilder/index.md)
- [MessageCommandOptionBuilder](MessageCommandOptionBuilder/index.md)
- [MessageCommandOptions](MessageCommandOptions/index.md)
- [RecipleClient](RecipleClient/index.md)
- [RecipleConfig](RecipleConfig/index.md)
- [RecipleScript](RecipleScript/index.md)

### Interfaces

- [Config](Config/index.md)
- [ConfigCommandPermissions](ConfigCommandPermissions/index.md)
- [MessageCommandValidatedOption](MessageCommandValidatedOption/index.md)
- [RecipleClientCommands](RecipleClientCommands/index.md)
- [RecipleClientEvents](RecipleClientEvents/index.md)
- [RecipleClientOptions](RecipleClientOptions/index.md)
- [RecipleInteractionCommandExecute](RecipleInteractionCommandExecute/index.md)
- [RecipleMessageCommandExecute](RecipleMessageCommandExecute/index.md)
- [RecipleModule](RecipleModule/index.md)

### Type Aliases

- [interactionCommandBuilders](modules.md#interactioncommandbuilders)
- [loadedModules](modules.md#loadedmodules)
- [recipleCommandBuilders](modules.md#reciplecommandbuilders)
- [recipleCommandBuildersExecute](modules.md#reciplecommandbuildersexecute)

### Variables

- [discordjs](modules.md#discordjs)
- [flags](modules.md#flags)
- [token](modules.md#token)
- [version](modules.md#version)

### Functions

- [hasPermissions](modules.md#haspermissions)
- [isIgnoredChannel](modules.md#isignoredchannel)
- [isSupportedVersion](modules.md#issupportedversion)
- [isValidVersion](modules.md#isvalidversion)
- [loadModules](modules.md#loadmodules)
- [logger](modules.md#logger)
- [parseVersion](modules.md#parseversion)
- [registerInteractionCommands](modules.md#registerinteractioncommands)

## Type Aliases

### interactionCommandBuilders

Ƭ **interactionCommandBuilders**: [`InteractionCommandBuilder`](InteractionCommandBuilder/index.md) \| `ContextMenuCommandBuilder` \| `SlashCommandBuilder` \| `SlashCommandSubcommandBuilder` \| `SlashCommandOptionsOnlyBuilder` \| `SlashCommandSubcommandGroupBuilder` \| `SlashCommandSubcommandsOnlyBuilder`

#### Defined in

[src/reciple/registerInteractionCommands.ts:14](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/registerInteractionCommands.ts#L14)

___

### loadedModules

Ƭ **loadedModules**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `commands` | [`recipleCommandBuilders`](modules.md#reciplecommandbuilders)[] |
| `modules` | [`RecipleModule`](RecipleModule/index.md)[] |

#### Defined in

[src/reciple/modules.ts:12](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/modules.ts#L12)

___

### recipleCommandBuilders

Ƭ **recipleCommandBuilders**: [`MessageCommandBuilder`](MessageCommandBuilder/index.md) \| [`InteractionCommandBuilder`](InteractionCommandBuilder/index.md)

#### Defined in

[src/reciple/modules.ts:10](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/modules.ts#L10)

___

### recipleCommandBuildersExecute

Ƭ **recipleCommandBuildersExecute**: [`RecipleInteractionCommandExecute`](RecipleInteractionCommandExecute/index.md) \| [`RecipleMessageCommandExecute`](RecipleMessageCommandExecute/index.md)

#### Defined in

[src/reciple/modules.ts:11](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/modules.ts#L11)

## Variables

### discordjs

• `Const` **discordjs**: `__module` = `discord`

#### Defined in

[src/index.ts:3](https://github.com/FalloutStudios/Reciple/blob/668601a/src/index.ts#L3)

___

### flags

• `Const` **flags**: `OptionValues`

#### Defined in

[src/reciple/flags.ts:4](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/flags.ts#L4)

___

### token

• `Const` **token**: `any` = `flags.token`

#### Defined in

[src/reciple/flags.ts:11](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/flags.ts#L11)

___

### version

• `Const` **version**: `string`

#### Defined in

[src/reciple/version.ts:4](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/version.ts#L4)

## Functions

### hasPermissions

▸ **hasPermissions**(`commandName`, `memberPermissions?`, `configConmmandPermissions?`, `builder?`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `commandName` | `string` |
| `memberPermissions?` | `Permissions` |
| `configConmmandPermissions?` | { `commands`: [`ConfigCommandPermissions`](ConfigCommandPermissions/index.md)[] ; `enabled`: `boolean`  } \| { `commands`: [`ConfigCommandPermissions`](ConfigCommandPermissions/index.md)[] ; `enabled`: `boolean`  } |
| `builder?` | [`recipleCommandBuilders`](modules.md#reciplecommandbuilders) |

#### Returns

`boolean`

___

### isIgnoredChannel

▸ **isIgnoredChannel**(`channelId`, `ignoredChannelsConfig?`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `channelId` | `string` |
| `ignoredChannelsConfig?` | `Object` |
| `ignoredChannelsConfig.channels` | `string`[] |
| `ignoredChannelsConfig.convertToAllowList` | `boolean` |
| `ignoredChannelsConfig.enabled` | `boolean` |

#### Returns

`boolean`

___

### isSupportedVersion

▸ **isSupportedVersion**(`versionRange`, `supportedVersion?`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `versionRange` | `string` |
| `supportedVersion?` | `string` |

#### Returns

`boolean`

___

### isValidVersion

▸ **isValidVersion**(`ver`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `ver` | `string` |

#### Returns

`boolean`

___

### loadModules

▸ **loadModules**(`client`): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<[`loadedModules`](modules.md#loadedmodules)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `client` | [`RecipleClient`](RecipleClient/index.md)<`boolean`\> |

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<[`loadedModules`](modules.md#loadedmodules)\>

___

### logger

▸ **logger**(`stringifyJSON`, `debugmode?`): `Logger`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `stringifyJSON` | `boolean` | `undefined` |
| `debugmode` | `boolean` | `false` |

#### Returns

`Logger`

___

### parseVersion

▸ **parseVersion**(`ver`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `ver` | `string` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `major` | `number` |
| `minor` | `number` |
| `patch` | `number` |

___

### registerInteractionCommands

▸ **registerInteractionCommands**(`client`, `cmds?`, `overwriteGuilds?`): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `client` | [`RecipleClient`](RecipleClient/index.md)<`boolean`\> |
| `cmds?` | ([`interactionCommandBuilders`](modules.md#interactioncommandbuilders) \| `ApplicationCommandDataResolvable`)[] |
| `overwriteGuilds?` | `string` \| `string`[] |

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`void`\>
