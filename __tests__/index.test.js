import fs from 'fs';
import path from 'path';
import genDiff from '../src/index.js';

const getPathOfFile = (nameOfFile) => path.resolve(process.cwd(), '__fixtures__', nameOfFile);
const getResult = (filepath) => fs.readFileSync(filepath, 'utf8');

test('basic', () => {
  expect(genDiff(getPathOfFile('before.json'), getPathOfFile('after.json'))).toEqual(getResult(getPathOfFile('stylishExpected')));
});
test('plain', () => {
  expect(genDiff(getPathOfFile('before.json'), getPathOfFile('after.json'), 'plain')).toEqual(getResult(getPathOfFile('plainExpected')));
});
test('json', () => {
  expect(() => JSON.parse(genDiff(getPathOfFile('before.json'), getPathOfFile('after.json'), 'json'))).not.toThrow();
});

test('stylish', () => {
  expect(genDiff(getPathOfFile('before.yml'), getPathOfFile('after.yml'))).toEqual(getResult(getPathOfFile('stylishExpected')));
});
