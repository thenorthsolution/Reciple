import { s } from '@sapphire/shapeshift';
import { RecipleModuleScript } from '../RecipleModule';
import { recipleModuleVersionsPredicate } from '../../utils/predicates';
import { isValidationEnabled } from 'discord.js';
import { CommandAssertions } from './CommandAssertions';

export class RecipleModuleAssertions {
    public static validateModuleScriptVersions(versions: unknown): asserts versions is RecipleModuleScript['versions'] {
        recipleModuleVersionsPredicate.setValidationEnabled(isValidationEnabled).parse(versions);
    }

    public static validateModuleOnStart(onStart: unknown): asserts onStart is RecipleModuleScript['onLoad'] {
        s.instance(Function).setValidationEnabled(isValidationEnabled).parse(onStart);
    }

    public static validateModuleOnLoad(onLoad: unknown): asserts onLoad is RecipleModuleScript['onLoad'] {
        s.instance(Function).optional.setValidationEnabled(isValidationEnabled).parse(onLoad);
    }

    public static validateModuleOnUnload(onUnload: unknown): asserts onUnload is RecipleModuleScript['onLoad'] {
        s.instance(Function).optional.setValidationEnabled(isValidationEnabled).parse(onUnload);
    }

    public static validateModuleContextMenuCommandPrecondition(precondition: unknown): asserts precondition is RecipleModuleScript['contextMenuCommandPrecondition'] {
        s.instance(Function).optional.setValidationEnabled(isValidationEnabled).parse(precondition);
    }

    public static validateModuleMessageCommandPrecondition(precondition: unknown): asserts precondition is RecipleModuleScript['messageCommandPrecondition'] {
        s.instance(Function).optional.setValidationEnabled(isValidationEnabled).parse(precondition);
    }

    public static validateModuleSlashCommandPrecondition(precondition: unknown): asserts precondition is RecipleModuleScript['slashCommandPrecondition'] {
        s.instance(Function).optional.setValidationEnabled(isValidationEnabled).parse(precondition);
    }

    public static validateModuleScript(moduleScript: unknown, validateCommands: boolean = false): asserts moduleScript is RecipleModuleScript {
        const script = moduleScript as Partial<RecipleModuleScript>;

        this.validateModuleScriptVersions(script?.versions)

        // commands
        s.unknown.array.optional.setValidationEnabled(isValidationEnabled).parse(script?.commands);

        if (validateCommands && script.commands) {
            for (const command of script.commands) {
                CommandAssertions.validateCommand(command);
            }
        }

        this.validateModuleOnStart(script.onStart);
        this.validateModuleOnLoad(script?.onLoad);
        this.validateModuleOnUnload(script?.onUnload);
        this.validateModuleContextMenuCommandPrecondition(script?.contextMenuCommandPrecondition);
        this.validateModuleMessageCommandPrecondition(script?.messageCommandPrecondition);
        this.validateModuleSlashCommandPrecondition(script?.slashCommandPrecondition);
    }

}
