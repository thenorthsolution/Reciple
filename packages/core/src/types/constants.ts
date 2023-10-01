import { readFileSync } from 'fs';
import path from 'path';
import semver from 'semver';

export const buildVersion = JSON.parse(readFileSync(path.join(__dirname, '../../package.json'), 'utf-8')).version;
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
    ValidateOptionError,
    MissingMemberPermissions,
    MissingBotPermissions,
    NoExecuteHandler,
    PreconditionTrigger
}

export enum RecipleModuleStatus {
    Unloaded = 1,
    Started,
    Loaded
}
