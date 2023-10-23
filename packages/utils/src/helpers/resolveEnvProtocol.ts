import { DotenvConfigOptions, config } from 'dotenv';

export function resolveEnvProtocol(str: string, envOptions?: DotenvConfigOptions): string|null {
    if (!str.toLowerCase().startsWith('env:')) return str;
    if (envOptions) config(envOptions);

    const variable = str.substring(4);
    return process.env[variable] ?? null;
}
