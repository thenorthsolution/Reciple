import { AnyCommandBuilder, AnyCommandData, CommandType } from '../types/commands';
import { RecipleClient } from '../classes/RecipleClient';
import { randomUUID } from 'crypto';
import semver from 'semver';
import { RestOrArray, normalizeArray } from 'discord.js';
import { ContextMenuCommandBuilder, MessageCommandBuilder, SlashCommandBuilder } from '..';

export interface RecipleModuleScript {
    versions: string|string[];
    commands?: (AnyCommandBuilder|AnyCommandData)[];
    onStart(client: RecipleClient<true>, module: RecipleModule): boolean | Promise<boolean>;
    onLoad?(client: RecipleClient<false>, module: RecipleModule): void | Promise<void>;
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
        if (this.script.onLoad) Promise.resolve(this.script.onLoad(this.client, this));
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

            if (!command) continue;
            commands.push(command);
        }

        this.commands = commands;
        return commands;
    }

    public toString(): string {
        return this.displayName;
    }
}
