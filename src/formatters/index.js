const getValue = (valueKey, depth) => {
  const currentIndent = '  '.repeat(depth * 2);
  const closeBracketIndent = '  '.repeat(depth * 2 - 2);
  if (typeof (valueKey) !== 'object' || valueKey === null) {
    return `${valueKey}`;
  }
  const lines = Object.entries(valueKey).map(([key, currentValue]) => `${currentIndent}${key}: ${getValue(currentValue, depth + 1)}`);
  return ['{',
    ...lines,
    `${closeBracketIndent}}`].join('\n');
};

export const stylish = (ast) => {
  const iter = (tree) => {
    const lines = tree.reduce((acc, node) => {
      const currentIndent = node.status === undefined ? '  '.repeat((node.depth * 2)) : '  '.repeat((node.depth * 2) - 1);
      if (node.childrens.length === 0) {
        if (node.status === 'added') {
          acc.push(`${currentIndent}+ ${node.nameOfKey}: ${getValue(node.value, node.depth + 1)}`);
        }
        if (node.status === 'deleted') {
          acc.push(`${currentIndent}- ${node.nameOfKey}: ${getValue(node.value, node.depth + 1)}`);
        }
        if (node.status === 'no_changed') {
          acc.push(`${currentIndent}  ${node.nameOfKey}: ${getValue(node.value, node.depth + 1)}`);
        }
        if (node.status === 'updated') {
          acc.push(`${currentIndent}- ${node.nameOfKey}: ${getValue(node.value[0], node.depth + 1)}`);
          acc.push(`${currentIndent}+ ${node.nameOfKey}: ${getValue(node.value[1], node.depth + 1)}`);
        }
      }
      if (node.childrens.length !== 0) {
        acc.push(`${currentIndent}${node.nameOfKey}: {`);
        acc.push(iter(node.childrens));
        acc.push(`${currentIndent}}`);
      }
      return acc.flat(1);
    }, []);
    console.log(lines)
    return lines;
  };
  const result = iter(ast);
  return [
    '{',
    ...result,
    '}',
  ].join('\n');
};
const getValueForPlain = (value) => {
  if (typeof (value) === 'object' && value !== null) {
    return '[complex value]';
  } if (typeof (value) === 'string') {
    return `'${value}'`;
  }
  return value;
};

export const plain = (ast) => {
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

export const json = (ast) => JSON.stringify(ast, null, ' ');
