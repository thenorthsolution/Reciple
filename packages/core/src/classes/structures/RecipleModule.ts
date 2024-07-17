import type { AnyCommandBuilder, AnyCommandResolvable } from '../../types/structures.js';
import { RecipleModuleStatus } from '../../types/constants.js';
import { ModuleManager } from '../managers/ModuleManager.js';
import { type RestOrArray, normalizeArray } from 'discord.js';
import type { RecipleClient } from './RecipleClient.js';
import { RecipleError } from './RecipleError.js';
import { kleur } from 'fallout-utility/strings';
import { Utils } from './Utils.js';
import semver from 'semver';
import path from 'node:path';

export interface RecipleModuleData {
    /**
     * The id of your module.
     * The id only accepts lowercase letters and cannot contain spaces or special characters.
     */
    id?: string;
    /**
     * The name of your module. This is used to display when logging the module into the console.
     */
    name?: string;
    /**
     * The supported reciple client versions of the module.
     */
    versions?: string|string[];
    /**
     * The commands that the module will use.
     */
    commands?: AnyCommandResolvable[];
    /**
     * The function that is executed when the module is resolved. (Bot's Pre-login)
     * @param data The data that is passed to the module.
     */
    onStart(data: RecipleModuleStartData): boolean|string|Error|Promise<boolean|string|Error>;
    /**
     * The function that is executed when the module is loaded. (Bot's Post-login)
     * @param data The data that is passed to the module.
     */
    onLoad?(data: RecipleModuleLoadData): void|string|Error|Promise<void|string|Error>;
    /**
     * The function that is executed when the module is unloaded. (Bot's Pre-logout)
     * @param data The data that is passed to the module.
     */
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

export interface RecipleModuleUnloadData {
    client: RecipleClient;
    module: RecipleModule;
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
    private root?: string;

    get name(): string|undefined { return this.data.name; }
    get displayName(): string { return this.name ?? (this.file && this.root ? path.relative(this.root, this.file) : this.file) ?? this.id; }
    get versions(): string[] { return normalizeArray([this.data.versions ?? 'latest'] as RestOrArray<string>); }
    get commands(): AnyCommandBuilder[] { return this.data.commands?.map(c => Utils.resolveCommandBuilder(c)) ?? []; }
    get supported(): boolean { return this.versions.some(v => v === "latest" || semver.satisfies(this.client.version, v)); }

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
        })).catch(err => err);

        if (data === true) {
            this.status = RecipleModuleStatus.Started;
            return;
        }

        if (data === false) throw new RecipleError(RecipleError.createStartModuleErrorOptions(this.displayName, `Returned ${kleur.yellow('false')} on start`));

        throw (typeof data === 'string' ? new RecipleError(RecipleError.createStartModuleErrorOptions(this.displayName, data)) : data);
    }

    public async load(): Promise<void> {
        if (!this.data.onLoad || this.status === RecipleModuleStatus.Loaded || !this.client.isReady()) return;

        const data = await Promise.resolve(this.data.onLoad({
            client: this.client,
            module: this
        })).catch(err => err);

        if (data) throw (data instanceof Error ? data : RecipleError.createLoadModuleErrorOptions(this.displayName, data));

        this.status = RecipleModuleStatus.Loaded;
    }

    public async unload(): Promise<void> {
        if (!this.data.onUnload || this.status === RecipleModuleStatus.Unloaded || !this.client.isReady()) return;

        const data = await Promise.resolve(this.data.onUnload({
            client: this.client,
            module: this
        })).catch(err => err);

        if (data) throw (data instanceof Error ? data : RecipleError.createUnloadModuleErrorOptions(this.displayName, data));

        this.status = RecipleModuleStatus.Unloaded;
    }

    public toString() {
        return this.displayName;
    }

    public toJSON() {
        return {
            id: this.id,
            data: this.data,
            file: this.file,
            status: this.status
        };
    }

    public static getModuleRoot(module: RecipleModule): string|null {
        return module.root ?? null;
    }
}
