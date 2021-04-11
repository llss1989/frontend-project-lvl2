const getValueForPlain = (value) => {
  if (typeof (value) === 'object' && value !== null) {
    return '[complex value]';
  } if (typeof (value) === 'string') {
    return `'${value}'`;
  }
  return value;
};
const parseCurrentNode = (currentNode, keyPath, iter) => {
  const newKeyPath = keyPath !== '' ? `${keyPath}.${currentNode.nameOfKey}` : `${currentNode.nameOfKey}`;
  if (currentNode.childrens.length > 0) {
    return iter(currentNode.childrens, `${newKeyPath}`);
  }
  if (currentNode.childrens.length === 0 && currentNode.status !== 'no_changed'){
    return parseCurrentNode.states[currentNode['status']](newKeyPath, currentNode);
  }
};
parseCurrentNode.states = {
  added: (newKeyPath, currentNode) => `Property '${newKeyPath}' was added with value: ${getValueForPlain(currentNode.value)}`,
  deleted: (newKeyPath, currentNode) => `Property '${newKeyPath}' was removed`,
  updated: (newKeyPath, currentNode) => `Property '${newKeyPath}' was updated. From ${getValueForPlain(currentNode.value[0])} to ${getValueForPlain(currentNode.value[1])}`,
}

const plain = (ast) => {
  const iter = (tree, keyPath) => {
    const lines = tree.map((currentNode) => parseCurrentNode(currentNode, keyPath, iter));
    return lines.filter((x) => typeof x === 'string').join('\n');
  };
  return iter(ast, '');
};
export default plain;
