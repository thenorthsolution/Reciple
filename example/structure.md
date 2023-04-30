# Structure

This uses `discord.js` as Discord API library and `reciple` as handler framework.

## Reciple Modules

The reciple scans the directory assigned in `reciple.yml` under `modules.modulesFolders` property. `modules.modulesFolders` can be the path of the folder of modules or glob pattern

### Folder Structure

#### Example Structure
```yml
# Modules config

modules:
  modulesFolders:
    - './modules' # Scans the modules folder for module files
```

```
# Dir structure

modules/
├─ Module1.js
├─ Module2.js
```

#### Example Structure + Glob path patterns
```yml
# Modules config

modules:
  modulesFolders:
    - './modules' # Scans the modules folder for module files
    - './modules/*' # Scans the folders of modules folder for module files
```

```
# Dir structure

modules/
├─ moreModules/
│  ├─ Module1.js
│  ├─ Module2.js
├─ Module3.js
├─ Module4.js
```

### Module Structure

Module files can be ES Modules or CommonJs.

##### Supported module file types

- `.js` *This can be a ESM or CJS*
- `.mjs`
- `.cjs`

#### Module file structure

| Property | type | Required | Description |
|---|---|:---:|---|
| `versions` | `string\|string[]` | `true` | The module's supported version of reciple client |
| `commands` | `(AnyCommandBuilder\|AnyCommandData)[]]` | `false` | The commands of this module |
| `onStart`  | `(client: RecipleClient, module: RecipleModule) => Awaitable<boolean>` | `true` | The method executed when the module is resolved |
| `onLoad`   | `(client: RecipleClient, module: RecipleModule) => Awaitable<void>` | `false` | The method executed when the client is ready |
| `onUnload` | `(unloadData: RecipleModuleUnloadData) => Awaitable<void>` | `false` | The method executed when the module is being unloaded |

#### ESM module example

```js
// Usage without classes

export default {
    versions: '^7',
    onStart: async client => {
        return true;
    },
    onLoad: async client => {},
    onUnload: async ({ client }) => {}
};
```
```js
// Usage with classes

export class MyModule {
    versions = '^7';
    commands = [];

    async onStart(client) {
        return true;
    }

    async onLoad(client) {}
    async onUnload(unloadData) {}
}

export default new MyModule();
```

#### CommonJS module example

```js
// Usage without classes

module.exports = {
    versions: '^7',
    onStart: async client => {
        return true;
    },
    onLoad: async client => {},
    onUnload: async ({ client }) => {}
};
```
```js
// Usage with classes

class MyModule {
    versions = '^7';
    commands = [];

    async onStart(client) {
        return true;
    }

    async onLoad(client) {}
    async onUnload(unloadData) {}
}

module.exports = new MyModule();
```

## Reciple Commands

instead of importing builders from you'll need to import command builders from `reciple` or `@reciple/client`.

```diff
- const { SlashCommandBuilder, ContextMenuCommandBuilder } = require('discord.js');
- import { SlashCommandBuilder, ContextMenuCommandBuilder } from 'discord.js';
+ const { SlashCommandBuilder, ContextMenuCommandBuilder } = require('reciple');
+ import { SlashCommandBuilder, ContextMenuCommandBuilder } from 'reciple';
```

You can add your commands in the commands property of your module script.

```js
export default {
    versions: '^7',
    commands: [
        new SlashCommandBuilder()
            .setName('ping')
            .setDescription('Just a ping command')
            .setExecute(async ({ interaction }) => {
                await interaction.reply('Pong');
            })
    ],
    onStart: async client => {
        return true;
    }
};
```

### Interaction command execute params

| Param | Type | Required | Description |
|---|---|:---:|---|
| `interaction` | `ChatInputCommandInteraction\|AnyContextMenuCommandInteraction` | `true` | The command interaction that triggers the command |
| `client` | `RecipleCommand` | `true` | The current bot client |
| `builder` | `AnySlashCommandBuilder\|ContextMenuCommandBuilder` | `true` | The builder of the executed command |
| `commandType` | `CommandType` | `true` | The type of executed command |

### Message command execute params

| Param | Type | Required | Description |
|---|---|:---:|---|
| `message` | `Message` | `true` | The message that triggers the command |
| `client` | `RecipleCommand` | `true` | The current bot client |
| `builder` | `AnySlashCommandBuilder\|ContextMenuCommandBuilder` | `true` | The builder of the executed command |
| `commandType` | `CommandType` | `true` | The type of executed command |
| `options` | `MessageCommandOptionManager` | `true` | The parsed options passed to this command |

### Handling command execute errors

Command halt function can handle command cooldown and errors. Return `true` if the error or cooldown is handled.

```js
new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Just a ping command')
    .setExecute(async ({ interaction }) => {
        await interaction.reply('Pong');
    })
    .setHalt(async haltData => {
        switch (haltData.reason) {
            case CommandHaltReason.Cooldown:
                await haltData.executeData.interaction.followUp('You\'ve been cooled-down');
                return true;
            case CommandHaltReason.Error:
                await haltData.executeData.interaction.followUp('An error occured');
                return true;
        }

        // The rest is unhandled
    })
```