const mask = require('json-mask')
const pkg = require('../package.json')
const list = [
    'name',
    'version',
    'license',
    'description',
    'repository',
    'dependencies',
    'keywords',
]
const out = mask(pkg, list.join(','))
out.module = 'esm/browser.js'
out.main = 'cjs/index.js'
out.types = 'cjs/index.d.ts'
console.log(JSON.stringify(out))
