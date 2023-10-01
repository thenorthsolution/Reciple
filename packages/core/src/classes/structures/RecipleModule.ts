import { RestOrArray, normalizeArray } from 'discord.js';
import { AnyCommandBuilder, AnyCommandResolvable } from '../../types/structures';
import { RecipleClient } from './RecipleClient';
import { Utils } from './Utils';
import { ModuleManager } from '../managers/ModuleManager';
import { RecipleError } from './RecipleError';
import { RecipleModuleStatus } from '../../types/constants';
import semver from 'semver';

export interface RecipleModuleData {
    id?: string;
    name?: string;
    versions: string|string[];
    commands?: AnyCommandResolvable[];
    onStart(data: RecipleModuleStartData): boolean|string|Error|Promise<boolean|string|Error>;
    onLoad?(data: RecipleModuleLoadData): void|string|Error|Promise<void|string|Error>;
    onUnload?(data: RecipleModuleUnloadData): void|string|Error|Promise<void|string|Error>;
}

export interface RecipleModuleStartData {
    client: RecipleClient;
    module: RecipleModule;
}

export interface RecipleModuleLoadData {
    client: RecipleClient<true>;
    module: RecipleModule;
}

export interface RecipleModuleUnloadData extends RecipleModuleLoadData {
    reason?: string;
}

export interface RecipleModuleOptions<D extends RecipleModuleData = RecipleModuleData> {
    data: D;
    status?: RecipleModuleStatus;
    file?: string;
    client: RecipleClient;
}

export class RecipleModule<Data extends RecipleModuleData = RecipleModuleData> {
    readonly id: string;
    readonly data: Data;
    readonly client: RecipleClient;
    readonly file?: string;

    public status: RecipleModuleStatus = RecipleModuleStatus.Unloaded;

    get name(): string|undefined { return this.data.name; }
    get displayName(): string { return this.name ?? this.file ?? this.id; }
    get versions(): string[] { return normalizeArray([this.data.versions] as RestOrArray<string>); }
    get commands(): AnyCommandBuilder[] { return this.data.commands?.map(c => Utils.resolveCommandBuilder(c)) ?? []; }
    get supported(): boolean { return this.versions.some(v => v === "latest" || semver.satisfies(this.client.version, v)); };

    constructor(options: RecipleModuleOptions<Data>) {
        this.data = options.data;
        this.id = this.data.id ?? ModuleManager.generateId();
        this.client = options.client;
        this.status = options.status ?? this.status;
        this.file = options.file;
    }

    public async start(): Promise<void> {
        if (this.status !== RecipleModuleStatus.Unloaded) return;

        const data = await Promise.resolve(this.data.onStart({
            client: this.client,
            module: this
        }));

        if (data === true) return;

        throw (typeof data === 'string' ? new RecipleError(RecipleError.createStartModuleErrorOptions(this.displayName, data)) : data);
    }

    public async load(): Promise<void> {
        if (!this.data.onLoad || this.status === RecipleModuleStatus.Loaded) return;

        const data = await Promise.resolve(this.data.onLoad({
            client: this.client,
            module: this
        }));

        if (data !== undefined) throw (typeof data === 'string' ? RecipleError.createLoadModuleErrorOptions(this.displayName, data) : data);
    }

    public async unload(): Promise<void> {
        if (!this.data.onUnload || this.status === RecipleModuleStatus.Unloaded) return;

        const data = await Promise.resolve(this.data.onUnload({
            client: this.client,
            module: this
        }));

        if (data !== undefined) throw (typeof data === 'string' ? RecipleError.createUnloadModuleErrorOptions(this.displayName, data) : data);
    }

    public toString() {
        return this.displayName;
    }
}
