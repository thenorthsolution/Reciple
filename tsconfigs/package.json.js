// @ts-check
const fs = require('fs');
const path = require('path');

fs.writeFileSync('bin/cjs/package.json', JSON.stringify({ type: "commonjs" }, null, 2));
fs.writeFileSync('bin/mjs/package.json', JSON.stringify({ type: "module" }, null, 2));

console.log(`Fixing esm imports`);

fixImports(path.join(process.cwd(), 'bin/mjs'));

function fixImports(dir) {
    const files = fs.readdirSync(dir).map(p => path.join(dir, p));

    for (const file of files) {
        if (fs.lstatSync(file).isDirectory()) {
            fixImports(file);
            continue;
        }

        const contents = fs.readFileSync(file, 'utf-8');
        
        let newContents = contents.replace(/(import .* from\s+['"])(.*)(?=['"])/g, '$1$2.js');
            newContents = newContents.replace(/(export .* from\s+['"])(.*)(?=['"])/g, '$1$2.js');

        fs.writeFileSync(file, newContents);
        console.log(file);
    }
}
