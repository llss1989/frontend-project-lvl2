import fs from 'fs';
import path from 'path';
import genDiff from '../src/index.js';

const getPathOfFile = (nameOfFile) => path.resolve(process.cwd(), '__fixtures__', nameOfFile);
const getResult = (filepath) => fs.readFileSync(filepath, 'utf8');

test('basic', () => {
  expect(genDiff(getPathOfFile('package.json'), getPathOfFile('package2.json'))).toEqual(getResult(getPathOfFile('expected')));
});
test('basic-yaml', () => {
  expect(genDiff(getPathOfFile('package.yml'), getPathOfFile('package2.yml'))).toEqual(getResult(getPathOfFile('expected')));
});

test('recursive', () => {
  expect(genDiff(getPathOfFile('packageRecursive.json'), getPathOfFile('packageRecursive2.json'))).toEqual(getResult(getPathOfFile('recursiveExpected')));
});
test('plain', () => {
  expect(genDiff(getPathOfFile('packageRecursive.json'), getPathOfFile('packageRecursive2.json'), 'plain')).toEqual(getResult(getPathOfFile('plainExpected')));
});
test('json', () => {
  expect(() => JSON.parse(genDiff(getPathOfFile('packageRecursive.json'), getPathOfFile('packageRecursive2.json'), 'json'))).not.toThrow();
});

test('recursive-stylish', () => {
  expect(genDiff(getPathOfFile('packageRecursive.yaml'), getPathOfFile('packageRecursive2.json'), 'stylish')).toEqual(getResult(getPathOfFile('recursiveExpected')));
});
