import path, { dirname } from 'path';
import pkgDir from 'pkg-dir';
import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// console.log(path.dirname(require.main.filename));
// var path = require('path');
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// console.log(__filename);
// console.log(__dirname);
console.log(path.isAbsolute('/frontend/lvl1/index.js'))
// Example of usage:
// var root = require('root'); // In root will be absolute path to your application