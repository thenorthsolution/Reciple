import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import semver from 'semver';

export const buildVersion = JSON.parse(readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '../../package.json'), 'utf-8')).version;
export const version = semver.coerce(buildVersion)!.toString();

export enum CommandType {
    ContextMenuCommand = 1,
    MessageCommand,
    SlashCommand
}

export enum CommandHaltReason {
    Error = 1,
    Cooldown,
    InvalidArguments,
    MissingArguments,
    PreconditionTrigger
}

export enum RecipleModuleStatus {
    Unloaded = 1,
    Started,
    Loaded
}

export enum CommandPermissionsPreconditionResultDataType {
    BotNotAllowed = 1,
    NoDmPermission,
    ClientNotEnoughPermissions,
    MemberNotEnoughPermissions
}
