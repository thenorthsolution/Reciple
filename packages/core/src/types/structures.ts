export interface RecipleClientConfig {
    token: string;
    version: string;
}

export type AnyCommandPreconditionFunction = Function;
export type AnyCommandHaltFunction = Function;
export type AnyCommandExecuteFunction = Function;
