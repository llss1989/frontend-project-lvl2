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
        if (node.status === 'changed') {
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
    return lines;
  };
  const preResult = iter(ast);
  return [
    '\n{',
    ...preResult,
    '}',
  ].join('\n');
};

export const plain = (ast) => {
  return 'Its plain!!!!';
};
