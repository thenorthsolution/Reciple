import { ConfigCommandPermissions } from '../classes/RecipleConfig';
import { RecipleModule, RecipleScript } from '../modules';
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
