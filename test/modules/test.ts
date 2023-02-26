import { RecipleModuleScript, realVersion } from 'reciple';

export default {
    versions: [`^${realVersion}`],
    commands: [],
    onStart() {
        return true;
    }
} satisfies RecipleModuleScript;
