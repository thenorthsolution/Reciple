import { AnyCommandBuilder, AnyCommandData, AnyCommandExecuteData, CommandType } from '../types/commands';
import { ContextMenuCommandBuilder, ContextMenuCommandExecuteData } from './builders/ContextMenuCommandBuilder';
import { MessageCommandBuilder, MessageCommandExecuteData } from './builders/MessageCommandBuilder';
import { SlashCommandBuilder, SlashCommandExecuteData } from './builders/SlashCommandBuilder';
import { CommandAssertions } from './assertions/CommandAssertions';
import { RecipleClient } from './RecipleClient';
import { RestOrArray, normalizeArray } from 'discord.js';
import { ValidationError } from '@sapphire/shapeshift';
import { randomUUID } from 'node:crypto';
import semver from 'semver';
import { isJSONEncodable } from 'fallout-utility';

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
     * @param _module The module that the module script is associated with
     */
    onStart(client: RecipleClient<false>, _module: RecipleModule): boolean | Promise<boolean>;
    /**
     * The function that is called when the module script is loaded.
     * @param client The client that the module script is running on
     * @param _module The module that the module script is associated with
     */
    onLoad?(client: RecipleClient<true>, _module: RecipleModule): void | Promise<void>;
    /**
     * The function that is called when the module script is unloaded.
     * @param unloadData The unload data contains information about why the module script is being unloaded.
     */
    onUnload?(unloadData: RecipleModuleScriptUnloadData): void | Promise<void>;
    contextMenuCommandPrecondition?(executeData: ContextMenuCommandExecuteData): boolean | Promise<boolean>;
    messageCommandPrecondition?(executeData: MessageCommandExecuteData): boolean | Promise<boolean>;
    slashCommandPrecondition?(executeData: SlashCommandExecuteData): boolean | Promise<boolean>;
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

export interface RecipleModuleOptions<S extends RecipleModuleScript = RecipleModuleScript> {
    client: RecipleClient;
    script: S;
    filePath?: string;
}

export class RecipleModule<S extends RecipleModuleScript = RecipleModuleScript> {
    private _script: S;

    readonly id: string;
    readonly client: RecipleClient;
    readonly filePath?: string;

    public commands: AnyCommandBuilder[] = [];

    get script() { return this._script; }

    constructor(options: RecipleModuleOptions<S>) {
        this.filePath = options.filePath;
        this._script = options.script;
        this.client = options.client;
        this.id = randomUUID();
    }

    get versions() { return normalizeArray([this.script.versions] as RestOrArray<string>); }
    get displayName() { return this.filePath ?? this.id; }
    get isSupported() { return this.versions.some(v => v === "latest" || semver.satisfies(this.client.version, v)); }

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

    public async contextMenuCommandPrecondition(execute: ContextMenuCommandExecuteData): Promise<boolean> {
        return this._script.contextMenuCommandPrecondition ? await Promise.resolve(this._script.contextMenuCommandPrecondition(execute)) : true;
    }

    public async messageCommandPrecondition(execute: MessageCommandExecuteData): Promise<boolean> {
        return this._script.messageCommandPrecondition ? await Promise.resolve(this._script.messageCommandPrecondition(execute)) : true;
    }

    public async slashCommandPrecondition(execute: SlashCommandExecuteData): Promise<boolean> {
        return this._script.slashCommandPrecondition ? await Promise.resolve(this._script.slashCommandPrecondition(execute)) : true;
    }

    public async executePrecondition(executeData: AnyCommandExecuteData): Promise<boolean> {
        return executeData.commandType === CommandType.ContextMenuCommand
            ? this.contextMenuCommandPrecondition(executeData)
            : executeData.commandType === CommandType.MessageCommand
                ? this.messageCommandPrecondition(executeData)
                : this.slashCommandPrecondition(executeData);
    }

    public resolveCommands(): AnyCommandBuilder[] {
        const commands: AnyCommandBuilder[] = [];

        for (const commandData of (this._script.commands ?? [])) {
            let command: AnyCommandBuilder;

            try {
                CommandAssertions.validateCommand(commandData);
            } catch(err) {
                this.client._throwError(err as ValidationError);
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

    public toJSON() {
        return {
            id: this.id,
            filePath: this.filePath,
            versions: this.versions,
            commands: this.commands.map(c => isJSONEncodable(c) ? c.toJSON() : c)
        };
    }
}
