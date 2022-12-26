import { PermissionResolvable, PermissionsBitField, RestOrArray, isValidationEnabled } from 'discord.js';
import { AnyCommandExecuteFunction, AnyCommandHaltFunction, CommandType } from '../../types/builders';

export abstract class BaseCommandBuilder<Metadata = unknown> {
    abstract readonly type: CommandType;
    abstract halt?: AnyCommandHaltFunction<Metadata>;
    abstract execute: AnyCommandExecuteFunction<Metadata>;

    public metadata?: Metadata;
    public cooldown: number = 0;
    public requiredBotPermissions: bigint|null = null;
    public requiredMemberPermissions: bigint|null = null;

    public setCooldown(cooldown: number): this {
        this.cooldown = cooldown;
        return this;
    }

    public setRequiredBotPermissions(permissions: PermissionResolvable|null): this {
        this.requiredBotPermissions = permissions ? new PermissionsBitField(permissions).bitfield : null;
        return this;
    }

    public setRequiredMemberPermissions(permissions: PermissionResolvable|null): this {
        this.requiredMemberPermissions = permissions ? new PermissionsBitField(permissions).bitfield : null;
        return this;
    }

    public setHalt(halt?: AnyCommandHaltFunction<Metadata> | null): this {
        this.halt = halt || undefined;
        return this;
    }

    public setExecute(execute: AnyCommandExecuteFunction<Metadata>): this {
        if (isValidationEnabled() && (!execute || typeof execute !== 'function')) throw new Error('execute must be a function.');
        this.execute = execute;
        return this;
    }

    public setMetadata(metadata?: Metadata): this {
        this.metadata = metadata;
        return this;
    }
}
