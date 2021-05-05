import _ from 'lodash';

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

const buildAst = (parseDataFromFirstFile, dataFromSecondFile) => {
  const iter = (nodeFromFirstFile, nodeFromSecondFile, nestling = 1) => {
    const keysOfDataOfFirstFile = Object.keys(nodeFromFirstFile);
    const keyOfDataOfSecondFile = Object.keys(nodeFromSecondFile);
    const ast = _.sortBy(_.union(keysOfDataOfFirstFile, keyOfDataOfSecondFile))
      .map((currentKey) => {
        const typeOfKeyValueFromFirstFile = getTypeOfValue(typeof nodeFromFirstFile[currentKey]);
        const typeOfKeyValueFromSecondFile = getTypeOfValue(typeof nodeFromSecondFile[currentKey]);
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
        return true;
      });
    return ast;
  };
  return iter(parseDataFromFirstFile, dataFromSecondFile);
};
export default buildAst;
