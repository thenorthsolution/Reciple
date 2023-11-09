# Breaking Changes

## Packages

```diff
- @reciple/client
+ @reciple/core
```

> `reciple` doesn't include the core modules by default anymore.
```sh
# To install reciple you must include the core package
npm i reciple @reciple/core
```

## Configuration Changes

Configuration file is now a javascript file to allow more tweaks to be made within your configurations.

```diff
- reciple.yml
+ reciple.mjs
+ reciple.cjs
+ reciple.js
```

To extend a configuration you can do the spread operation with config objects

```js
import { config as originalConfig } from './reciple.mjs';

export const config = {
    ...originalConfig, // Default configs
    token: 'TOKEN HERE',
    client: {
        intents: ['Guilds']
    }
};
```

## Client Changes

Client options is no longer a valid Discord.js Client options, this means that Client options must have a client property for Discord.js Client options.

```diff:js
import { RecipleClient } from 'reciple';

- new RecipleClient({ token: '', intents: ['Guilds'] });
+ new RecipleClient({ token: '', client: { intents: ['Guilds'] } });
```

Some methods are renamed or moved such as
```diff:js
- RecipleClient._executeCommand()
+ RecipleClient.executeCommandBuilderExecute()

- RecipleClient._haltCommand()
+ RecipleClient.executeCommandBuilderHalt()

- RecipleClient._executeCommandPrecondition()
+ RecipleClient.commands.executePreconditions()
```

## Data managers

### [ModuleManager](https://reciple.js.org/docs/core/main/classes:ModuleManager)

> `modules` property has been renamed to `cache`
```diff:js
- ModuleManager.modules
+ ModuleManager.cache

// ModuleManager as client's property
- client.modules.modules
+ client.modules.cache
```

### [CommandManager](https://reciple.js.org/docs/core/main/classes:CommandManager)

> `additionalApplicationCommands` has been removed
```diff:js
- CommandManager.additionalApplicationCommands

// CommandManager as client's property
- client.commands.additionalApplicationCommands
```

### [CooldownManager](https://reciple.js.org/docs/core/main/classes:CooldownManager)

> [CooldownManager](https://reciple.js.org/docs/core/main/classes:CooldownManager) is no longer an extended Array and the stored data is now a [Cooldown class](https://reciple.js.org/docs/core/main/classes:Cooldown)

```diff:js
- const remaining = (CooldownManager.get(userId)?.endsAt.getTime() - Date.now()) ?? 0;
+ const remaining = CooldownManager.findCooldown(userId)?.remainingMs ?? 0;
```

### [MessageCommandOptionManager](https://reciple.js.org/docs/core/main/classes:MessageCommandOptionManager)

> [MessageCommandOptionManager](https://reciple.js.org/docs/core/main/classes:MessageCommandOptionManager) is no longer an extended Array.

```diff:js
- MessageCommandOptionManager.getValue()
+ MessageCommandOptionManager.getOptionValue()
```

## Preconditions

Preconditions is rewritten, now we have global and command scoped preconditions. You can make a precondition with the following code

```js
import { CommandPrecondition } from 'reciple';

const precondition = new CommandPrecondition({
    id: 'com.something.lol',
    contextMenuCommandExecute: data => true
    messageCommandExecute: data => 'message not allowed',
    slashCommandExecute: data => ({ successful: false, data: new Date() })
});
```

### Global Precondition

You can add, remove, or toggle global preconditions from CommandManager

```js
CommandManager.addPreconditions(precondition);
CommandManager.removePreconditions(precondition);
CommandManager.disablePreconditions(precondition);
CommandManager.enablePreconditions(precondition);
```

### Command Precondition

You can add preconditions to a command builders using the following methods

```js
new ContextMenuCommandBuilder().addPreconditions(precondition);
new MessageCommandBuilder().addPreconditions(precondition);
new SlashCommandBuilder().addPreconditions(precondition);
```

## Modules

> Interface RecipleModuleScript is not renamed to [RecipleModuleData](https://reciple.js.org/docs/core/main/interfaces:RecipleModuleData)

### Module Params

> Params for [`onStart`](https://reciple.js.org/docs/core/main/interfaces:RecipleModuleData#onstart), [`onLoad`](https://reciple.js.org/docs/core/main/interfaces:RecipleModuleData#onload), and [`onUnload`](https://reciple.js.org/docs/core/main/interfaces:RecipleModuleData#onunload) are now object that contains the client and reference to the current module

```diff:js
- onStart(client: RecipleClient, module: RecipleModule): Awaitable<boolean>;
- onStart(data: RecipleModuleStartData): Awaitable<boolean>;

- onLoad(client: RecipleClient, module: RecipleModule): Awaitable<void>;
- onLoad(data: RecipleModuleLoadData): Awaitable<void|string|Error>;

- onUnload(data: RecipleModuleScriptUnloadData): Awaitable<void>;
- onUnload(data: RecipleModuleUnloadData): Awaitable<void|string|Error>;
```

## Command Builders

> The data properties of command builders are now snake_cased to support the default casing for Discord API

```diff:js
- AnyCommandBuilder.commandType
+ AnyCommandBuilder.command_type

- AnyCommandBuilder.requiredBotPermissions
+ AnyCommandBuilder.required_bot_permissions

- AnyCommandBuilder.requiredMemberPermissions
+ AnyCommandBuilder.required_member_permissions
```

### [MessageCommandBuilder](https://reciple.js.org/docs/core/main/classes:MessageCommandBuilder)

> Some properties are converted to snake_case and renamed

```diff:js
- MessageCommandBuilder.userBotPermission
+ MessageCommandBuilder.allow_bot

- MessageCommandBuilder.dmPermission
+ MessageCommandBuilder.dm_permission

- MessageCommandBuilder.validateOptions
+ MessageCommandBuilder.validate_options
```

> [MessageCommandBuilder#addOptions](https://reciple.js.org/docs/core/main/classes:MessageCommandBuilder) is now removed

```diff:js
- MessageCommandBuilder.addOptions

- MessageCommandBuilder.setUserBotPermission()
+ MessageCommandBuilder.setAllowBot()
```

### [MessageCommandOptionBuilder](https://reciple.js.org/docs/core/main/classes:MessageCommandOptionBuilder)

> Some properties and methods are renamed with the addition of [MessageCommandOptionBuilder#resolve_value](https://reciple.js.org/docs/core/main/classes:MessageCommandOptionBuilder#resolve_value) for resolving option value from string

```diff:js
- MessageCommandOptionBuilder.validator
- MessageCommandOptionBuilder.setValidator()
+ MessageCommandOptionBuilder.validate
+ MessageCommandOptionBuilder.setValidate()

+ MessageCommandOptionBuilder.resolve_value
+ MessageCommandOptionBuilder.setResolveValue()
```
