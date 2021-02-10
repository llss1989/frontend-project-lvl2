import fs from 'fs';
import path from 'path';
import genDiff from '../src/index.js';

const getPathOfFile = (nameOfFile) => path.resolve(process.cwd(), '__fixtures__', nameOfFile);
const getResult = (filepath) => fs.readFileSync(filepath, 'utf8');

test('basic', () => {
  expect(genDiff(getPathOfFile('before.json'), getPathOfFile('after.json'))).toEqual(getResult(getPathOfFile('stylishExpected')));
});
test('json', () => {
  expect(() => JSON.parse(genDiff(getPathOfFile('before.json'), getPathOfFile('after.json'), 'json'))).not.toThrow();
});
const cases = [['before.json', 'after.json', 'stylish'], ['before.yml', 'after.json', 'plain'], ['before.yml', 'after.json', 'plain']];

describe('add utility', () => {
  test.each(cases)(
    'test different formatteres',
    (firstFile, secondFile, formatter) => {
      expect(genDiff(getPathOfFile(firstFile), getPathOfFile(secondFile), formatter)).toEqual(getResult(getPathOfFile(`${formatter}Expected`)));
    },
  );
});
