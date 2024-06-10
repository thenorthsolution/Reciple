#!/usr/bin/env node

import { packageJson, packageManagers, templatesFolder } from './utils/constants.js';
import { getTemplates } from './utils/helpers.js';
import { CliOptions } from './utils/types.js';
import { Setup } from './classes/Setup.js';
import { kleur } from 'fallout-utility';
import { outro } from '@clack/prompts';
import { Command } from 'commander';
import { TemplateBuilder } from './classes/TemplateBuilder.js';

const command = new Command()
    .name(packageJson.name!)
    .description(packageJson.description!)
    .version(packageJson.version!, '-v, --version')
    .argument('[dir]', 'Create template in this folder')
    .option('--force', 'Force override existing files in directory', false)
    .option('--typescript', 'Use typescript templates', 'null')
    .option('--package-manager <npm,yarn,pnpm>', 'Set package manager', 'null')
    .option('-t, --token <DiscordToken>', 'Add token to created .env')
    .option('--no-addons', 'Disable addons prompt', false)
    .option('-a, --addons <addon...>', 'Add a Reciple official addons', []);

command.parse(process.argv);

const options = command.opts<CliOptions>();
const templates = await getTemplates(templatesFolder);

const setup = new Setup({
    dir: command.args[0] || undefined,
    isTypescript: (options.typescript !== 'null' ? options.typescript : '') || undefined,
    packageManager: (options.packageManager !== 'null' ? options.packageManager : '') || undefined,
    token: options.token || undefined,
    addons: Array.isArray(options.addons) ? options.addons : undefined
});

await setup.prompt(options.force || false);

const template = templates.find(p => p.language === (setup.isTypescript ? 'Typescript' : 'Javascript'));
if (!template) {
    setup.cancelPrompts(`Template not found`);
    process.exit(1);
}

if (setup.packageManager && !packageManagers.some(p => p.value === setup.packageManager)) {
    setup.cancelPrompts(`Invalid package manager`);
    process.exit(1);
}

if (setup.isDone) outro(`Setup Done! Creating from ${kleur.cyan().bold(template.name)} template`);

const templateBuilder = new TemplateBuilder({
    setup: setup.toJSON(),
    template
});

await templateBuilder.build();
