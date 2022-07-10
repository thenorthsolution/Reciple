import { Guild, TextBasedChannel, User } from 'discord.js';
import { recipleCommandBuilders } from '../modules';

export interface CooledDownUser {
    user: User;
    channel: TextBasedChannel;
    command: string;
    type: recipleCommandBuilders["builder"];
    guild?: Guild|null;
    expireTime: number;
}

export class CommandCooldowns extends Array<CooledDownUser> {
    /**
     * Alias for `CommandCooldowns#push()`
     */
    add(...options: CooledDownUser[]) { 
        return this.push(...options);
    }

    remove(user: User|string, command?: string, type?: recipleCommandBuilders["builder"]) {
        if (typeof user !== 'string') user = user?.id;

        for(const key in this) {
            if (this[key].user.id !== user) continue;
            if (command && this[key].command !== command) continue;
            if (type && this[key].type !== type) continue;

            this.splice(Number(key), 1);
        }
    }

    isCooledDown(user: User|string): boolean {
        if (typeof user !== 'string') user = user?.id;
        if (!user) throw new TypeError(`User is not valid`);

        const data = this.find(c => c.user.id == user);
        if (!data) return false;
        if (Date.now() < data.expireTime) return false;
        
        this.remove(user, data.command, data.type);
        return true;
    }

    clean(): void {
        for (const key in this) {
            const data = this[key];
            if (Date.now() >= data.expireTime) this.remove(data.user, data.command, data.type);
        }
    }
}
