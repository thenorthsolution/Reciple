import { semverRegex } from '@reciple/utils';
import { Validators } from './Validators';
import { s } from '@sapphire/shapeshift';
import { } from 'semver';
import { BaseCommandValidators } from './BaseCommandValidators';
import { RecipleModuleData } from '../structures/RecipleModule';

export class RecipleModuleDataValidators extends Validators {
    public static id = s.string.regex(/^[a-zA-Z0-9_.-]+$/).optional;
    public static name = s.string.optional;
    public static versions = s.union(s.string.regex(semverRegex), s.string.regex(/latest/), s.union(s.string.regex(semverRegex), s.string.regex(/latest/)).array);
    public static commands = s.union(BaseCommandValidators.BaseCommandBuilderData, this.jsonEncodable).array.optional;
    public static onStart = s.instance(Function);
    public static onLoad = s.instance(Function).optional;
    public static onUnload = s.instance(Function).optional;

    public static RecipleModuleData = s.object({
        id: this.id,
        name: this.name,
        versions: this.versions,
        commands: this.commands,
        onStart: this.onStart,
        onLoad: this.onLoad,
        onUnload: this.onUnload,
    });

    public static isValidId(id: unknown): asserts id is RecipleModuleData['id'] {
        this.id.setValidationEnabled(this.isValidationEnabled).parse(id);
    }

    public static isValidName(name: unknown): asserts name is RecipleModuleData['name'] {
        this.name.setValidationEnabled(this.isValidationEnabled).parse(name);
    }

    public static isValidVersions(versions: unknown): asserts versions is RecipleModuleData['versions'] {
        this.versions.setValidationEnabled(this.isValidationEnabled).parse(versions);
    }

    public static isValidCommands(commands: unknown): asserts commands is RecipleModuleData['commands'] {
        this.commands.setValidationEnabled(this.isValidationEnabled).parse(commands);
    }

    public static isValidOnStart(onStart: unknown): asserts onStart is RecipleModuleData['onStart'] {
        this.onStart.setValidationEnabled(this.isValidationEnabled).parse(onStart);
    }

    public static isValidOnLoad(onLoad: unknown): asserts onLoad is RecipleModuleData['onLoad'] {
        this.onLoad.setValidationEnabled(this.isValidationEnabled).parse(onLoad);
    }

    public static isValidOnUnload(onUnload: unknown): asserts onUnload is RecipleModuleData['onUnload'] {
        this.onUnload.setValidationEnabled(this.isValidationEnabled).parse(onUnload);
    }

    public static isValidRecipleModuleData(data: unknown, checkCommands?: boolean): asserts data is RecipleModuleData {
        const i = data as RecipleModuleData;

        this.isValidId(i.id);
        this.isValidName(i.name);
        this.isValidVersions(i.versions);
        this.isValidOnStart(i.onStart);
        this.isValidOnLoad(i.onLoad);
        this.isValidOnUnload(i.onUnload);

        if (checkCommands && i.commands) {
            for (const command of i.commands) {
                BaseCommandValidators.isValidBaseCommandBuilderData(command);
            }
        }
    }
}
