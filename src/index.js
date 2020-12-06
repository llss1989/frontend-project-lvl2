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
  const iter = (nodeFromFirstFile, nodeFromSecondFile, nestling = 0) => {
    const keysOfDataOfFirstFile = Object.keys(nodeFromFirstFile);
    const keyOfDataOfSecondFile = Object.keys(nodeFromSecondFile);
    const ast = _.union(keysOfDataOfFirstFile, keyOfDataOfSecondFile)
      .sort()
      .reduce((acc, currentKey) => {
        const typeOfFirstFile = Object.prototype.toString.call(nodeFromFirstFile[currentKey]) === '[object Object]' ? 'object' : nodeFromFirstFile.hasOwnProperty(currentKey) ? 'primitive' : 'OTC';
        const typeOfSecondFile = Object.prototype.toString.call(nodeFromSecondFile[currentKey]) === '[object Object]' ? 'object' : nodeFromSecondFile.hasOwnProperty(currentKey) ? 'primitive' : 'OTC';
        acc.push({
          nameOfKey: currentKey,
          depth: nestling,
          childrens: [],
        });
        if (typeOfFirstFile === 'OTC' && (typeOfSecondFile === 'primitive' || 'object')) {
          acc[acc.length - 1].status = 'added';
          acc[acc.length - 1].value = nodeFromSecondFile[currentKey];
        }
        if ((typeOfFirstFile === 'primitive' || 'object') && typeOfSecondFile === 'OTC') {
          acc[acc.length - 1].status = 'deleted';
          acc[acc.length - 1].value = nodeFromFirstFile[currentKey];
        }
        if ((typeOfFirstFile === 'primitive' && typeOfSecondFile === 'primitive')) {
          acc[acc.length - 1].status = 'no_changed';
          acc[acc.length - 1].value = nodeFromFirstFile[currentKey];
        }
        if ((typeOfFirstFile=== 'object' && typeOfSecondFile === 'primitive')
        || (typeOfFirstFile === 'primitive' && typeOfSecondFile === 'object')) {
          acc[acc.length - 1].status = 'changed';
          acc[acc.length - 1].value = [nodeFromFirstFile[currentKey],
            nodeFromSecondFile[currentKey]];
        }
        if (typeOfFirstFile === 'object'
        && typeOfSecondFile === 'object') {
          acc[acc.length - 1].childrens.push(iter(nodeFromFirstFile[currentKey],
            nodeFromSecondFile[currentKey], nestling + 1));
        }
        return acc;
      }, []);
    return ast;
  };
  return iter(supportedDataOfFirstFile, supportedDataOfSecondFile);
};

const ast = buildAst('../__fixtures__/packageRecursive.json', '../__fixtures__/packageRecursive2.json');
console.log(JSON.stringify(ast, null, ' '));
