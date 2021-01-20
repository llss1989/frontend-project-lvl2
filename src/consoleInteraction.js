import program from 'commander';
import { buildAst } from './index.js';
import { stylish, plain } from './formatters/index.js';

const interfaceWithTheConsole = () => {
  program
    .version('0.1.0')
    .description('Compares two configuration files and shows a difference.')
    .option('-f, --format [type]', 'Output format', 'stylish')
    .arguments('<filePath1> <filePath2>')
    .action((filePath1, filePath2, options) => {
      if (options.format === 'plain') {
        console.log(plain(buildAst(filePath1, filePath2)));
      } else if (options.format === 'stylish') {
        const result = stylish(buildAst(filePath1, filePath2));
        console.log(`\n${result}\n`);
      } else {
        throw Error('dont have this formatter!');
      }
    });
  program.parse(process.argv);
};


export default interfaceWithTheConsole;
