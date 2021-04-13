import _ from 'lodash';
import path from 'path';
import fs from 'fs';
import parse from './parsers.js';

export const getData = (config) => {
  const type = path.extname(config).slice(1);
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

const parseSubNode = (nodeFromFirstFile, nodeFromSecondFile, nestling, iter, currentKey) => {
  const typeOfKeyValueFromFirstFile = getTypeOfValue(nodeFromFirstFile[currentKey]);
  const typeOfKeyValueFromSecondFile = getTypeOfValue(nodeFromSecondFile[currentKey]);
  if (typeOfKeyValueFromFirstFile === 'primitive' && (typeOfKeyValueFromSecondFile === 'primitive')) {
    return {
      nameOfKey: currentKey, depth: nestling, childrens: [], status: nodeFromFirstFile[currentKey] === nodeFromSecondFile[currentKey] ? 'no_changed' : 'updated', value: nodeFromFirstFile[currentKey] === nodeFromSecondFile[currentKey] ? nodeFromFirstFile[currentKey] : [nodeFromFirstFile[currentKey], nodeFromSecondFile[currentKey]],
    };
  }
  if (typeOfKeyValueFromFirstFile === 'OTC' && (typeOfKeyValueFromSecondFile === 'primitive' || 'object')) {
    return {
      nameOfKey: currentKey, depth: nestling, childrens: [], status: 'added', value: nodeFromSecondFile[currentKey],
    };
  }
  if ((typeOfKeyValueFromFirstFile === 'primitive' || 'object') && (typeOfKeyValueFromSecondFile === 'OTC')) {
    return {
      nameOfKey: currentKey, depth: nestling, childrens: [], status: 'deleted', value: nodeFromFirstFile[currentKey],
    };
  }
  if ((typeOfKeyValueFromFirstFile === 'object' && typeOfKeyValueFromSecondFile === 'primitive') || (typeOfKeyValueFromFirstFile === 'primitive' && typeOfKeyValueFromSecondFile === 'object')) {
    return {
      nameOfKey: currentKey, depth: nestling, childrens: [], status: 'updated', value: [nodeFromFirstFile[currentKey], nodeFromSecondFile[currentKey]],
    };
  }
  if (typeOfKeyValueFromFirstFile === 'object' && typeOfKeyValueFromSecondFile === 'object') {
    return {
      nameOfKey: currentKey,
      depth: nestling,
      childrens: iter(nodeFromFirstFile[currentKey],
        nodeFromSecondFile[currentKey],
        nestling + 1),
    };
  }
  throw Error('error from buildAst!');
};
const partial = (fn, arg1, arg2, arg3, iter) => (fourArg) => fn(arg1, arg2, arg3, iter, fourArg);

const buildAst = (firstConfig, secondConfig) => {
  const [dataOfFirstFile, typeOfFirstFile] = getData(firstConfig);
  const [dataOfSecondFile, typeOfSecondFile] = getData(secondConfig);
  const supportedDataOfFirstFile = parse(dataOfFirstFile, typeOfFirstFile);
  const supportedDataOfSecondFile = parse(dataOfSecondFile, typeOfSecondFile);
  const iter = (nodeFromFirstFile, nodeFromSecondFile, nestling = 1) => {
    const keysOfDataOfFirstFile = Object.keys(nodeFromFirstFile);
    const keyOfDataOfSecondFile = Object.keys(nodeFromSecondFile);
    const partialParseNode = partial(parseSubNode, nodeFromFirstFile,
      nodeFromSecondFile, nestling, iter);
    const sortedKeys = _.sortBy(_.union(keysOfDataOfFirstFile, keyOfDataOfSecondFile));
    const ast = sortedKeys
      .map(partialParseNode);
    return ast.filter((x) => x !== undefined);
  };
  return iter(supportedDataOfFirstFile, supportedDataOfSecondFile);
};
export default buildAst;
