[Reciple](../README.md) / [Exports](../modules.md) / InteractionCommandBuilder

# Class: InteractionCommandBuilder

## Hierarchy

- `SlashCommandBuilder`

  ↳ **`InteractionCommandBuilder`**

## Table of contents

### Constructors

- [constructor](InteractionCommandBuilder.md#constructor)

### Properties

- [allowExecuteInDM](InteractionCommandBuilder.md#allowexecuteindm)
- [builder](InteractionCommandBuilder.md#builder)
- [default\_member\_permissions](InteractionCommandBuilder.md#default_member_permissions)
- [default\_permission](InteractionCommandBuilder.md#default_permission)
- [description](InteractionCommandBuilder.md#description)
- [description\_localizations](InteractionCommandBuilder.md#description_localizations)
- [dm\_permission](InteractionCommandBuilder.md#dm_permission)
- [execute](InteractionCommandBuilder.md#execute)
- [name](InteractionCommandBuilder.md#name)
- [name\_localizations](InteractionCommandBuilder.md#name_localizations)
- [options](InteractionCommandBuilder.md#options)
- [requiredPermissions](InteractionCommandBuilder.md#requiredpermissions)

### Methods

- [addAttachmentOption](InteractionCommandBuilder.md#addattachmentoption)
- [addBooleanOption](InteractionCommandBuilder.md#addbooleanoption)
- [addChannelOption](InteractionCommandBuilder.md#addchanneloption)
- [addIntegerOption](InteractionCommandBuilder.md#addintegeroption)
- [addMentionableOption](InteractionCommandBuilder.md#addmentionableoption)
- [addNumberOption](InteractionCommandBuilder.md#addnumberoption)
- [addRoleOption](InteractionCommandBuilder.md#addroleoption)
- [addStringOption](InteractionCommandBuilder.md#addstringoption)
- [addSubcommand](InteractionCommandBuilder.md#addsubcommand)
- [addSubcommandGroup](InteractionCommandBuilder.md#addsubcommandgroup)
- [addUserOption](InteractionCommandBuilder.md#adduseroption)
- [setAllowExecuteInDM](InteractionCommandBuilder.md#setallowexecuteindm)
- [setDMPermission](InteractionCommandBuilder.md#setdmpermission)
- [setDefaultMemberPermissions](InteractionCommandBuilder.md#setdefaultmemberpermissions)
- [setDefaultPermission](InteractionCommandBuilder.md#setdefaultpermission)
- [setDescription](InteractionCommandBuilder.md#setdescription)
- [setDescriptionLocalization](InteractionCommandBuilder.md#setdescriptionlocalization)
- [setDescriptionLocalizations](InteractionCommandBuilder.md#setdescriptionlocalizations)
- [setExecute](InteractionCommandBuilder.md#setexecute)
- [setName](InteractionCommandBuilder.md#setname)
- [setNameLocalization](InteractionCommandBuilder.md#setnamelocalization)
- [setNameLocalizations](InteractionCommandBuilder.md#setnamelocalizations)
- [setRequiredPermissions](InteractionCommandBuilder.md#setrequiredpermissions)
- [toJSON](InteractionCommandBuilder.md#tojson)

## Constructors

### constructor

• **new InteractionCommandBuilder**()

#### Inherited from

SlashCommandBuilder.constructor

## Properties

### allowExecuteInDM

• **allowExecuteInDM**: `boolean` = `true`

#### Defined in

[src/reciple/classes/builders/InteractionCommandBuilder.ts:16](https://github.com/FalloutStudios/Reciple/blob/53bf2cd/src/reciple/classes/builders/InteractionCommandBuilder.ts#L16)

___

### builder

• `Readonly` **builder**: ``"INTERACTION_COMMAND"``

#### Defined in

[src/reciple/classes/builders/InteractionCommandBuilder.ts:14](https://github.com/FalloutStudios/Reciple/blob/53bf2cd/src/reciple/classes/builders/InteractionCommandBuilder.ts#L14)

___

### default\_member\_permissions

• `Readonly` **default\_member\_permissions**: `undefined` \| ``null`` \| `string`

Set of permissions represented as a bit set for the command

#### Inherited from

SlashCommandBuilder.default\_member\_permissions

#### Defined in

node_modules/@discordjs/builders/dist/index.d.ts:1158

___

### default\_permission

• `Readonly` **default\_permission**: `undefined` \| `boolean`

Whether the command is enabled by default when the app is added to a guild

**`Deprecated`**

 This property is deprecated and will be removed in the future.
You should use `setDefaultMemberPermissions` or `setDMPermission` instead.

#### Inherited from

SlashCommandBuilder.default\_permission

#### Defined in

node_modules/@discordjs/builders/dist/index.d.ts:1154

___

### description

• `Readonly` **description**: `string`

The description of this slash command

#### Inherited from

SlashCommandBuilder.description

#### Defined in

node_modules/@discordjs/builders/dist/index.d.ts:1139

___

### description\_localizations

• `Optional` `Readonly` **description\_localizations**: `Partial`<`Record`<``"en-US"`` \| ``"en-GB"`` \| ``"bg"`` \| ``"zh-CN"`` \| ``"zh-TW"`` \| ``"hr"`` \| ``"cs"`` \| ``"da"`` \| ``"nl"`` \| ``"fi"`` \| ``"fr"`` \| ``"de"`` \| ``"el"`` \| ``"hi"`` \| ``"hu"`` \| ``"it"`` \| ``"ja"`` \| ``"ko"`` \| ``"lt"`` \| ``"no"`` \| ``"pl"`` \| ``"pt-BR"`` \| ``"ro"`` \| ``"ru"`` \| ``"es-ES"`` \| ``"sv-SE"`` \| ``"th"`` \| ``"tr"`` \| ``"uk"`` \| ``"vi"``, ``null`` \| `string`\>\>

The localized descriptions for this command

#### Inherited from

SlashCommandBuilder.description\_localizations

#### Defined in

node_modules/@discordjs/builders/dist/index.d.ts:1143

___

### dm\_permission

• `Readonly` **dm\_permission**: `undefined` \| `boolean`

Indicates whether the command is available in DMs with the application, only for globally-scoped commands.
By default, commands are visible.

#### Inherited from

SlashCommandBuilder.dm\_permission

#### Defined in

node_modules/@discordjs/builders/dist/index.d.ts:1163

___

### execute

• **execute**: (`options`: [`RecipleInteractionCommandExecute`](../interfaces/RecipleInteractionCommandExecute.md)) => `void`

#### Type declaration

▸ (`options`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`RecipleInteractionCommandExecute`](../interfaces/RecipleInteractionCommandExecute.md) |

##### Returns

`void`

#### Defined in

[src/reciple/classes/builders/InteractionCommandBuilder.ts:17](https://github.com/FalloutStudios/Reciple/blob/53bf2cd/src/reciple/classes/builders/InteractionCommandBuilder.ts#L17)

___

### name

• `Readonly` **name**: `string`

The name of this slash command

#### Inherited from

SlashCommandBuilder.name

#### Defined in

node_modules/@discordjs/builders/dist/index.d.ts:1131

___

### name\_localizations

• `Optional` `Readonly` **name\_localizations**: `Partial`<`Record`<``"en-US"`` \| ``"en-GB"`` \| ``"bg"`` \| ``"zh-CN"`` \| ``"zh-TW"`` \| ``"hr"`` \| ``"cs"`` \| ``"da"`` \| ``"nl"`` \| ``"fi"`` \| ``"fr"`` \| ``"de"`` \| ``"el"`` \| ``"hi"`` \| ``"hu"`` \| ``"it"`` \| ``"ja"`` \| ``"ko"`` \| ``"lt"`` \| ``"no"`` \| ``"pl"`` \| ``"pt-BR"`` \| ``"ro"`` \| ``"ru"`` \| ``"es-ES"`` \| ``"sv-SE"`` \| ``"th"`` \| ``"tr"`` \| ``"uk"`` \| ``"vi"``, ``null`` \| `string`\>\>

The localized names for this command

#### Inherited from

SlashCommandBuilder.name\_localizations

#### Defined in

node_modules/@discordjs/builders/dist/index.d.ts:1135

___

### options

• `Readonly` **options**: `ToAPIApplicationCommandOptions`[]

The options of this slash command

#### Inherited from

SlashCommandBuilder.options

#### Defined in

node_modules/@discordjs/builders/dist/index.d.ts:1147

___

### requiredPermissions

• **requiredPermissions**: (`PermissionString` \| `PermissionFlags`)[] = `[]`

#### Defined in

[src/reciple/classes/builders/InteractionCommandBuilder.ts:15](https://github.com/FalloutStudios/Reciple/blob/53bf2cd/src/reciple/classes/builders/InteractionCommandBuilder.ts#L15)

## Methods

### addAttachmentOption

▸ **addAttachmentOption**(`input`): `Omit`<[`InteractionCommandBuilder`](InteractionCommandBuilder.md), ``"addSubcommand"`` \| ``"addSubcommandGroup"``\>

Adds an attachment option

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `input` | `SlashCommandAttachmentOption` \| (`builder`: `SlashCommandAttachmentOption`) => `SlashCommandAttachmentOption` | A function that returns an option builder, or an already built builder |

#### Returns

`Omit`<[`InteractionCommandBuilder`](InteractionCommandBuilder.md), ``"addSubcommand"`` \| ``"addSubcommandGroup"``\>

#### Inherited from

SlashCommandBuilder.addAttachmentOption

___

### addBooleanOption

▸ **addBooleanOption**(`input`): `Omit`<[`InteractionCommandBuilder`](InteractionCommandBuilder.md), ``"addSubcommand"`` \| ``"addSubcommandGroup"``\>

Adds a boolean option

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `input` | `SlashCommandBooleanOption` \| (`builder`: `SlashCommandBooleanOption`) => `SlashCommandBooleanOption` | A function that returns an option builder, or an already built builder |

#### Returns

`Omit`<[`InteractionCommandBuilder`](InteractionCommandBuilder.md), ``"addSubcommand"`` \| ``"addSubcommandGroup"``\>

#### Inherited from

SlashCommandBuilder.addBooleanOption

___

### addChannelOption

▸ **addChannelOption**(`input`): `Omit`<[`InteractionCommandBuilder`](InteractionCommandBuilder.md), ``"addSubcommand"`` \| ``"addSubcommandGroup"``\>

Adds a channel option

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `input` | `SlashCommandChannelOption` \| (`builder`: `SlashCommandChannelOption`) => `SlashCommandChannelOption` | A function that returns an option builder, or an already built builder |

#### Returns

`Omit`<[`InteractionCommandBuilder`](InteractionCommandBuilder.md), ``"addSubcommand"`` \| ``"addSubcommandGroup"``\>

#### Inherited from

SlashCommandBuilder.addChannelOption

___

### addIntegerOption

▸ **addIntegerOption**(`input`): `Omit`<[`InteractionCommandBuilder`](InteractionCommandBuilder.md), ``"addSubcommand"`` \| ``"addSubcommandGroup"``\>

Adds an integer option

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `input` | `SlashCommandIntegerOption` \| `Omit`<`SlashCommandIntegerOption`, ``"setAutocomplete"``\> \| `Omit`<`SlashCommandIntegerOption`, ``"addChoices"``\> \| (`builder`: `SlashCommandIntegerOption`) => `SlashCommandIntegerOption` \| `Omit`<`SlashCommandIntegerOption`, ``"setAutocomplete"``\> \| `Omit`<`SlashCommandIntegerOption`, ``"addChoices"``\> | A function that returns an option builder, or an already built builder |

#### Returns

`Omit`<[`InteractionCommandBuilder`](InteractionCommandBuilder.md), ``"addSubcommand"`` \| ``"addSubcommandGroup"``\>

#### Inherited from

SlashCommandBuilder.addIntegerOption

___

### addMentionableOption

▸ **addMentionableOption**(`input`): `Omit`<[`InteractionCommandBuilder`](InteractionCommandBuilder.md), ``"addSubcommand"`` \| ``"addSubcommandGroup"``\>

Adds a mentionable option

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `input` | `SlashCommandMentionableOption` \| (`builder`: `SlashCommandMentionableOption`) => `SlashCommandMentionableOption` | A function that returns an option builder, or an already built builder |

#### Returns

`Omit`<[`InteractionCommandBuilder`](InteractionCommandBuilder.md), ``"addSubcommand"`` \| ``"addSubcommandGroup"``\>

#### Inherited from

SlashCommandBuilder.addMentionableOption

___

### addNumberOption

▸ **addNumberOption**(`input`): `Omit`<[`InteractionCommandBuilder`](InteractionCommandBuilder.md), ``"addSubcommand"`` \| ``"addSubcommandGroup"``\>

Adds a number option

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `input` | `SlashCommandNumberOption` \| `Omit`<`SlashCommandNumberOption`, ``"setAutocomplete"``\> \| `Omit`<`SlashCommandNumberOption`, ``"addChoices"``\> \| (`builder`: `SlashCommandNumberOption`) => `SlashCommandNumberOption` \| `Omit`<`SlashCommandNumberOption`, ``"setAutocomplete"``\> \| `Omit`<`SlashCommandNumberOption`, ``"addChoices"``\> | A function that returns an option builder, or an already built builder |

#### Returns

`Omit`<[`InteractionCommandBuilder`](InteractionCommandBuilder.md), ``"addSubcommand"`` \| ``"addSubcommandGroup"``\>

#### Inherited from

SlashCommandBuilder.addNumberOption

___

### addRoleOption

▸ **addRoleOption**(`input`): `Omit`<[`InteractionCommandBuilder`](InteractionCommandBuilder.md), ``"addSubcommand"`` \| ``"addSubcommandGroup"``\>

Adds a role option

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `input` | `SlashCommandRoleOption` \| (`builder`: `SlashCommandRoleOption`) => `SlashCommandRoleOption` | A function that returns an option builder, or an already built builder |

#### Returns

`Omit`<[`InteractionCommandBuilder`](InteractionCommandBuilder.md), ``"addSubcommand"`` \| ``"addSubcommandGroup"``\>

#### Inherited from

SlashCommandBuilder.addRoleOption

___

### addStringOption

▸ **addStringOption**(`input`): `Omit`<[`InteractionCommandBuilder`](InteractionCommandBuilder.md), ``"addSubcommand"`` \| ``"addSubcommandGroup"``\>

Adds a string option

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `input` | `SlashCommandStringOption` \| `Omit`<`SlashCommandStringOption`, ``"setAutocomplete"``\> \| `Omit`<`SlashCommandStringOption`, ``"addChoices"``\> \| (`builder`: `SlashCommandStringOption`) => `SlashCommandStringOption` \| `Omit`<`SlashCommandStringOption`, ``"setAutocomplete"``\> \| `Omit`<`SlashCommandStringOption`, ``"addChoices"``\> | A function that returns an option builder, or an already built builder |

#### Returns

`Omit`<[`InteractionCommandBuilder`](InteractionCommandBuilder.md), ``"addSubcommand"`` \| ``"addSubcommandGroup"``\>

#### Inherited from

SlashCommandBuilder.addStringOption

___

### addSubcommand

▸ **addSubcommand**(`input`): `SlashCommandSubcommandsOnlyBuilder`

Adds a new subcommand to this command

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `input` | `SlashCommandSubcommandBuilder` \| (`subcommandGroup`: `SlashCommandSubcommandBuilder`) => `SlashCommandSubcommandBuilder` | A function that returns a subcommand builder, or an already built builder |

#### Returns

`SlashCommandSubcommandsOnlyBuilder`

#### Inherited from

SlashCommandBuilder.addSubcommand

___

### addSubcommandGroup

▸ **addSubcommandGroup**(`input`): `SlashCommandSubcommandsOnlyBuilder`

Adds a new subcommand group to this command

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `input` | `SlashCommandSubcommandGroupBuilder` \| (`subcommandGroup`: `SlashCommandSubcommandGroupBuilder`) => `SlashCommandSubcommandGroupBuilder` | A function that returns a subcommand group builder, or an already built builder |

#### Returns

`SlashCommandSubcommandsOnlyBuilder`

#### Inherited from

SlashCommandBuilder.addSubcommandGroup

___

### addUserOption

▸ **addUserOption**(`input`): `Omit`<[`InteractionCommandBuilder`](InteractionCommandBuilder.md), ``"addSubcommand"`` \| ``"addSubcommandGroup"``\>

Adds a user option

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `input` | `SlashCommandUserOption` \| (`builder`: `SlashCommandUserOption`) => `SlashCommandUserOption` | A function that returns an option builder, or an already built builder |

#### Returns

`Omit`<[`InteractionCommandBuilder`](InteractionCommandBuilder.md), ``"addSubcommand"`` \| ``"addSubcommandGroup"``\>

#### Inherited from

SlashCommandBuilder.addUserOption

___

### setAllowExecuteInDM

▸ **setAllowExecuteInDM**(`allowExecuteInDM`): [`InteractionCommandBuilder`](InteractionCommandBuilder.md)

Set if command can be executed in dms

**`Deprecated`**

 use `InteractionCommandBuilder.setDMPermission()` instead

#### Parameters

| Name | Type |
| :------ | :------ |
| `allowExecuteInDM` | `boolean` |

#### Returns

[`InteractionCommandBuilder`](InteractionCommandBuilder.md)

___

### setDMPermission

▸ **setDMPermission**(`enabled`): [`InteractionCommandBuilder`](InteractionCommandBuilder.md)

Sets if the command is available in DMs with the application, only for globally-scoped commands.
By default, commands are visible.

**`See`**

 https://discord.com/developers/docs/interactions/application-commands#permissions

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `enabled` | `undefined` \| ``null`` \| `boolean` | If the command should be enabled in DMs |

#### Returns

[`InteractionCommandBuilder`](InteractionCommandBuilder.md)

#### Inherited from

SlashCommandBuilder.setDMPermission

___

### setDefaultMemberPermissions

▸ **setDefaultMemberPermissions**(`permissions`): [`InteractionCommandBuilder`](InteractionCommandBuilder.md)

Sets the default permissions a member should have in order to run the command.

**Note:** You can set this to `'0'` to disable the command by default.

**`See`**

 https://discord.com/developers/docs/interactions/application-commands#permissions

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `permissions` | `undefined` \| ``null`` \| `string` \| `number` \| `bigint` | The permissions bit field to set |

#### Returns

[`InteractionCommandBuilder`](InteractionCommandBuilder.md)

#### Inherited from

SlashCommandBuilder.setDefaultMemberPermissions

___

### setDefaultPermission

▸ **setDefaultPermission**(`value`): [`InteractionCommandBuilder`](InteractionCommandBuilder.md)

Sets whether the command is enabled by default when the application is added to a guild.

**Note**: If set to `false`, you will have to later `PUT` the permissions for this command.

**`See`**

 https://discord.com/developers/docs/interactions/application-commands#permissions

**`Deprecated`**

 Use `setDefaultMemberPermissions` or `setDMPermission` instead.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `boolean` | Whether or not to enable this command by default |

#### Returns

[`InteractionCommandBuilder`](InteractionCommandBuilder.md)

#### Inherited from

SlashCommandBuilder.setDefaultPermission

___

### setDescription

▸ **setDescription**(`description`): [`InteractionCommandBuilder`](InteractionCommandBuilder.md)

Sets the description

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `description` | `string` | The description |

#### Returns

[`InteractionCommandBuilder`](InteractionCommandBuilder.md)

#### Inherited from

SlashCommandBuilder.setDescription

___

### setDescriptionLocalization

▸ **setDescriptionLocalization**(`locale`, `localizedDescription`): [`InteractionCommandBuilder`](InteractionCommandBuilder.md)

Sets a description localization

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `locale` | ``"en-US"`` \| ``"en-GB"`` \| ``"bg"`` \| ``"zh-CN"`` \| ``"zh-TW"`` \| ``"hr"`` \| ``"cs"`` \| ``"da"`` \| ``"nl"`` \| ``"fi"`` \| ``"fr"`` \| ``"de"`` \| ``"el"`` \| ``"hi"`` \| ``"hu"`` \| ``"it"`` \| ``"ja"`` \| ``"ko"`` \| ``"lt"`` \| ``"no"`` \| ``"pl"`` \| ``"pt-BR"`` \| ``"ro"`` \| ``"ru"`` \| ``"es-ES"`` \| ``"sv-SE"`` \| ``"th"`` \| ``"tr"`` \| ``"uk"`` \| ``"vi"`` | The locale to set a description for |
| `localizedDescription` | ``null`` \| `string` | The localized description for the given locale |

#### Returns

[`InteractionCommandBuilder`](InteractionCommandBuilder.md)

#### Inherited from

SlashCommandBuilder.setDescriptionLocalization

___

### setDescriptionLocalizations

▸ **setDescriptionLocalizations**(`localizedDescriptions`): [`InteractionCommandBuilder`](InteractionCommandBuilder.md)

Sets the description localizations

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `localizedDescriptions` | ``null`` \| `Partial`<`Record`<``"en-US"`` \| ``"en-GB"`` \| ``"bg"`` \| ``"zh-CN"`` \| ``"zh-TW"`` \| ``"hr"`` \| ``"cs"`` \| ``"da"`` \| ``"nl"`` \| ``"fi"`` \| ``"fr"`` \| ``"de"`` \| ``"el"`` \| ``"hi"`` \| ``"hu"`` \| ``"it"`` \| ``"ja"`` \| ``"ko"`` \| ``"lt"`` \| ``"no"`` \| ``"pl"`` \| ``"pt-BR"`` \| ``"ro"`` \| ``"ru"`` \| ``"es-ES"`` \| ``"sv-SE"`` \| ``"th"`` \| ``"tr"`` \| ``"uk"`` \| ``"vi"``, ``null`` \| `string`\>\> | The dictionary of localized descriptions to set |

#### Returns

[`InteractionCommandBuilder`](InteractionCommandBuilder.md)

#### Inherited from

SlashCommandBuilder.setDescriptionLocalizations

___

### setExecute

▸ **setExecute**(`execute`): [`InteractionCommandBuilder`](InteractionCommandBuilder.md)

Function when the command is executed

#### Parameters

| Name | Type |
| :------ | :------ |
| `execute` | (`options`: [`RecipleInteractionCommandExecute`](../interfaces/RecipleInteractionCommandExecute.md)) => `void` |

#### Returns

[`InteractionCommandBuilder`](InteractionCommandBuilder.md)

___

### setName

▸ **setName**(`name`): [`InteractionCommandBuilder`](InteractionCommandBuilder.md)

Sets the name

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | The name |

#### Returns

[`InteractionCommandBuilder`](InteractionCommandBuilder.md)

#### Inherited from

SlashCommandBuilder.setName

___

### setNameLocalization

▸ **setNameLocalization**(`locale`, `localizedName`): [`InteractionCommandBuilder`](InteractionCommandBuilder.md)

Sets a name localization

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `locale` | ``"en-US"`` \| ``"en-GB"`` \| ``"bg"`` \| ``"zh-CN"`` \| ``"zh-TW"`` \| ``"hr"`` \| ``"cs"`` \| ``"da"`` \| ``"nl"`` \| ``"fi"`` \| ``"fr"`` \| ``"de"`` \| ``"el"`` \| ``"hi"`` \| ``"hu"`` \| ``"it"`` \| ``"ja"`` \| ``"ko"`` \| ``"lt"`` \| ``"no"`` \| ``"pl"`` \| ``"pt-BR"`` \| ``"ro"`` \| ``"ru"`` \| ``"es-ES"`` \| ``"sv-SE"`` \| ``"th"`` \| ``"tr"`` \| ``"uk"`` \| ``"vi"`` | The locale to set a description for |
| `localizedName` | ``null`` \| `string` | The localized description for the given locale |

#### Returns

[`InteractionCommandBuilder`](InteractionCommandBuilder.md)

#### Inherited from

SlashCommandBuilder.setNameLocalization

___

### setNameLocalizations

▸ **setNameLocalizations**(`localizedNames`): [`InteractionCommandBuilder`](InteractionCommandBuilder.md)

Sets the name localizations

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `localizedNames` | ``null`` \| `Partial`<`Record`<``"en-US"`` \| ``"en-GB"`` \| ``"bg"`` \| ``"zh-CN"`` \| ``"zh-TW"`` \| ``"hr"`` \| ``"cs"`` \| ``"da"`` \| ``"nl"`` \| ``"fi"`` \| ``"fr"`` \| ``"de"`` \| ``"el"`` \| ``"hi"`` \| ``"hu"`` \| ``"it"`` \| ``"ja"`` \| ``"ko"`` \| ``"lt"`` \| ``"no"`` \| ``"pl"`` \| ``"pt-BR"`` \| ``"ro"`` \| ``"ru"`` \| ``"es-ES"`` \| ``"sv-SE"`` \| ``"th"`` \| ``"tr"`` \| ``"uk"`` \| ``"vi"``, ``null`` \| `string`\>\> | The dictionary of localized descriptions to set |

#### Returns

[`InteractionCommandBuilder`](InteractionCommandBuilder.md)

#### Inherited from

SlashCommandBuilder.setNameLocalizations

___

### setRequiredPermissions

▸ **setRequiredPermissions**(`requiredPermissions`): [`InteractionCommandBuilder`](InteractionCommandBuilder.md)

Set required permissions before executing the command

#### Parameters

| Name | Type |
| :------ | :------ |
| `requiredPermissions` | `PermissionString`[] |

#### Returns

[`InteractionCommandBuilder`](InteractionCommandBuilder.md)

___

### toJSON

▸ **toJSON**(): `RESTPostAPIApplicationCommandsJSONBody`

Returns the final data that should be sent to Discord.

**Note:** Calling this function will validate required properties based on their conditions.

#### Returns

`RESTPostAPIApplicationCommandsJSONBody`

#### Inherited from

SlashCommandBuilder.toJSON
