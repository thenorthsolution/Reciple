# Moving to V6

Guide for bots moving from reciple v5 to v6

<details open>
    <summary>Sections</summary>

- [New Managers](#managers)
  - [ClientCommandManager](#clientcommandmanager)
  - [ApplicationCommandManager](#applicationcommandmanager)
  - [ModuleManager](#modulemanager)

</details>


## New Managers
- ### ClientCommandManager
  - Removed `registerApplicationCommands` function and moved it to `ClientCommandManager#registerCommandManager()`
  - `RecipleClient#commands` is a `ClientCommandManager`
  ```diff
  - await registerApplicationCommands()
  + await RecipleClient.commands.registerApplicationCommands()
  ```
- ### ApplicationCommandManager
  - Registers, update, create, or remove application commands globally or from a guild
  - Uses `RecipleClient#application` to register, update, create or remove commands.
  - `RecipleClient#applicationCommands` is an `ApplicationCommandManager`
  ```diff
  + await Reciple.applicationCommands.set([
  +   new SlashCommandBuilder()
  +     .setName('test')
  +     .setDescription('Hi')
  + ], '0000000000000000000')
  ```
- ### ModuleManager
  - Replaces `getModules()` function
  - `RecipleClient#modules` is now a `ModuleManager`
  ```diff
  - await RecipleClient.startModules('modules')
  + await RecipleClient.modules.startModules(
  +   await RecipleClient.modules.getModulesFromFiles(
  +     await RecipleClient.modules.getModuleFiles('modules')
  +   )
  + )
  ```
