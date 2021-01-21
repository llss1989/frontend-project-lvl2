import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import getParseData from './parsers.js';
import { stylish, plain, json } from './formatters/index.js';

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
  const type = path.extname(config);
  const filepath = path.resolve(process.cwd(), config);
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
  const [dataOfFirstFile, typeOfFirstFile] = getData(firstConfig);
  const [dataOfSecondFile, typeOfSecondFile] = getData(secondConfig);
  const supportedDataOfFirstFile = getParseData(dataOfFirstFile, typeOfFirstFile);
  const supportedDataOfSecondFile = getParseData(dataOfSecondFile, typeOfSecondFile);
  // if (typeof (supportedDataOfFirstFile) !== 'object') {
  //   console.log(`${typeof(supportedDataOfFirstFile)}`);
  //   throw Error('Hello from BuildAST!');
  // }
  const iter = (nodeFromFirstFile, nodeFromSecondFile, nestling = 1) => {
    const keysOfDataOfFirstFile = Object.keys(nodeFromFirstFile);
    const keyOfDataOfSecondFile = Object.keys(nodeFromSecondFile);
    const ast = _.union(keysOfDataOfFirstFile, keyOfDataOfSecondFile)
      .sort()
      .reduce((acc, currentKey) => {
        const typeOfKeyValueFromFirstFile = getTypeOfValue(nodeFromFirstFile[currentKey]);
        const typeOfKeyValueFromSecondFile = getTypeOfValue(nodeFromSecondFile[currentKey]);
        if (currentKey === 'prepareStackTrace' || currentKey === 'stackTraceLimit') {
          continue;
        }
        // console.log(`${currentKey}`);
        // console.log(`${nodeFromFirstFile[currentKey]}VALUE1`);
        // console.log(`${nodeFromSecondFile[currentKey]}VALUE2`);
        // console.log(typeof(nodeFromFirstFile[currentKey]));
        // console.log(typeof(nodeFromSecondFile[currentKey]));
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
    //console.log(`${stylish(ast)}STYLISH!`);
    return stylish(ast);
  }
  if (format === 'plain') {
    //console.log(`${plain}PLAIN!!!`);
    return plain(ast);
  }
  if (format === 'json') {
    //console.log(`${json(ast)}json`);
    return json(ast);
  }
  throw Error('Hello from gendiff!');
};



export default genDiff;
