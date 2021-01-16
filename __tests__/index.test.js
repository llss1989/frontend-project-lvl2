import path from 'path';
import { genDiff, stylish, buildAst } from '../src/index.js';

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

test('basic-recursive', () => {
  const pathOfFirstFile = '/home/llss/Learning/Projects/Hexlet/projects/lvl2/frontend-project-lvl2/__fixtures__/packageRecursive.json';
  const pathOfSecondFile = '/home/llss/Learning/Projects/Hexlet/projects/lvl2/frontend-project-lvl2/__fixtures__/packageRecursive2.json';
  expect((stylish(buildAst(pathOfFirstFile, pathOfSecondFile))
    .includes(recursiveExpected))).toBe(true);
});
