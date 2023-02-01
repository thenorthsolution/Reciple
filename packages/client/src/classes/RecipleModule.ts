import { AnyCommandBuilder, AnyCommandData, CommandType } from '../types/commands';
import { RecipleClient } from '../classes/RecipleClient';
import { randomUUID } from 'crypto';
import semver from 'semver';
import { RestOrArray, normalizeArray } from 'discord.js';
import { ContextMenuCommandBuilder, MessageCommandBuilder, SlashCommandBuilder } from '..';

export interface RecipleModuleScript {
    versions: string|string[];
    commands?: (AnyCommandBuilder|AnyCommandData)[];
    onStart(client: RecipleClient<false>, module: RecipleModule): boolean | Promise<boolean>;
    onLoad?(client: RecipleClient<true>, module: RecipleModule): void | Promise<void>;
    onUnload?(unloadData: RecipleModuleScriptUnloadData): void | Promise<void>;
}

export interface RecipleModuleScriptUnloadData {
    client: RecipleClient<true>;
    reason?: string;
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

    constructor(options: RecipleModuleOptions) {
        this._script = options.script;
        this.client = options.client;
        this.id = randomUUID();
    }

    get versions() { return this._script.versions; }
    get onStart() { return this._script.onStart; }
    get onLoad() { return this._script.onLoad; }
    get onUnload() { return this._script.onUnload; }
    get displayName() { return this.filePath ?? this.id; }
    get isSupported() { return normalizeArray([this.versions] as RestOrArray<string>).some(v => semver.satisfies(this.client.version, v)); }

    public async start(): Promise<boolean> {
        return Promise.resolve(this.onStart(this.client, this));
    }

    public async load(resolveCommands: boolean = true): Promise<void> {
        if(this.onLoad) await Promise.resolve(this.onLoad(this.client, this));
        if (resolveCommands) this.resolveCommands();
    }

    public async unload(reason?: string): Promise<void> {
        if (this.onUnload) await Promise.resolve(this.onUnload({
            client: this.client,
            module: this,
            reason
        }));
    }

    public resolveCommands(): AnyCommandBuilder[] {
        const commands: AnyCommandBuilder[] = [];

        for (const commandData of (this._script.commands ?? [])) {
            const command = commandData.commandType === CommandType.ContextMenuCommand
                ? ContextMenuCommandBuilder.resolve(commandData)
                : commandData.commandType === CommandType.MessageCommand
                    ? MessageCommandBuilder.resolve(commandData)
                    : commandData.commandType === CommandType.SlashCommand
                        ? SlashCommandBuilder.resolve(commandData)
                        : null;

            if (!command) continue;
            commands.push(command);
        }

        this.commands = commands;
        return commands;
    }
}
