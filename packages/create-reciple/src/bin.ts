#!/usr/bin/env node

import { packageJson, packageManagers, templatesFolder } from './utils/constants.js';
import { getTemplates } from './utils/helpers.js';
import type { CliOptions } from './utils/types.js';
import { Setup } from './classes/Setup.js';
import { kleur } from 'fallout-utility';
import { outro, select } from '@clack/prompts';
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
    addons: Array.isArray(options.addons) && options.addons.length ? options.addons : undefined
});

await setup.prompt(options.force || false);

const availableTemplates = templates.filter(p => p.language === (setup.isTypescript ? 'Typescript' : 'Javascript'));
if (!availableTemplates.length) {
    setup.cancelPrompts(`Template not found`);
    process.exit(1);
}

const templateId = availableTemplates.length === 1
    ? availableTemplates[0].id
    : await select({
        message: 'Select a template',
        options: availableTemplates.map(t => ({
            label: t.name,
            value: t.id
        })),
        maxItems: 1
    });
const template = templates.find(t => t.id === templateId)!;

if (setup.packageManager && !packageManagers.some(p => p.value === setup.packageManager)) {
    setup.cancelPrompts(`Invalid package manager`);
    process.exit(1);
}

if (setup.introShown) outro(`Setup Done! Creating from ${kleur.cyan().bold(template.name)} template`);

const templateBuilder = new TemplateBuilder({
    setup: setup.toJSON(),
    template
});

await templateBuilder.build();
