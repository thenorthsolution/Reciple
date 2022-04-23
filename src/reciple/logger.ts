import { Logger } from 'fallout-utility';

export function logger (stringifyJSON: boolean, debugmode: boolean = false) {
    return new Logger("Main", {
        addPrefixToEveryJsonNewLines: stringifyJSON,
        stringifyJSON: stringifyJSON,
        setDebugging: debugmode
    });
}