import path from 'path';
import { genDiff, buildAst } from '../src/index.js';
import { stylish } from '../src/formatters/index.js';

const recursiveExpected = `
{
    common: {
      + follow: false
        setting1: Value 1
      - setting2: 200
      - setting3: true
      + setting3: null
      + setting4: blah blah
      + setting5: {
            key5: value5
        }
        setting6: {
            doge: {
              - wow: 
              + wow: so much
            }
            key: value
          + ops: vops
        }
    }
    group1: {
      - baz: bas
      + baz: bars
        foo: bar
      - nest: {
            key: value
        }
      + nest: str
    }
  - group2: {
        abc: 12345
        deep: {
            id: 45
        }
    }
  + group3: {
        fee: 100500
        deep: {
            id: {
                number: 45
            }
        }
    }
}`;

const expected = `
{
  - follow: false
    host: hexlet.io
  - proxy: 123.234.53.22
  - timeout: 50
  + timeout: 20
  + verbose: true
}`;

const getPathOfFile = (nameOfFile) => path.resolve(process.cwd(), '__fixtures__', nameOfFile);

test('basic', () => {
  expect(stylish(buildAst(getPathOfFile('package.json'), getPathOfFile('package2.json'))) === expected).toBe(true);
});
test('basic-yaml', () => {
  expect(stylish(buildAst(getPathOfFile('package.yaml'), getPathOfFile('package2.yaml'))) === expected).toBe(true);
});

test('basic-recursive', () => {
  expect((stylish(buildAst(getPathOfFile('packageRecursive.json'), getPathOfFile('packageRecursive2.json')))) === recursiveExpected).toBe(true);
});
