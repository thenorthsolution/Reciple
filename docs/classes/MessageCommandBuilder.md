[Reciple](../README.md) / [Exports](../modules.md) / MessageCommandBuilder

# Class: MessageCommandBuilder

## Table of contents

### Constructors

- [constructor](MessageCommandBuilder.md#constructor)

### Properties

- [aliases](MessageCommandBuilder.md#aliases)
- [allowExecuteByBots](MessageCommandBuilder.md#allowexecutebybots)
- [allowExecuteInDM](MessageCommandBuilder.md#allowexecuteindm)
- [builder](MessageCommandBuilder.md#builder)
- [description](MessageCommandBuilder.md#description)
- [execute](MessageCommandBuilder.md#execute)
- [name](MessageCommandBuilder.md#name)
- [options](MessageCommandBuilder.md#options)
- [requiredPermissions](MessageCommandBuilder.md#requiredpermissions)
- [validateOptions](MessageCommandBuilder.md#validateoptions)

### Methods

- [addAliases](MessageCommandBuilder.md#addaliases)
- [addOption](MessageCommandBuilder.md#addoption)
- [getCommandOptionValues](MessageCommandBuilder.md#getcommandoptionvalues)
- [setAllowExecuteByBots](MessageCommandBuilder.md#setallowexecutebybots)
- [setAllowExecuteInDM](MessageCommandBuilder.md#setallowexecuteindm)
- [setDescription](MessageCommandBuilder.md#setdescription)
- [setExecute](MessageCommandBuilder.md#setexecute)
- [setName](MessageCommandBuilder.md#setname)
- [setRequiredPermissions](MessageCommandBuilder.md#setrequiredpermissions)
- [setValidateOptions](MessageCommandBuilder.md#setvalidateoptions)

## Constructors

### constructor

• **new MessageCommandBuilder**()

## Properties

### aliases

• **aliases**: `string`[] = `[]`

#### Defined in

[src/reciple/classes/builders/MessageCommandBuilder.ts:28](https://github.com/FalloutStudios/Reciple/blob/53bf2cd/src/reciple/classes/builders/MessageCommandBuilder.ts#L28)

___

### allowExecuteByBots

• **allowExecuteByBots**: `boolean` = `false`

#### Defined in

[src/reciple/classes/builders/MessageCommandBuilder.ts:33](https://github.com/FalloutStudios/Reciple/blob/53bf2cd/src/reciple/classes/builders/MessageCommandBuilder.ts#L33)

___

### allowExecuteInDM

• **allowExecuteInDM**: `boolean` = `true`

#### Defined in

[src/reciple/classes/builders/MessageCommandBuilder.ts:32](https://github.com/FalloutStudios/Reciple/blob/53bf2cd/src/reciple/classes/builders/MessageCommandBuilder.ts#L32)

___

### builder

• `Readonly` **builder**: ``"MESSAGE_COMMAND"``

#### Defined in

[src/reciple/classes/builders/MessageCommandBuilder.ts:25](https://github.com/FalloutStudios/Reciple/blob/53bf2cd/src/reciple/classes/builders/MessageCommandBuilder.ts#L25)

___

### description

• **description**: `string` = `''`

#### Defined in

[src/reciple/classes/builders/MessageCommandBuilder.ts:27](https://github.com/FalloutStudios/Reciple/blob/53bf2cd/src/reciple/classes/builders/MessageCommandBuilder.ts#L27)

___

### execute

• **execute**: (`options`: [`RecipleMessageCommandExecute`](../interfaces/RecipleMessageCommandExecute.md)) => `void`

#### Type declaration

▸ (`options`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`RecipleMessageCommandExecute`](../interfaces/RecipleMessageCommandExecute.md) |

##### Returns

`void`

#### Defined in

[src/reciple/classes/builders/MessageCommandBuilder.ts:34](https://github.com/FalloutStudios/Reciple/blob/53bf2cd/src/reciple/classes/builders/MessageCommandBuilder.ts#L34)

___

### name

• **name**: `string` = `''`

#### Defined in

[src/reciple/classes/builders/MessageCommandBuilder.ts:26](https://github.com/FalloutStudios/Reciple/blob/53bf2cd/src/reciple/classes/builders/MessageCommandBuilder.ts#L26)

___

### options

• **options**: [`MessageCommandOptionBuilder`](MessageCommandOptionBuilder.md)[] = `[]`

#### Defined in

[src/reciple/classes/builders/MessageCommandBuilder.ts:29](https://github.com/FalloutStudios/Reciple/blob/53bf2cd/src/reciple/classes/builders/MessageCommandBuilder.ts#L29)

___

### requiredPermissions

• **requiredPermissions**: (`PermissionString` \| `PermissionFlags`)[] = `[]`

#### Defined in

[src/reciple/classes/builders/MessageCommandBuilder.ts:31](https://github.com/FalloutStudios/Reciple/blob/53bf2cd/src/reciple/classes/builders/MessageCommandBuilder.ts#L31)

___

### validateOptions

• **validateOptions**: `boolean` = `false`

#### Defined in

[src/reciple/classes/builders/MessageCommandBuilder.ts:30](https://github.com/FalloutStudios/Reciple/blob/53bf2cd/src/reciple/classes/builders/MessageCommandBuilder.ts#L30)

## Methods

### addAliases

▸ **addAliases**(...`aliases`): [`MessageCommandBuilder`](MessageCommandBuilder.md)

Add aliases to the command

#### Parameters

| Name | Type |
| :------ | :------ |
| `...aliases` | `string`[] |

#### Returns

[`MessageCommandBuilder`](MessageCommandBuilder.md)

___

### addOption

▸ **addOption**(`option`): [`MessageCommandBuilder`](MessageCommandBuilder.md)

Add option to the command

#### Parameters

| Name | Type |
| :------ | :------ |
| `option` | [`MessageCommandOptionBuilder`](MessageCommandOptionBuilder.md) \| (`constructor`: [`MessageCommandOptionBuilder`](MessageCommandOptionBuilder.md)) => [`MessageCommandOptionBuilder`](MessageCommandOptionBuilder.md) |

#### Returns

[`MessageCommandBuilder`](MessageCommandBuilder.md)

___

### getCommandOptionValues

▸ **getCommandOptionValues**(`options`): [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]

validate given command options

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `Command` |

#### Returns

[`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]

___

### setAllowExecuteByBots

▸ **setAllowExecuteByBots**(`allowExecuteByBots`): [`MessageCommandBuilder`](MessageCommandBuilder.md)

Allow command to be executed by bots

#### Parameters

| Name | Type |
| :------ | :------ |
| `allowExecuteByBots` | `boolean` |

#### Returns

[`MessageCommandBuilder`](MessageCommandBuilder.md)

___

### setAllowExecuteInDM

▸ **setAllowExecuteInDM**(`allowExecuteInDM`): [`MessageCommandBuilder`](MessageCommandBuilder.md)

Set if command can be executed in dms

#### Parameters

| Name | Type |
| :------ | :------ |
| `allowExecuteInDM` | `boolean` |

#### Returns

[`MessageCommandBuilder`](MessageCommandBuilder.md)

___

### setDescription

▸ **setDescription**(`description`): [`MessageCommandBuilder`](MessageCommandBuilder.md)

Sets the command description

#### Parameters

| Name | Type |
| :------ | :------ |
| `description` | `string` |

#### Returns

[`MessageCommandBuilder`](MessageCommandBuilder.md)

___

### setExecute

▸ **setExecute**(`execute`): [`MessageCommandBuilder`](MessageCommandBuilder.md)

Function when the command is executed

#### Parameters

| Name | Type |
| :------ | :------ |
| `execute` | (`options`: [`RecipleMessageCommandExecute`](../interfaces/RecipleMessageCommandExecute.md)) => `void` |

#### Returns

[`MessageCommandBuilder`](MessageCommandBuilder.md)

___

### setName

▸ **setName**(`name`): [`MessageCommandBuilder`](MessageCommandBuilder.md)

Sets the command name

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

[`MessageCommandBuilder`](MessageCommandBuilder.md)

___

### setRequiredPermissions

▸ **setRequiredPermissions**(`permissions`): [`MessageCommandBuilder`](MessageCommandBuilder.md)

Sets the default required permissions to execute this command

#### Parameters

| Name | Type |
| :------ | :------ |
| `permissions` | (`PermissionString` \| `PermissionFlags`)[] |

#### Returns

[`MessageCommandBuilder`](MessageCommandBuilder.md)

___

### setValidateOptions

▸ **setValidateOptions**(`validateOptions`): [`MessageCommandBuilder`](MessageCommandBuilder.md)

Validate options before executing

#### Parameters

| Name | Type |
| :------ | :------ |
| `validateOptions` | `boolean` |

#### Returns

[`MessageCommandBuilder`](MessageCommandBuilder.md)
