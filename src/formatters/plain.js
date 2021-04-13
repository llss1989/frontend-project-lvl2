import _ from 'lodash';

const isPrimitive = (value) => ((_.isNil(value) || _.isNumber(value) || _.isBoolean(value) || _.isString(value) || typeof value === 'symbol') ? 'primitive' : 'object');

const getValueForPlain = (value) => {
  const typesOfValueOfPlainStates = {
    string: () => `'${value}'`,
    object: () => value === null ? value: '[complex value]',
    number: () => value,
    boolean: () => value,
    undefined: () => value,
  };
  return typesOfValueOfPlainStates[typeof (value)]();
};

const parseCurrentNode = (currentNode, keyPath, iter) => {
  const newKeyPath = keyPath !== '' ? `${keyPath}.${currentNode.nameOfKey}` : `${currentNode.nameOfKey}`;
  const parseCurrentNodeStates = {
    added: () => `Property '${newKeyPath}' was added with value: ${getValueForPlain(currentNode.value)}`,
    deleted: () => `Property '${newKeyPath}' was removed`,
    updated: () => `Property '${newKeyPath}' was updated. From ${getValueForPlain(currentNode.value[0])} to ${getValueForPlain(currentNode.value[1])}`,
    no_changed: () => null,
  };
  if (currentNode.childrens.length > 0) {
    return iter(currentNode.childrens, `${newKeyPath}`);
  }
  return parseCurrentNodeStates[currentNode.status](newKeyPath, currentNode);
};
const plain = (ast) => {
  const iter = (tree, keyPath) => {
    const lines = tree.map((currentNode) => parseCurrentNode(currentNode, keyPath, iter));
    return lines.filter((x) => typeof x === 'string').join('\n');
  };
  return iter(ast, '');
};
export default plain;
