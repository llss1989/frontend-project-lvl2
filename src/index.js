import fs from 'fs';
import path from 'path';
import _ from 'lodash';

export const getData = (config) => {
  const filepath = path.resolve(process.cwd(), config);
  const data = fs.readFileSync(filepath, 'utf8');
  return data;
};

const genDiff = (firstConfig, secondConfig) => {
  const dataOfFirstFile = JSON.parse(getData(firstConfig));
  const dataOfSecondFile = JSON.parse(getData(secondConfig));
  const keysOfDataOfFirstFile = Object.keys(dataOfFirstFile);
  const keyOfDataOfSecondFile = Object.keys(dataOfSecondFile);
  const compareResult = _.union(keysOfDataOfFirstFile, keyOfDataOfSecondFile)
    .sort()
    .reduce((acc, currentKey, index, array) => {
      const indexOfLastElement = array.length - 1;
      if (Object.prototype.hasOwnProperty.call(dataOfFirstFile, currentKey)
      && !Object.prototype.hasOwnProperty.call(dataOfSecondFile, currentKey)) {
        acc.push(`  - ${currentKey}: ${dataOfFirstFile[currentKey]}`);
      }
      if (!Object.prototype.hasOwnProperty.call(dataOfFirstFile, currentKey)
      && Object.prototype.hasOwnProperty.call(dataOfSecondFile, currentKey)) {
        acc.push(`  + ${currentKey}: ${dataOfSecondFile[currentKey]}`);
      }
      if (Object.prototype.hasOwnProperty.call(dataOfFirstFile, currentKey)
      && Object.prototype.hasOwnProperty.call(dataOfSecondFile, currentKey)) {
        if (dataOfFirstFile[currentKey] === dataOfSecondFile[currentKey]) {
          acc.push(`    ${currentKey}: ${dataOfFirstFile[currentKey]}`);
        } else if (dataOfFirstFile[currentKey] !== dataOfSecondFile[currentKey]) {
          acc.push(`  - ${currentKey}: ${dataOfFirstFile[currentKey]}`);
          acc.push(`  + ${currentKey}: ${dataOfSecondFile[currentKey]}`);
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
