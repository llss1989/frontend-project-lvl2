import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import getParseData from './parsers.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';



export const getData = (config) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
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
          acc[acc.length - 1].status = nodeFromFirstFile[currentKey] === nodeFromSecondFile[currentKey] ? 'no_changed' : 'changed';
          acc[acc.length - 1].value = acc[acc.length - 1].status === 'changed' ? [nodeFromFirstFile[currentKey], nodeFromSecondFile[currentKey]] : nodeFromSecondFile[currentKey];
        }
        if ((typeOfFirstFile === 'object' && typeOfSecondFile === 'primitive')
        || (typeOfFirstFile === 'primitive' && typeOfSecondFile === 'object')) {
          acc[acc.length - 1].status = 'changed';
          acc[acc.length - 1].value = [nodeFromFirstFile[currentKey],
            nodeFromSecondFile[currentKey]];
        }
        if (typeOfFirstFile === 'object'
        && typeOfSecondFile === 'object') {
          acc[acc.length - 1].childrens = iter(nodeFromFirstFile[currentKey],
            nodeFromSecondFile[currentKey], nestling + 1);
        }
        return acc;
      }, []);
    return ast;
  };
  return iter(supportedDataOfFirstFile, supportedDataOfSecondFile);
};

const getValue = (value, depth) => {
  const currentIndent = '  '.repeat(depth * 2);
  const closeBracketIndent = '  '.repeat(depth * 2 - 2) 
  if (typeof(value) !== 'object' || value === null) {
    return `${value}`;
  }
  const lines = Object.entries(value).map(([key, value]) => `${currentIndent}${key}: ${getValue(value, depth + 1)}`);
  return ['{',
  ...lines,
`${closeBracketIndent}}`].join('\n')
};

export const stylish = (ast) => {
  const iter = (ast) => {
    const lines = ast.reduce((acc, node) => {
     const currentIndent =  node.status === undefined ? '  '.repeat((node.depth * 2)) : '  '.repeat((node.depth * 2) - 1);
     if (node.childrens.length === 0) {
       if (node.status === 'added') {
         acc.push(`${currentIndent}+ ${node.nameOfKey}: ${getValue(node.value,  node.depth + 1)}`);
       }
       if (node.status === 'deleted') {
         acc.push(`${currentIndent}- ${node.nameOfKey}: ${getValue(node.value,  node.depth + 1)}`);
       }
       if (node.status === 'no_changed') {
         acc.push(`${currentIndent}  ${node.nameOfKey}: ${getValue(node.value,  node.depth + 1)}`);
       }
       if (node.status === 'changed') {
         acc.push(`${currentIndent}- ${node.nameOfKey}: ${getValue(node.value[0], node.depth + 1)}`);
         acc.push(`${currentIndent}+ ${node.nameOfKey}: ${getValue(node.value[1], node.depth + 1)}`);
       }
     }
     if (node.childrens.length !== 0) {
       acc.push(`${currentIndent}${node.nameOfKey}: {`);
       acc.push(iter(node.childrens));
       acc.push(`${currentIndent}}`)
     }
     return acc.flat(1);
    }, []);
    return lines;
   }
   const preResult = iter(ast);
   return [
     '\n{',
     ...preResult,
     '}'
   ].join('\n')
};
