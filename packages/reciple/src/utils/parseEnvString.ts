import dotenv from 'dotenv';

export function parseEnvString(value: string, envFile?: string): string {
    const env = String(value).split(':');
    if (env.length !== 2 || env[0].toLowerCase() !== 'env') return value;

    if (envFile) {
        dotenv.config({
            path: envFile,
            override: true
        });
    }

    return process.env[env[1]] ?? '';
}
