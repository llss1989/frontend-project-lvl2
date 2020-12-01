import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import getParseData from './parsers.js';

export const getData = (config) => {
  const type = path.extname(config);
  const filepath = path.resolve(process.cwd(), config);
  const data = fs.readFileSync(filepath, 'utf8');
  return [data, type];
};

export const genDiff = (firstConfig, secondConfig) => {
  const [dataOfFirstFile, typeOfFirstFile] = getData(firstConfig);
  const [dataOfSecondFile, typeOfSecondFile] = getData(secondConfig);
  const supportedDataOfFirstFile = getParseData(dataOfFirstFile, typeOfFirstFile);
  const supportedDataOfSecondFile = getParseData(dataOfSecondFile, typeOfSecondFile);
  const keysOfDataOfFirstFile = Object.keys(supportedDataOfFirstFile);
  const keyOfDataOfSecondFile = Object.keys(supportedDataOfSecondFile);
  const compareResult = _.union(keysOfDataOfFirstFile, keyOfDataOfSecondFile)
    .sort()
    .reduce((acc, currentKey, index, array) => {
      const indexOfLastElement = array.length - 1;
      if (Object.prototype.hasOwnProperty.call(supportedDataOfFirstFile, currentKey)
      && !Object.prototype.hasOwnProperty.call(supportedDataOfSecondFile, currentKey)) {
        acc.push(`  - ${currentKey}: ${supportedDataOfFirstFile[currentKey]}`);
      }
      if (!Object.prototype.hasOwnProperty.call(supportedDataOfFirstFile, currentKey)
      && Object.prototype.hasOwnProperty.call(supportedDataOfSecondFile, currentKey)) {
        acc.push(`  + ${currentKey}: ${supportedDataOfSecondFile[currentKey]}`);
      }
      if (Object.prototype.hasOwnProperty.call(supportedDataOfFirstFile, currentKey)
      && Object.prototype.hasOwnProperty.call(supportedDataOfSecondFile, currentKey)) {
        if (supportedDataOfFirstFile[currentKey] === supportedDataOfSecondFile[currentKey]) {
          acc.push(`    ${currentKey}: ${supportedDataOfFirstFile[currentKey]}`);
        } else if (dataOfFirstFile[currentKey] !== supportedDataOfSecondFile[currentKey]) {
          acc.push(`  - ${currentKey}: ${supportedDataOfFirstFile[currentKey]}`);
          acc.push(`  + ${currentKey}: ${supportedDataOfSecondFile[currentKey]}`);
        }
      }
      if (index === indexOfLastElement) {
        acc.push('}');
      }
      return acc;
    }, ['{']);
  return compareResult.join('\n');
};

const buildAst = (firstConfig, secondConfig) => {
  const [dataOfFirstFile, typeOfFirstFile] = getData(firstConfig);
  const [dataOfSecondFile, typeOfSecondFile] = getData(secondConfig);
  const supportedDataOfFirstFile = getParseData(dataOfFirstFile, typeOfFirstFile);
  const supportedDataOfSecondFile = getParseData(dataOfSecondFile, typeOfSecondFile);
  const iter = (nodeFromFirstFile, nodeFromSecondFile) => {
    const keysOfDataOfFirstFile = Object.keys(nodeFromFirstFile);
    const keyOfDataOfSecondFile = Object.keys(nodeFromSecondFile);
    const ast = _.union(keysOfDataOfFirstFile, keyOfDataOfSecondFile)
      .sort()
      .reduce((acc, currentKey) => {
        acc.push({
          "nameOfKey": currentKey,
          "typesOfValuesOfKeys": [ Object.prototype.toString.call(nodeFromFirstFile[currentKey]) === '[object Object]' ? 'object' : nodeFromFirstFile[currentKey] === undefined ? 'OTC' : 'primitive',  
          Object.prototype.toString.call(nodeFromSecondFile[currentKey]) === '[object Object]' ? 'object' : nodeFromSecondFile[currentKey] === undefined ? 'OTC' :'primitive' ],
          "values": [nodeFromFirstFile[currentKey], nodeFromSecondFile[currentKey]],
          "childrens": [],
        });
        if (acc[acc.length - 1]['typesOfValuesOfKeys'][0] === 'object'
        && acc[acc.length - 1]['typesOfValuesOfKeys'][1] === 'object') {
          acc[acc.length - 1]['childrens'].push(iter(nodeFromFirstFile[currentKey], nodeFromSecondFile[currentKey]));
        }
        return acc;
      }, []);
    return ast;
  };
  return iter(supportedDataOfFirstFile, supportedDataOfSecondFile);
};

