import path from 'path';
import { buildAst } from '../src/index.js';
import { plain, stylish, json } from '../src/formatters/index.js';

const testJSON = (text) => {
  if (typeof text !== 'string') {
    return false;
  }
  try {
    JSON.parse(text);
    return true;
  } catch (error) {
    return false;
  }
};
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
const plainExpected = `Property 'common.follow' was added with value: false
Property 'common.setting2' was removed
Property 'common.setting3' was updated. From true to null
Property 'common.setting4' was added with value: 'blah blah'
Property 'common.setting5' was added with value: [complex value]
Property 'common.setting6.doge.wow' was updated. From '' to 'so much'
Property 'common.setting6.ops' was added with value: 'vops'
Property 'group1.baz' was updated. From 'bas' to 'bars'
Property 'group1.nest' was updated. From [complex value] to 'str'
Property 'group2' was removed
Property 'group3' was added with value: [complex value]`;

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
test('plain', () => {
  expect((plain(buildAst(getPathOfFile('packageRecursive.json'), getPathOfFile('packageRecursive2.json')))) === plainExpected).toBe(true);
});
test('json', () => {
  expect(testJSON(json(buildAst(getPathOfFile('packageRecursive.json'), getPathOfFile('packageRecursive2.json'))))).toBe(!false);
});
