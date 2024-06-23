import type { PackageManager } from '@reciple/utils';

export interface CliOptions {
    force: boolean;
    typescript: boolean|'null';
    esm: boolean|'null';
    commonjs: boolean|'null';
    packageManager: PackageManager|'null';
    token?: string;
    addons: string[]|boolean;
    [k: string]: any;
}

export interface TemplateMetadata extends TemplateJson {
    id: string;
    path: string;
    files: string[];
}

export interface TemplateJson {
    name: string;
    language: 'Javascript'|'Typescript';
}
