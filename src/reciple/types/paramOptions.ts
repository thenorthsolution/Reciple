import { ConfigCommandPermissions } from '../classes/RecipleConfig';
import { Awaitable, PermissionsBitField } from 'discord.js';
import { RecipleModule } from '../classes/RecipleModule';
import { AnyCommandBuilder } from './builders';

export interface UserHasCommandPermissionsOptions {
    /**
     * Command builder
     */
    builder: AnyCommandBuilder;
    /**
     * Member permissions
     */
    memberPermissions?: PermissionsBitField;
    /***
     * Required command config permissions
     */
    commandPermissions?: {
        enabled: boolean;
        commands: ConfigCommandPermissions[];
    };
}

export interface ModuleManagerResolveModuleFilesOptions {
    /**
     * valid reciple module (ESM or CJS) Javascript file paths
     */
    files: string[];
    /**
     * Allow loading unsupported module versions
     * @default false
     */
    disabeVersionCheck?: boolean;
    /**
     * Ignore errors
     * @dafault true
     */
    ignoreErrors?: boolean;
}

export interface ModuleManagerGetModulePathsOptions {
    /**
     * Get javascript module file paths from folders
     */
    folders?: string[];
    /**
     * Add ignored files (wildcard)
     * @example _*.js // Ignores _module.js and _hi.js
     */
    ignoredFiles?: string[];
    /**
     * Filter found javascript files
     * @param file Loaded javascript file
     * @returns `true` if the path is acceptable
     */
    filter?: (file: string) => boolean;
}

export interface ModuleManagerStartModulesOptions {
    /**
     * Modules to start
     */
    modules: RecipleModule[];
    /**
     * Add modules to Client modules collection
     * @default true
     */
    addToModulesCollection?: boolean;
    /**
     * Ignore errors
     * @default true
     */
    ignoreErrors?: boolean;
}

export interface ModuleManagerLoadModulesOptions {
    /**
     * Modules to execute `load` method
     */
    modules?: RecipleModule[];
    /**
     * Add commands to client
     * @default true
     */
    resolveCommands?: boolean;
    /**
     * Ignore errors
     * @default true
     */
    ignoreErrors?: boolean;
}

export interface ModuleManagerUnloadModulesOptions {
    /**
     * Modules to execute `unload` method
     */
    modules?: RecipleModule[];
    /**
     * Reason for unloading modules
     */
    reason?: string;
    /**
     * Ignore errors
     * @default true
     */
    ignoreErrors?: boolean;
}
