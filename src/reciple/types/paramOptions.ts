import { RecipleModule, RecipleScript } from '../classes/managers/ClientModuleManager';
import { ConfigCommandPermissions } from '../classes/RecipleConfig';
import { PermissionsBitField } from 'discord.js';
import { AnyCommandBuilder } from './builders';

export interface RecipleClientAddModuleOptions {
    /**
     * The module script
     */
    script: RecipleScript;
    /**
     * Register application commands if possible
     */
    registerApplicationCommands?: boolean;
    /**
     * Module optional info
     */
    moduleInfo?: RecipleModule["info"];
}

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
    commandPermissions?: { enabled: boolean; commands: ConfigCommandPermissions[]; };
}

export interface ModuleManagerResolveFilesOptions {
    files: string[];
    disabeVersionCheck?: boolean;
    dontSkipError?: boolean;
}
