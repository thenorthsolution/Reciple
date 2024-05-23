import { BaseCommandValidators } from './BaseCommandValidators';
import { RecipleModuleData } from '../structures/RecipleModule';
import { Validators } from './Validators';

export class RecipleModuleDataValidators extends Validators {
    public static id = RecipleModuleDataValidators.s
        .string({ message: 'Expected string for module .id' })
        .regex(/^[a-zA-Z0-9_.-]+$/, { message: 'Module id cannot contain any spaces and special characters other than "_", "-", "."' })
        .optional();

    public static name = RecipleModuleDataValidators.s
        .string({ message: 'Expected string for module .name' })
        .optional();

    public static versions = RecipleModuleDataValidators.s
        .union([
            RecipleModuleDataValidators.s.string(),
            RecipleModuleDataValidators.s.string().array()
        ], { message: 'Expected string or array of strings for module .versions' });

    public static commands = RecipleModuleDataValidators.s
        .union([
            BaseCommandValidators.BaseCommandBuilderData,
            RecipleModuleDataValidators.jsonEncodable
        ], { message: 'Expected command builders or command object data for module .commands' })
        .array({ message: 'Expected an array of command builder or command object data for module .commands' })
        .optional();

    public static onStart = RecipleModuleDataValidators.s
        .instance(Function, { message: 'Expected a function for module .onStart' });

    public static onLoad = RecipleModuleDataValidators.s
        .instance(Function, { message: 'Expected a function for module .onLoad' })
        .optional();

    public static onUnload = RecipleModuleDataValidators.s
        .instance(Function, { message: 'Expected a function for module .onUnload' })
        .optional();

    public static RecipleModuleData = RecipleModuleDataValidators.s.object({
        id: RecipleModuleDataValidators.id,
        name: RecipleModuleDataValidators.name,
        versions: RecipleModuleDataValidators.versions,
        commands: RecipleModuleDataValidators.commands,
        onStart: RecipleModuleDataValidators.onStart,
        onLoad: RecipleModuleDataValidators.onLoad,
        onUnload: RecipleModuleDataValidators.onUnload,
    });

    public static isValidId(id: unknown): asserts id is RecipleModuleData['id'] {
        RecipleModuleDataValidators.id.setValidationEnabled(RecipleModuleDataValidators.isValidationEnabled).parse(id);
    }

    public static isValidName(name: unknown): asserts name is RecipleModuleData['name'] {
        RecipleModuleDataValidators.name.setValidationEnabled(RecipleModuleDataValidators.isValidationEnabled).parse(name);
    }

    public static isValidVersions(versions: unknown): asserts versions is RecipleModuleData['versions'] {
        RecipleModuleDataValidators.versions.setValidationEnabled(RecipleModuleDataValidators.isValidationEnabled).parse(versions);
    }

    public static isValidCommands(commands: unknown): asserts commands is RecipleModuleData['commands'] {
        RecipleModuleDataValidators.commands.setValidationEnabled(RecipleModuleDataValidators.isValidationEnabled).parse(commands);
    }

    public static isValidOnStart(onStart: unknown): asserts onStart is RecipleModuleData['onStart'] {
        RecipleModuleDataValidators.onStart.setValidationEnabled(RecipleModuleDataValidators.isValidationEnabled).parse(onStart);
    }

    public static isValidOnLoad(onLoad: unknown): asserts onLoad is RecipleModuleData['onLoad'] {
        RecipleModuleDataValidators.onLoad.setValidationEnabled(RecipleModuleDataValidators.isValidationEnabled).parse(onLoad);
    }

    public static isValidOnUnload(onUnload: unknown): asserts onUnload is RecipleModuleData['onUnload'] {
        RecipleModuleDataValidators.onUnload.setValidationEnabled(RecipleModuleDataValidators.isValidationEnabled).parse(onUnload);
    }

    public static isValidRecipleModuleData(data: unknown, checkCommands?: boolean): asserts data is RecipleModuleData {
        const i = data as RecipleModuleData;

        RecipleModuleDataValidators.isValidId(i.id);
        RecipleModuleDataValidators.isValidName(i.name);
        RecipleModuleDataValidators.isValidVersions(i.versions);
        RecipleModuleDataValidators.isValidOnStart(i.onStart);
        RecipleModuleDataValidators.isValidOnLoad(i.onLoad);
        RecipleModuleDataValidators.isValidOnUnload(i.onUnload);

        if (checkCommands && i.commands) {
            for (const command of i.commands) {
                BaseCommandValidators.isValidBaseCommandBuilderData(command);
            }
        }
    }
}
