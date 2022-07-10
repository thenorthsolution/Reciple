import { Guild, TextBasedChannel, User } from 'discord.js';

export interface CooledDownUser {
    user: User;
    channel: TextBasedChannel;
    guild?: Guild;
    duration: number;
}

export class CommandCooldowns extends Array<CooledDownUser|undefined> {
    /**
     * Alias for `CommandCooldowns#push()`
     */
    add(options: CooledDownUser) { 
        return this.push(options);
    }

    remove(user: User|string) {
        if (typeof user !== 'string') user = user?.id;

        for(const key in this) {
            if (this[key]?.user.id !== user) continue;

            delete this[key];
        }
    }
}
