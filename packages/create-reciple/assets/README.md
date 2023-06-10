# Reciple

Reciple is a discord.js command handler framework that just works.

## Reciple Modules

- Reciple scans the directory assigned in `reciple.yml` under `modules.modulesFolders` property.
- `modules.modulesFolders` can be the path of the folder of modules or glob pattern

### Folder Structure

##### Example Structure
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

##### Example Structure with Glob patterns
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

- `.js` *This can be an ESM or CJS*
- `.mjs`
- `.cjs`

#### Module file structure

- [RecipleModuleScript](https://reciple.js.org/docs/client/main/typedefs/RecipleModuleScript)

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

instead of importing builders from `discord.js`, import command builders from `reciple` or `@reciple/client`.

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

- [ContextMenuCommandExecuteData](https://reciple.js.org/docs/client/main/typedefs/ContextMenuCommandExecuteData)
- [SlashCommandExecuteData](https://reciple.js.org/docs/client/main/typedefs/SlashCommandExecuteData)

### Message command execute params

- [MessageCommandExecuteData](https://reciple.js.org/docs/client/main/typedefs/MessageCommandExecuteData)

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
                await haltData.executeData.interaction.followUp(`You've been cooled-down`);
                return true;
            case CommandHaltReason.Error:
                await haltData.executeData.interaction.followUp('An error occured');
                return true;
        }

        // The rest is unhandled
    })
```

### Using command preconditions

Command preconditions are executed after the command is received and before executing the command's execute function.

#### Module command preconditions

You can define a precondition for all commands of a module.

##### Valid module precondition methods

- [Context meny command preconditions](https://reciple.js.org/docs/client/main/typedefs/RecipleModuleScript#contextMenuCommandPrecondition)
- [Message command preconditions](https://reciple.js.org/docs/client/main/typedefs/RecipleModuleScript#messageCommandPrecondition)
- [Slash command preconditions](https://reciple.js.org/docs/client/main/typedefs/RecipleModuleScript#slashCommandPrecondition)

```js
// Example module with slash commands precondition
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
    onStart: async client => true,

    // creates a slash command precondition
    slashCommandPrecondition: async (({ interaction })) => {
        return !interaction.inCachedGuild() || interaction.guild.ownerId !== interaction.user.id; // Command can only be executed by the guild owner
    }
};
```

#### Global command preconditions

Global preconditions are added to all commands along with the existing module preconditions.

##### Set & Get global preconditions
- [CommandManager#setGlobalPrecondition](https://reciple.js.org/docs/client/main/classes/CommandManager#setGlobalPrecondition)
- [CommandManager#getGlobalPrecondition](https://reciple.js.org/docs/client/main/classes/CommandManager#getGlobalPrecondition)

```js
// Example module with global slash commands precondition
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
    onStart: async client => true,
    onLoad: async client => {
        client.commands.setGlobalPrecondition(
            CommandType.SlashCommand,
            async ({ interaction }) => {
                return interaction.inCachedGuild(); // All slash commands can only be executed if in cached guild
            }
        );
    }
};
```