export const stylish = (ast) => {
  const firstKeysOfAst = ast.reduce((acc, {nameOfKey,typesOfValuesOfKeys,values,childrens }) => {
    const [valueOfKeyOfFirstFile, valueOfKeyOfSecondFile] = values;
    const [typeOfValueOfFirstFile, typeOfValueOfSecondFile] = typesOfValuesOfKeys;
    if (typeOfValueOfFirstFile === 'OTC' && (typeOfValueOfSecondFile === 'object' || typeOfValueOfSecondFile === 'primitive')) {
      acc.push(`+ ${nameOfKey}: ${JSON.stringify(valueOfKeyOfSecondFile, null, ' ')}`);
    }
    if (typeOfValueOfSecondFile === 'OTC' && (typeOfValueOfFirstFile === 'object' || typeOfValueOfFirstFile === 'primitive')) {
      acc.push(`- ${nameOfKey}: ${JSON.stringify(valueOfKeyOfFirstFile, null, ' ')}`);
    }
    if ((typeOfValueOfFirstFile === 'primitive' && typeOfValueOfSecondFile === 'object')
    && (typeOfValueOfFirstFile === 'object' && typeOfValueOfSecondFile === 'primitive')) {
      acc.push(`
      - ${nameOfKey}: ${valueOfKeyOfFirstFile},
      + ${nameOfKey}: ${valueOfKeyOfSecondFile}
      `);
    }
    if (typeOfValueOfFirstFile === 'primitive' && typeOfValueOfSecondFile === 'primitive'
    && valueOfKeyOfFirstFile === valueOfKeyOfSecondFile) {
        acc.push(`${nameOfKey}: ${valueOfKeyOfFirstFile}`);
    }
    if (typeOfValueOfFirstFile === 'primitive' && typeOfValueOfSecondFile === 'primitive'
    && valueOfKeyOfFirstFile !== valueOfKeyOfSecondFile) {
        acc.push(`-${nameOfKey}: ${valueOfKeyOfFirstFile},
                 + ${nameOfKey}: ${valueOfKeyOfSecondFile}`);
    }
    if (typeOfValueOfFirstFile === 'object' && typeOfValueOfSecondFile === 'object') {
      acc.push(`${nameOfKey}: ${stylish(childrens[0])}`);
    }
    return acc;
  },[]);
  return firstKeysOfAst;
};

// export const stylish = (ast) => {
//   const firstKeys = Object.keys(ast)
//     .reduce((acc, currentKey) => {
//       console.log(acc);
//       if (!Array.isArray(ast[currentKey])) {
//         if (ast[currentKey].was.type === undefined) {
//           acc.push(`+ ${currentKey} : ${ast[currentKey].became.value}`);
//           return acc;
//         }
//         if (ast[currentKey].was.type === undefined) {
//           acc.push(`${currentKey}: ${ast[currentKey].became.value}`);
//           return acc;
//         } if (ast[currentKey].became.type === undefined) {
//           acc.push(`- ${currentKey} : ${ast[currentKey].was.value}`);
//           return acc;
//         } if (ast[currentKey].was.value === ast[currentKey].became.value) {
//           acc.push(`${currentKey} : ${ast[currentKey].became.value}`);
//           return acc;
//         } if (ast[currentKey].was.value !== undefined && ast[currentKey].became.value !== undefined
//           && ast[currentKey].was.value !== ast[currentKey].became.value) {
//           acc.push(`
//             - ${currentKey}: ${ast[currentKey].was.value}
//             + ${currentKey}: ${ast[currentKey].became.value}`);
//           return acc;
//         }
//       }
//       if (Array.isArray(ast[currentKey])) {
//         acc.push(stylish(ast[currentKey][0]));
//         return acc;
//       }
//       return acc;
//     }, []);
//   return firstKeys;
// };
const ast = buildAst('../__fixtures__/packageRecursive.json', '../__fixtures__/packageRecursive2.json');
console.log(stylish(ast))

// console.log(JSON.stringify(ast, null, ' '))
// console.log(buildAst('../__fixtures__/package.json', '../__fixtures__/package2.json'));

// const iter = (currentNode) => {
//   const initialKeys = Object.keys(currentNode)
//     .reduce((acc, currentKey) => {
//       if (!Array.isArray(currentNode[currentKey])) {
//         if (currentNode[currentKey].was.value === currentNode[currentKey].became.value) {
//           acc.push(`${currentNode[currentKey].key} : ${currentNode[currentKey].became.value}`);
//         }
//            if (currentNode[currentKey].was.type === undefined) {
//             acc.push(`+ ${currentNode[currentKey].key} : ${currentNode[currentKey].became.value}`);
//           }
//            if (currentNode[currentKey].became.type === undefined) {
//             acc.push(`- ${currentNode[currentKey].key} : ${currentNode[currentKey].was.value}`);
//           }
//          }
//          return acc;
//         }
//          , [])
// return iter(ast);
