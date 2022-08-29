const fs = require('fs');

fs.writeFileSync('bin/cjs/package.json', JSON.stringify({ type: "commonjs" }, null, 2));
fs.writeFileSync('bin/mjs/package.json', JSON.stringify({ type: "module" }, null, 2));
