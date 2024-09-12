import type { Snowflake } from 'discord-api-types/globals';

/**
 * Check if string is a valid Discord snowflake
 * @param snowflake a value that could be a snowflake
 */
export function isValidSnowflake(snowflake: unknown): snowflake is Snowflake {
    if (typeof snowflake !== 'string') return false;

    try {
        BigInt(snowflake);
        return true;
    } catch (err) {
        return false;
    }
}

/**
 * Check if the terminal supports unicode
 */
export function isUnicodeSupported() {
	if (process.platform !== 'win32') {
		return process.env.TERM !== 'linux'; // Linux console (kernel)
	}

	return Boolean(process.env.CI)
		|| Boolean(process.env.WT_SESSION) // Windows Terminal
		|| Boolean(process.env.TERMINUS_SUBLIME) // Terminus (<0.2.27)
		|| process.env.ConEmuTask === '{cmd::Cmder}' // ConEmu and cmder
		|| process.env.TERM_PROGRAM === 'Terminus-Sublime'
		|| process.env.TERM_PROGRAM === 'vscode'
		|| process.env.TERM === 'xterm-256color'
		|| process.env.TERM === 'alacritty'
		|| process.env.TERMINAL_EMULATOR === 'JetBrains-JediTerm';
}
