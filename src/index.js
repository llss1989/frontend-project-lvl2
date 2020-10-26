import fs from 'fs';
import path from 'path';
import _ from 'lodash';

export const getData = (config) => {
  const filepath = path.resolve(config);
  const data = fs.readFileSync(filepath, 'utf8');
  return data;
};

const genDiff = (firstConfig, secondConfig) => {
  const data1 = JSON.parse(getData(firstConfig));
  const data2 = JSON.parse(getData(secondConfig));
  const keysOfData1 = Object.keys(data1);
  const keyOfData2 = Object.keys(data2);
  const onionKeys = _.union(keysOfData1, keyOfData2)
    .sort()
    .reduce((acc, currentKey, index, array) => {
      if (Object.prototype.hasOwnProperty.call(data1, currentKey)
      && !Object.prototype.hasOwnProperty.call(data2, currentKey)) {
        acc.push(`-${currentKey}: ${data1[currentKey]}`);
      }
      if (!Object.prototype.hasOwnProperty.call(data1, currentKey)
      && Object.prototype.hasOwnProperty.call(data2, currentKey)) {
        acc.push(`+${currentKey}: ${data2[currentKey]}`);
      }
      if (Object.prototype.hasOwnProperty.call(data1, currentKey)
      && Object.prototype.hasOwnProperty.call(data2, currentKey)) {
        if (data1[currentKey] === data2[currentKey]) {
          acc.push(` ${currentKey}: ${data1[currentKey]}`);
        } else if (data1[currentKey] !== data2[currentKey]) {
          acc.push(`-${currentKey}: ${data1[currentKey]}`);
          acc.push(`+${currentKey}: ${data2[currentKey]}`);
        }
      }
      if (index === array.length - 1) {
        acc.push('}');
      }
      return acc;
    }, ['{']);
  return onionKeys.join('\n');
};
export default genDiff;
