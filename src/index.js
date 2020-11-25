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

const genDiff = (firstConfig, secondConfig) => {
  const [dataOfFirstFile, typeOfFirstFile] = getData(firstConfig);
  const [dataOfSecondFile, typeOfSecondFile] = getData(secondConfig);
  const supportedDataOfFirstFile = getParseData(dataOfFirstFile, typeOfFirstFile);
  const supportedDataOfSecondFile = getParseData(dataOfSecondFile, typeOfSecondFile);
  const keysOfDataOfFirstFile = Object.keys(supportedDataOfFirstFile);
  return supportedDataOfFirstFile;
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
export default genDiff;

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
        //console.log(nodeFromFirstFile[currentKey]);
        if (typeof (nodeFromFirstFile[currentKey]) !== 'object' || typeof (nodeFromSecondFile[currentKey]) !== 'object') {
          acc[currentKey] = {
            key: currentKey,
            was: {
              type: typeof (nodeFromFirstFile[currentKey]),
              value: nodeFromFirstFile[currentKey],
            },
            became: {
              type: typeof (nodeFromSecondFile[currentKey]),
              value: nodeFromSecondFile[currentKey],
            },
          };
          return acc;
        }
        if (typeof (nodeFromFirstFile[currentKey]) === 'object' && typeof (nodeFromSecondFile[currentKey]) === 'object') {
          return iter(nodeFromFirstFile[currentKey], nodeFromSecondFile[currentKey]);
        }
      },
      {});
    return ast;
  };
  return iter(supportedDataOfFirstFile, supportedDataOfSecondFile);
};

console.log(buildAst('../__fixtures__/packageRecursive.json', '../__fixtures__/packageRecursive2.yaml'), null, '\t');
//console.log(buildAst('../__fixtures__/package.json', '../__fixtures__/package2.json'));

