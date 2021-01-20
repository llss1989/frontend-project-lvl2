import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import getParseData from './parsers.js';
import { plain } from './formatters/index.js'

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

const getTypeOfValue = (currentValue) => {
  if (typeof (currentValue) === 'object') {
    return 'object';
  }
  if (typeof (currentValue) === 'undefined') {
    return 'OTC';
  }
  return 'primitive';
};
export const buildAst = (firstConfig, secondConfig) => {
  const [dataOfFirstFile, typeOfFirstFile] = getData(firstConfig);
  const [dataOfSecondFile, typeOfSecondFile] = getData(secondConfig);
  const supportedDataOfFirstFile = getParseData(dataOfFirstFile, typeOfFirstFile);
  const supportedDataOfSecondFile = getParseData(dataOfSecondFile, typeOfSecondFile);
  const iter = (nodeFromFirstFile, nodeFromSecondFile, nestling = 1) => {
    const keysOfDataOfFirstFile = Object.keys(nodeFromFirstFile);
    const keyOfDataOfSecondFile = Object.keys(nodeFromSecondFile);
    const ast = _.union(keysOfDataOfFirstFile, keyOfDataOfSecondFile)
      .sort()
      .reduce((acc, currentKey) => {
        const typeOfKeyValueFromFirstFile = getTypeOfValue(nodeFromFirstFile[currentKey]);
        const typeOfKeyValueFromSecondFile = getTypeOfValue(nodeFromSecondFile[currentKey]);
        acc.push({
          nameOfKey: currentKey,
          depth: nestling,
          childrens: [],
        });
        if (typeOfKeyValueFromFirstFile === 'OTC' && (typeOfKeyValueFromSecondFile === 'primitive' || 'object')) {
          acc[acc.length - 1].status = 'added';
          acc[acc.length - 1].value = nodeFromSecondFile[currentKey];
        }
        if ((typeOfKeyValueFromFirstFile === 'primitive' || 'object') && typeOfKeyValueFromSecondFile === 'OTC') {
          acc[acc.length - 1].status = 'deleted';
          acc[acc.length - 1].value = nodeFromFirstFile[currentKey];
        }
        if ((typeOfKeyValueFromFirstFile === 'primitive' && typeOfKeyValueFromSecondFile === 'primitive')) {
          acc[acc.length - 1].status = nodeFromFirstFile[currentKey] === nodeFromSecondFile[currentKey] ? 'no_changed' : 'updated';
          acc[acc.length - 1].value = acc[acc.length - 1].status === 'updated' ? [nodeFromFirstFile[currentKey], nodeFromSecondFile[currentKey]] : nodeFromSecondFile[currentKey];
        }
        if ((typeOfKeyValueFromFirstFile === 'object' && typeOfKeyValueFromSecondFile === 'primitive')
        || (typeOfKeyValueFromFirstFile === 'primitive' && typeOfKeyValueFromSecondFile === 'object')) {
          acc[acc.length - 1].status = 'updated';
          acc[acc.length - 1].value = [nodeFromFirstFile[currentKey],
            nodeFromSecondFile[currentKey]];
        }
        if (typeOfKeyValueFromFirstFile === 'object'
        && typeOfKeyValueFromSecondFile === 'object') {
          acc[acc.length - 1].childrens = iter(nodeFromFirstFile[currentKey],
            nodeFromSecondFile[currentKey], nestling + 1);
        }
        return acc;
      }, []);
    return ast;
  };
  return iter(supportedDataOfFirstFile, supportedDataOfSecondFile);
};

//  const ast = buildAst('../__fixtures__/packageRecursive.json', '../__fixtures__/packageRecursive2.json');
//  console.log(typeof(plain(ast)));
