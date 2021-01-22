import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import getParseData from './parsers.js';
import { stylish, plain, json } from './formatters/index.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

export const testJSON = (text) => {
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

export const getData = (config) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const filename = config.split(/(\\|\/)/g).pop();
  const type = path.extname(config);
  const filepath = path.join(__dirname, '..', '__fixtures__', filename);
  const data = fs.readFileSync(filepath, 'utf8');
  return [data, type];
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
  // console.log(`${firstConfig}first config`);
  // console.log(`${secondConfig}second config`);
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
        if (currentKey === 'prepareStackTrace' || currentKey === 'stackTraceLimit') {
          return acc;
        }
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

const genDiff = (firstConfig, secondConfig, format = 'stylish') => {
  const ast = buildAst(firstConfig, secondConfig);
  if (format === 'stylish') {
    return stylish(ast);
  }
  if (format === 'plain') {
    return plain(ast);
  }
  if (format === 'json') {
    return json(ast);
  }
  throw Error('Hello from gendiff!');
};

export default genDiff;
