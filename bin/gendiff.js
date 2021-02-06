#!/usr/bin/env node
import program from 'commander';
import genDiff from '../src/index.js';

program
  .version('0.1.0')
  .description('Compares two configuration files and shows a difference.')
  .option('-f, --format [type]', 'Output format', 'stylish')
  .arguments('<filePath1> <filePath2>')
  .action((filePath1, filePath2, options) => {
    console.log(genDiff(filePath1, filePath2, options.format));
  });
program.parse(process.argv);
