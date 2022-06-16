import { Logger } from 'fallout-utility';
import { flags } from './flags';

export default function (stringifyJSON: boolean, debugmode: boolean = false) {
    return new Logger("Main", {
        addPrefixToEveryJsonNewLines: stringifyJSON,
        stringifyJSON: stringifyJSON,
        setDebugging: flags.debugmode as boolean|undefined || debugmode
    });
}
