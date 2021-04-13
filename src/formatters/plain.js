const getValueForPlain = (value) => {
  if (typeof (value) === 'object' && value !== null) {
    return '[complex value]';
  } if (typeof (value) === 'string') {
    return `'${value}'`;
  }
  return value;
};

const parseCurrentNode = (currentNode, keyPath, iter) => {
  const parseCurrentNodeStates = {
    added: () => `Property '${keyPath}' was added with value: ${getValueForPlain(currentNode.value)}`,
    deleted: () => `Property '${keyPath}' was removed`,
    updated: () => `Property '${keyPath}' was updated. From ${getValueForPlain(currentNode.value[0])} to ${getValueForPlain(currentNode.value[1])}`,
    no_changed: () => null,
  };
  const newKeyPath = keyPath !== '' ? `${keyPath}.${currentNode.nameOfKey}` : `${currentNode.nameOfKey}`;
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
