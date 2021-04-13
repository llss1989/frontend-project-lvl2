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

test('stylish', () => {
  expect(genDiff(getPathOfFile('before.json'), getPathOfFile('after.json'))).toEqual(getResult(getPathOfFile('stylishExpected')));
});
test('plain with yml files', () => {
  expect(genDiff(getPathOfFile('before.yml'), getPathOfFile('after.yml'))).toEqual(getResult(getPathOfFile('stylishExpected')));
});
test('work with different file types', () => {
  expect(genDiff(getPathOfFile('before.yml'), getPathOfFile('after.json'))).toEqual(getResult(getPathOfFile('stylishExpected')));
});