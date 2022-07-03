---
layout: default
title: "MessageCommandBuilder"
has_children: true
has_toc: false
nav_order: 1
---

[Reciple](../README.md) / [Exports](../modules.md) / MessageCommandBuilder

# Class: MessageCommandBuilder

## Table of contents

### Constructors

- [constructor](index.md#constructor)

### Properties

- [aliases](index.md#aliases)
- [allowExecuteByBots](index.md#allowexecutebybots)
- [allowExecuteInDM](index.md#allowexecuteindm)
- [builder](index.md#builder)
- [description](index.md#description)
- [execute](index.md#execute)
- [name](index.md#name)
- [options](index.md#options)
- [requiredPermissions](index.md#requiredpermissions)
- [validateOptions](index.md#validateoptions)

### Methods

- [addAliases](index.md#addaliases)
- [addOption](index.md#addoption)
- [getCommandOptionValues](index.md#getcommandoptionvalues)
- [setAllowExecuteByBots](index.md#setallowexecutebybots)
- [setAllowExecuteInDM](index.md#setallowexecuteindm)
- [setDescription](index.md#setdescription)
- [setExecute](index.md#setexecute)
- [setName](index.md#setname)
- [setRequiredPermissions](index.md#setrequiredpermissions)
- [setValidateOptions](index.md#setvalidateoptions)

## Constructors

### constructor

• **new MessageCommandBuilder**()

## Properties

### aliases

• **aliases**: `string`[] = `[]`

#### Defined in

[src/reciple/classes/builders/MessageCommandBuilder.ts:28](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/classes/builders/MessageCommandBuilder.ts#L28)

___

### allowExecuteByBots

• **allowExecuteByBots**: `boolean` = `false`

#### Defined in

[src/reciple/classes/builders/MessageCommandBuilder.ts:33](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/classes/builders/MessageCommandBuilder.ts#L33)

___

### allowExecuteInDM

• **allowExecuteInDM**: `boolean` = `true`

#### Defined in

[src/reciple/classes/builders/MessageCommandBuilder.ts:32](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/classes/builders/MessageCommandBuilder.ts#L32)

___

### builder

• `Readonly` **builder**: ``"MESSAGE_COMMAND"``

#### Defined in

[src/reciple/classes/builders/MessageCommandBuilder.ts:25](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/classes/builders/MessageCommandBuilder.ts#L25)

___

### description

• **description**: `string` = `''`

#### Defined in

[src/reciple/classes/builders/MessageCommandBuilder.ts:27](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/classes/builders/MessageCommandBuilder.ts#L27)

___

### execute

• **execute**: (`options`: [`RecipleMessageCommandExecute`](../RecipleMessageCommandExecute/index.md)) => `void`

#### Type declaration

▸ (`options`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`RecipleMessageCommandExecute`](../RecipleMessageCommandExecute/index.md) |

##### Returns

`void`

#### Defined in

[src/reciple/classes/builders/MessageCommandBuilder.ts:34](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/classes/builders/MessageCommandBuilder.ts#L34)

___

### name

• **name**: `string` = `''`

#### Defined in

[src/reciple/classes/builders/MessageCommandBuilder.ts:26](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/classes/builders/MessageCommandBuilder.ts#L26)

___

### options

• **options**: [`MessageCommandOptionBuilder`](../MessageCommandOptionBuilder/index.md)[] = `[]`

#### Defined in

[src/reciple/classes/builders/MessageCommandBuilder.ts:29](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/classes/builders/MessageCommandBuilder.ts#L29)

___

### requiredPermissions

• **requiredPermissions**: (`PermissionString` \| `PermissionFlags`)[] = `[]`

#### Defined in

[src/reciple/classes/builders/MessageCommandBuilder.ts:31](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/classes/builders/MessageCommandBuilder.ts#L31)

___

### validateOptions

• **validateOptions**: `boolean` = `false`

#### Defined in

[src/reciple/classes/builders/MessageCommandBuilder.ts:30](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/classes/builders/MessageCommandBuilder.ts#L30)

## Methods

### addAliases

▸ **addAliases**(...`aliases`): [`MessageCommandBuilder`](index.md)

Add aliases to the command

#### Parameters

| Name | Type |
| :------ | :------ |
| `...aliases` | `string`[] |

#### Returns

[`MessageCommandBuilder`](index.md)

___

### addOption

▸ **addOption**(`option`): [`MessageCommandBuilder`](index.md)

Add option to the command

#### Parameters

| Name | Type |
| :------ | :------ |
| `option` | [`MessageCommandOptionBuilder`](../MessageCommandOptionBuilder/index.md) \| (`constructor`: [`MessageCommandOptionBuilder`](../MessageCommandOptionBuilder/index.md)) => [`MessageCommandOptionBuilder`](../MessageCommandOptionBuilder/index.md) |

#### Returns

[`MessageCommandBuilder`](index.md)

___

### getCommandOptionValues

▸ **getCommandOptionValues**(`options`): [`MessageCommandValidatedOption`](../MessageCommandValidatedOption/index.md)[]

validate given command options

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `Command` |

#### Returns

[`MessageCommandValidatedOption`](../MessageCommandValidatedOption/index.md)[]

___

### setAllowExecuteByBots

▸ **setAllowExecuteByBots**(`allowExecuteByBots`): [`MessageCommandBuilder`](index.md)

Allow command to be executed by bots

#### Parameters

| Name | Type |
| :------ | :------ |
| `allowExecuteByBots` | `boolean` |

#### Returns

[`MessageCommandBuilder`](index.md)

___

### setAllowExecuteInDM

▸ **setAllowExecuteInDM**(`allowExecuteInDM`): [`MessageCommandBuilder`](index.md)

Set if command can be executed in dms

#### Parameters

| Name | Type |
| :------ | :------ |
| `allowExecuteInDM` | `boolean` |

#### Returns

[`MessageCommandBuilder`](index.md)

___

### setDescription

▸ **setDescription**(`description`): [`MessageCommandBuilder`](index.md)

Sets the command description

#### Parameters

| Name | Type |
| :------ | :------ |
| `description` | `string` |

#### Returns

[`MessageCommandBuilder`](index.md)

___

### setExecute

▸ **setExecute**(`execute`): [`MessageCommandBuilder`](index.md)

Function when the command is executed

#### Parameters

| Name | Type |
| :------ | :------ |
| `execute` | (`options`: [`RecipleMessageCommandExecute`](../RecipleMessageCommandExecute/index.md)) => `void` |

#### Returns

[`MessageCommandBuilder`](index.md)

___

### setName

▸ **setName**(`name`): [`MessageCommandBuilder`](index.md)

Sets the command name

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

[`MessageCommandBuilder`](index.md)

___

### setRequiredPermissions

▸ **setRequiredPermissions**(`permissions`): [`MessageCommandBuilder`](index.md)

Sets the default required permissions to execute this command

#### Parameters

| Name | Type |
| :------ | :------ |
| `permissions` | (`PermissionString` \| `PermissionFlags`)[] |

#### Returns

[`MessageCommandBuilder`](index.md)

___

### setValidateOptions

▸ **setValidateOptions**(`validateOptions`): [`MessageCommandBuilder`](index.md)

Validate options before executing

#### Parameters

| Name | Type |
| :------ | :------ |
| `validateOptions` | `boolean` |

#### Returns

[`MessageCommandBuilder`](index.md)
