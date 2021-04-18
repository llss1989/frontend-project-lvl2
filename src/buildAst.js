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

const getTypeOfValue = (typeOfValue) => {
  const typesOfValueStates = {
    object: 'object',
    undefined: 'OTC',
    number: 'primitive',
    string: 'primitive',
    boolean: 'primitive',
  };
  return typesOfValueStates[typeOfValue];
};

const parseSubNode = (nodeFromFirstFile, nodeFromSecondFile, nestling = 1, iter, currentKey) => {
  const typeOfKeyValueFromFirstFile = getTypeOfValue(typeof nodeFromFirstFile[currentKey]);
  const typeOfKeyValueFromSecondFile = getTypeOfValue(typeof nodeFromSecondFile[currentKey]);
  const typesOfKeyValuesOfBothFiles = {
    primitive: {
      primitive: {
        nameOfKey: currentKey, depth: nestling, childrens: [], status: nodeFromFirstFile[currentKey] === nodeFromSecondFile[currentKey] ? 'no_changed' : 'updated', value: nodeFromFirstFile[currentKey] === nodeFromSecondFile[currentKey] ? nodeFromFirstFile[currentKey] : [nodeFromFirstFile[currentKey], nodeFromSecondFile[currentKey]],
      },
      OTC: {
        nameOfKey: currentKey, depth: nestling, childrens: [], status: 'deleted', value: nodeFromFirstFile[currentKey],
      },
      object: {
        nameOfKey: currentKey, depth: nestling, childrens: [], status: 'updated', value: [nodeFromFirstFile[currentKey], nodeFromSecondFile[currentKey]],
      },
    },
    OTC: {
      primitive: {
        nameOfKey: currentKey, depth: nestling, childrens: [], status: 'added', value: nodeFromSecondFile[currentKey],
      },
      object: {
        nameOfKey: currentKey, depth: nestling, childrens: [], status: 'added', value: nodeFromSecondFile[currentKey],
      },
    },
    object: {
      OTC: {
        nameOfKey: currentKey, depth: nestling, childrens: [], status: 'deleted', value: nodeFromFirstFile[currentKey],
      },
      primitive: {
        nameOfKey: currentKey, depth: nestling, childrens: [], status: 'updated', value: [nodeFromFirstFile[currentKey], nodeFromSecondFile[currentKey]],
      },
      object: {
        nameOfKey: currentKey,
        depth: nestling,
        childrens: iter(nodeFromFirstFile[currentKey],
          nodeFromSecondFile[currentKey],
          nestling + 1),
      },
    },
  };
  return typesOfKeyValuesOfBothFiles[typeOfKeyValueFromFirstFile][typeOfKeyValueFromSecondFile];
  // if (typeOfKeyValueFromFirstFile === 'primitive' && (typeOfKeyValueFromSecondFile === 'primitive')) {
  //   return {
  //     nameOfKey: currentKey, depth: nestling, childrens: [], status: nodeFromFirstFile[currentKey] === nodeFromSecondFile[currentKey] ? 'no_changed' : 'updated', value: nodeFromFirstFile[currentKey] === nodeFromSecondFile[currentKey] ? nodeFromFirstFile[currentKey] : [nodeFromFirstFile[currentKey], nodeFromSecondFile[currentKey]],
  //   };
  // }
  // if (typeOfKeyValueFromFirstFile === 'OTC' && (typeOfKeyValueFromSecondFile === 'primitive' || 'object')) {
  //   return {
  //     nameOfKey: currentKey, depth: nestling, childrens: [], status: 'added', value: nodeFromSecondFile[currentKey],
  //   };
  // }
  // if ((typeOfKeyValueFromFirstFile === 'primitive' || 'object') && (typeOfKeyValueFromSecondFile === 'OTC')) {
  //   return {
  //     nameOfKey: currentKey, depth: nestling, childrens: [], status: 'deleted', value: nodeFromFirstFile[currentKey],
  //   };
  // }
  // if ((typeOfKeyValueFromFirstFile === 'object' && typeOfKeyValueFromSecondFile === 'primitive') || (typeOfKeyValueFromFirstFile === 'primitive' && typeOfKeyValueFromSecondFile === 'object')) {
  //   return {
  //     nameOfKey: currentKey, depth: nestling, childrens: [], status: 'updated', value: [nodeFromFirstFile[currentKey], nodeFromSecondFile[currentKey]],
  //   };
  // }
  // if (typeOfKeyValueFromFirstFile === 'object' && typeOfKeyValueFromSecondFile === 'object') {
  //   return {
  //     nameOfKey: currentKey,
  //     depth: nestling,
  //     childrens: iter(nodeFromFirstFile[currentKey],
  //       nodeFromSecondFile[currentKey],
  //       nestling + 1),
  //   };
  // }
  // throw Error('error from buildAst!');
};

const buildAst = (firstConfig, secondConfig) => {
  const [dataOfFirstFile, typeOfFirstFile] = getData(firstConfig);
  const [dataOfSecondFile, typeOfSecondFile] = getData(secondConfig);
  const supportedDataOfFirstFile = parse(dataOfFirstFile, typeOfFirstFile);
  const supportedDataOfSecondFile = parse(dataOfSecondFile, typeOfSecondFile);
  const iter = (nodeFromFirstFile, nodeFromSecondFile, nestling = 1) => {
    console.log(nodeFromFirstFile)
    console.log(nodeFromSecondFile)
    const keysOfDataOfFirstFile = Object.keys(nodeFromFirstFile);
    const keyOfDataOfSecondFile = Object.keys(nodeFromSecondFile);
    // const partialParseNode = partial(parseSubNode, nodeFromFirstFile,
    //   nodeFromSecondFile, nestling, iter);
    const ast = _.sortBy(_.union(keysOfDataOfFirstFile, keyOfDataOfSecondFile))
    console.log(ast)
    const newAst = ast.map((x) => parseSubNode(nodeFromFirstFile, nodeFromSecondFile, nestling, iter, x));
    return newAst.filter((x) => x !== undefined);
  };
  return iter(supportedDataOfFirstFile, supportedDataOfSecondFile);
};
export default buildAst;
