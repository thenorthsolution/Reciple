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
    PreconditionError
}
