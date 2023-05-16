import { AnyCommandBuilder, AnyCommandData, CommandType } from '../types/commands';
import { ContextMenuCommandBuilder } from './builders/ContextMenuCommandBuilder';
import { validateCommand } from '../utils/assertions/commands/assertions';
import { MessageCommandBuilder } from './builders/MessageCommandBuilder';
import { SlashCommandBuilder } from './builders/SlashCommandBuilder';
import { getCommandBuilderName } from '../utils/functions';
import { RecipleClient } from '../classes/RecipleClient';
import { RestOrArray, normalizeArray } from 'discord.js';
import { ModuleError } from './errors/ModuleError';
import { randomUUID } from 'crypto';
import { inspect } from 'util';
import semver from 'semver';

export interface RecipleModuleScript {
    /**
     * The versions of the Reciple client that the module script is compatible with. The versions can be a string or an array of strings.
     */
    versions: string|string[];
    /**
     * The commands that are defined by the module script.
     */
    commands?: (AnyCommandBuilder|AnyCommandData)[];
    /**
     * The function that is called when the module script is started. The function must return a boolean value or a promise that resolves to a boolean value. The boolean value indicates whether the module script was started successfully.
     * @param client The client that the module script is running on
     * @param module The module that the module script is associated with
     */
    onStart(client: RecipleClient<false>, module: RecipleModule): boolean | Promise<boolean>;
    /**
     * The function that is called when the module script is loaded.
     * @param client The client that the module script is running on
     * @param module The module that the module script is associated with
     */
    onLoad?(client: RecipleClient<true>, module: RecipleModule): void | Promise<void>;
    /**
     * The function that is called when the module script is unloaded.
     * @param unloadData The unload data contains information about why the module script is being unloaded.
     */
    onUnload?(unloadData: RecipleModuleScriptUnloadData): void | Promise<void>;
}

export interface RecipleModuleScriptUnloadData {
    /**
     * The client that the module script was running on.
     */
    client: RecipleClient<true>;
    /**
     * The reason why the module script was unloaded.
     */
    reason?: string;
    /**
     * The module that was unloaded.
     */
    module: RecipleModule;
}

export interface RecipleModuleOptions {
    client: RecipleClient;
    script: RecipleModuleScript;
    filePath?: string;
}

export class RecipleModule {
    private _script: RecipleModuleScript;

    readonly id: string;
    readonly client: RecipleClient;
    readonly filePath?: string;

    public commands: AnyCommandBuilder[] = [];

    get script() { return this._script; }

    constructor(options: RecipleModuleOptions) {
        this.filePath = options.filePath;
        this._script = options.script;
        this.client = options.client;
        this.id = randomUUID();
    }

    get versions() { return this._script.versions; }
    get displayName() { return this.filePath ?? this.id; }
    get isSupported() { return normalizeArray([this.versions] as RestOrArray<string>).some(v => semver.satisfies(this.client.version, v)); }

    public async start(): Promise<boolean> {
        return Promise.resolve(this.script.onStart(this.client, this));
    }

    public async load(resolveCommands: boolean = true): Promise<void> {
        if (this.script.onLoad) await Promise.resolve(this.script.onLoad(this.client, this));
        if (resolveCommands) this.resolveCommands();
    }

    public async unload(reason?: string): Promise<void> {
        if (this.script.onUnload) await Promise.resolve(this.script.onUnload({
            client: this.client,
            module: this,
            reason
        }));
    }

    public resolveCommands(): AnyCommandBuilder[] {
        const commands: AnyCommandBuilder[] = [];

        for (const commandData of (this._script.commands ?? [])) {
            let command: AnyCommandBuilder;

            try {
                validateCommand(commandData);
            } catch(err) {
                this.client._throwError(new ModuleError('UnableToAddCommand', getCommandBuilderName(commandData), commandData?.name, inspect(err)));
                continue;
            }

            switch (commandData.commandType) {
                case CommandType.ContextMenuCommand:
                    command = ContextMenuCommandBuilder.resolve(commandData);
                    break;
                case CommandType.MessageCommand:
                    command = MessageCommandBuilder.resolve(commandData);
                    break;
                case CommandType.SlashCommand:
                    command = SlashCommandBuilder.resolve(commandData);
                    break;
            }

            if (command) commands.push(command);
        }

        this.commands = commands;
        return commands;
    }

    public toString(): string {
        return this.displayName;
    }
}
