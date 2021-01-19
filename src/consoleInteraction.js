import program from 'commander';
import { buildAst } from './index.js';
import { stylish , plain } from './formatters/index.js';

const interfaceWithTheConsole = () => {
  program
    .version('0.1.0')
    .description('Compares two configuration files and shows a difference.')
    .option('-f, --format [type]', 'Output format')
    .arguments('<filePath1> <filePath2>')
    .action((filePath1, filePath2, options) => {
      if (options.format === 'plain') {
        console.log(plain(buildAst('./__fixtures__/packageRecursive.json', './__fixtures__/packageRecursive2.json')));
      }
      if (!options.format) {
        const result = stylish(buildAst(filePath1, filePath2));
        console.log(`\n${result}\n`);
      }
    });
  program.parse(process.argv);
};

export default interfaceWithTheConsole;
