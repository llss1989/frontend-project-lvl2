import path from 'path';
import genDiff from '../src/index.js';

const expected = `{
  - follow: false
    host: hexlet.io
  - proxy: 123.234.53.22
  - timeout: 50
  + timeout: 20
  + verbose: true
}`;
test('basic', () => {
  const pathOfFirstJSON = path.resolve(process.cwd(), '__fixtures__', 'package.json');
  const pathOfsecondJSON = path.resolve(process.cwd(), '__fixtures__', 'package2.json');
  expect(genDiff(pathOfFirstJSON, pathOfsecondJSON) === expected).toBe(true);
});
test('basic-yaml', () => {
  const pathOfFirstFile = path.resolve(process.cwd(), '__fixtures__', 'package.yaml');
  const pathOfSecondFile = path.resolve(process.cwd(), '__fixtures__', 'package2.yaml');
  expect(genDiff(pathOfFirstFile, pathOfSecondFile) === expected).toBe(true);
});
