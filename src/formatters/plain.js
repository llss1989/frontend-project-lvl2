const getValueForPlain = (value) => {
  if (typeof (value) === 'object' && value !== null) {
    return '[complex value]';
  } if (typeof (value) === 'string') {
    return `'${value}'`;
  }
  return value;
};

const plain = (ast) => {
  const iter = (tree, keyPath) => {
    const lines = tree.reduce((acc, currentNode) => {
      const newKeyPath = keyPath !== '' ? `${keyPath}.${currentNode.nameOfKey}` : `${currentNode.nameOfKey}`;
      if (currentNode.childrens.length === 0 && currentNode.status !== 'no_changed') {
        if (currentNode.status === 'added') {
          acc.push(`Property '${newKeyPath}' was added with value: ${getValueForPlain(currentNode.value)}`);
        }
        if (currentNode.status === 'deleted') {
          acc.push(`Property '${newKeyPath}' was removed`);
        }
        if (currentNode.status === 'updated') {
          acc.push(`Property '${newKeyPath}' was updated. From ${getValueForPlain(currentNode.value[0])} to ${getValueForPlain(currentNode.value[1])}`);
        }
      }
      if (currentNode.childrens.length > 0) {
        acc.push(`${iter(currentNode.childrens, `${newKeyPath}`)}`);
      }
      return acc;
    }, []);
    return lines.join('\n');
  };
  return iter(ast, '');
};
export default plain;
