# Breaking Changes

## Packages

```diff
- @reciple/client
+ @reciple/core
```

> `reciple` doesn't include the core modules by default anymore.

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
    token: 'TOKEn HERE',
    client: {
        intents: ['Guilds']
    }
};
```

## Client Changes

Client options is no longer a valid Discord.js Client options, this means that Client options must have a client property for Discord.js Client.

```diff
import { RecipleClient } from 'reciple';

- new RecipleClient({ token: '', intents: ['Guilds'] });
+ new RecipleClient({ token: '', client: { intents: ['Guilds'] } });
```

Some methods are renamed or moved such as
```diff
- RecipleClient._executeCommand()
+ RecipleClient.executeCommandBuilderExecute()

- RecipleClient._haltCommand()
+ RecipleClient.executeCommandBuilderHalt()

- RecipleClient._executeCommandPrecondition()
+ RecipleClient.commands.executePreconditions()
```

## Data managers

### Module Manager

> `modules` property of has been renamed to `cache`
```diff
- ModuleManager.modules
+ ModuleManager.cache
```

### Command Manager

> `additionalApplicationCommands` has been removed
```diff
- CommandManager.additionalApplicationCommands
```

### Cooldown Manager

Cooldown manager is no longer an extended Array and the stored data is now a Cooldown class

```diff
- const remaining = (CooldownManager.get(userId)?.endsAt.getTime() - Date.now()) ?? 0;
+ const remaining = CooldownManager.findCooldown(userId)?.remainingMs ?? 0;
```

### Message Command Option Manager

MessageCommandOptionManager is no longer an extended Array.

```diff
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
