import program from 'commander';
import genDiff, { buildAst } from './index.js';
import { stylish, plain, json } from './formatters/index.js';

const interfaceWithTheConsole = () => {
  program
    .version('0.1.0')
    .description('Compares two configuration files and shows a difference.')
    .option('-f, --format [type]', 'Output format', 'stylish')
    .arguments('<filePath1> <filePath2>')
    .action((filePath1, filePath2, options) => {
      console.log(genDiff(filePath1, filePath2, options.format));
    });
  program.parse(process.argv);
};
export default interfaceWithTheConsole;
