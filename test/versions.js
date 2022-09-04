const semver = require('semver');
const { isSupportedVersion } = require('../bin/reciple/version');

const versions = [
    '^2.0.0',
    '^3.0.0',
    '^3.0.1',
    '^3.1.0',
    '^3.1.1',
    '^3.2.0',
    '^3.2.1',
    '^3.3.0',
    '^3.3.1'
];

const master = '3.2.0';

console.log(versions.map(v => `[${master}] ${v} - ${isSupportedVersion(v, master)}`).join('\n----------------------------------\n'));
