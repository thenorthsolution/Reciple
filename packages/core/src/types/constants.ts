import semver from 'semver';

export const buildVersion = '[VI]{{inject}}[/VI]';
export const version = semver.coerce(buildVersion)!.toString();
export const recipleModuleMetadataSymbol = Symbol('recipleMetadata');

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
