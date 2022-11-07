# Moving to v6

### Before you start

Reciple v6 required Discord.js v14 and Node.js v16.9 or higher. To check your Node version, use `node -v` in your terminal.

### Installation

Install Reciple with your favorite package manager but in our case we will use npm.
```
npm i reciple discord.js
```

## ESM Support

Reciple now supports esm and cjs modules.

#### Supported file types

- `module.js` *ESM or CJS*
- `module.mjs`
- `module.cjs`

## Breaking Changes

### Enum Values

All reciple enum values now starts with `1` and increments

### Registering Application Commands

The v6 will now use `ApplicationCommandManager` class to register, edit, remove, and get application commands from client or guild. Instead of importing `registerApplicationCommands()` function, use `RecipleClient#applicationCommands#set()` method.

### Loading & Storing Modules

Loading modules now has four steps `resolve`, `start`, `[optional] load` and the `[optional] unload`.

- Resolving modules is the process of getting module informations like filename and validation.
- Starting the modules will check if the module can be loaded and be stored to client. This will execute the module script `onStart()`
- Loading the module is an optional module function, It's called when the module is successfuly started and when the client is logged in. This will execute the module script `onLoad()` if exists.
- Unloading the module is an optional module function, It's called when the module is being unloaded from the client. This will execute the module script `onUnload()` if exists.

Reciple will now use `ModuleManager` to load, unload, and store `RecipleModule` classes into cache. Instead of importing `getModules()` function Reciple will now use `RecipleClient#modules#resolveModuleFiles()` method.

### Command Manager

Instead of `RecipleClient#commands` client slash and message commands will now be stored to `RecipleClient#commands` as `CommandManager` class. `RecipleClient#additionalApplicationCommands` and `RecipleClient#addCommand()` are also moved to `CommandManager` as `CommandManager#additionalApplicationCommand` and `CommandManager#add()`.

## New Features

### Builder Validation

`SlashCommandBuilder` and `MessageCommandBuilder` will now only validate values if the Discord.js validation is enabled via `isValidationEnabled()`.

### Unload Modules

You can now unload modules properly. When using cli handler modules will be unloaded on `SIGINT` and `SIGTERM` exit signals.

### Builder Metadata

Builder metadata allows you to store extra information in `SlashCommandBuilder` or `MessageCommandBuilder`
