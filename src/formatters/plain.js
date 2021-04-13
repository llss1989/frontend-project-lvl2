const getValueForPlain = (value) => {
  if (typeof (value) === 'object' && value !== null) {
    return '[complex value]';
  } if (typeof (value) === 'string') {
    return `'${value}'`;
  }
  return value;
};

const buildNewKeyPath = (currentNode, keyPath) => buildNewKeyPath.states[keyPath === ''](currentNode, keyPath);
buildNewKeyPath.states = {
  true: (currentNode, keyPath) => `${currentNode.nameOfKey}`,
  false: (currentNode, keyPath) => `${keyPath}.${currentNode.nameOfKey}`,
};

const parseCurrentNode = (currentNode, keyPath, iter) => {
  const newKeyPath = buildNewKeyPath(currentNode, keyPath);
  if (currentNode.childrens.length > 0) {
    return iter(currentNode.childrens, `${newKeyPath}`);
  }
  return parseCurrentNode.states[currentNode.status](newKeyPath, currentNode);
};
parseCurrentNode.states = {
  added: (currentNode, keyPath) => `Property '${buildNewKeyPath(currentNode, keyPath)}' was added with value: ${getValueForPlain(currentNode.value)}`,
  deleted: (currentNode, keyPath) => `Property '${buildNewKeyPath(currentNode, keyPath)}' was removed`,
  updated: (currentNode, keyPath) => `Property '${buildNewKeyPath(currentNode, keyPath)}' was updated. From ${getValueForPlain(currentNode.value[0])} to ${getValueForPlain(currentNode.value[1])}`,
  no_changed: () => null,
};

const plain = (ast) => {
  const iter = (tree, keyPath) => {
    const lines = tree.map((currentNode) => parseCurrentNode(currentNode, keyPath, iter));
    return lines.filter((x) => typeof x === 'string').join('\n');
  };
  return iter(ast, '');
};
export default plain;
