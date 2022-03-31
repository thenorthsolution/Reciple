import { Logger } from 'fallout-utility';

export function logger (stringifyJSON: boolean) {
    return new Logger("Main", {
        addPrefixToEveryJsonNewLines: stringifyJSON,
        stringifyJSON: stringifyJSON,
    });
}