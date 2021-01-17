import program from 'commander';
import { stylish, buildAst } from './index.js';

const interfaceWithTheConsole = () => {
  program
    .version('0.1.0')
    .description('Compares two configuration files and shows a difference.')
    .option('-f, --format [type]', 'Output format')
    .arguments('<filePath1> <filePath2>')
    .action((filePath1, filePath2) => {
      const result = stylish(buildAst(filePath1, filePath2));
      console.log(`\n${result}\n`);
    });

  program.parse(process.argv);
};

export default interfaceWithTheConsole;
