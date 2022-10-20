import { ConfigCommandPermissions } from '../classes/RecipleConfig';
import { PermissionsBitField } from 'discord.js';
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

export interface ClientModuleManagerGetModulesFromFilesOptions {
    files: string[];
    disabeVersionCheck?: boolean;
    dontSkipError?: boolean;
}
