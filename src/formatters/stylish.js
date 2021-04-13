const getValue = (valueKey, depth) => {
  const currentIndent = '  '.repeat(depth * 2);
  const closeBracketIndent = '  '.repeat(depth * 2 - 2);
  if (typeof (valueKey) !== 'object' || valueKey === null) {
    if (valueKey === '') {
      return `${valueKey}`;
    }
    return valueKey;
  }
  const lines = Object.entries(valueKey).map(([key, currentValue]) => `${currentIndent}${key}: ${getValue(currentValue, depth + 1)}`);
  return ['{',
    ...lines,
    `${closeBracketIndent}}`].join('\n');
};
const parseCurrentNode = (node, iter) => {
  const currentIndent = node.status === undefined ? '  '.repeat((node.depth * 2)) : '  '.repeat((node.depth * 2) - 1);
  if (node.childrens.length !== 0) {
    return node.depth === 1 ? `${currentIndent}${node.nameOfKey}: {${iter(node.childrens)}\n${currentIndent}}` : `\n${currentIndent}${node.nameOfKey}: {${iter(node.childrens)}\n${currentIndent}}`;
  }
  return parseCurrentNode.states[node.status](node, currentIndent);
};

const checkIndentNeededStates = {
  true: '',
  false: '\n',
};
const checkIndentNeeded = (depth) => checkIndentNeededStates[depth === 1];

parseCurrentNode.states = {
  added: (currentNode, currentIndent) => `${checkIndentNeeded(currentNode.depth)}${currentIndent}+ ${currentNode.nameOfKey}: ${getValue(currentNode.value, currentNode.depth + 1)}`,
  deleted: (currentNode, currentIndent) => `${checkIndentNeeded(currentNode.depth)}${currentIndent}- ${currentNode.nameOfKey}: ${getValue(currentNode.value, currentNode.depth + 1)}`,
  no_changed: (currentNode, currentIndent) => `${checkIndentNeeded(currentNode.depth)}${currentIndent}  ${currentNode.nameOfKey}: ${getValue(currentNode.value, currentNode.depth + 1)}`,
  updated: (currentNode, currentIndent) => `${checkIndentNeeded(currentNode.depth)}${currentIndent}- ${currentNode.nameOfKey}: ${getValue(currentNode.value[0], currentNode.depth + 1)}\n${currentIndent}+ ${currentNode.nameOfKey}: ${getValue(currentNode.value[1], currentNode.depth + 1)}`,

};
const stylish = (ast) => {
  const iter = (tree) => {
    const lines = tree.map((node) => parseCurrentNode(node, iter));
    return lines;
  };
  const result = iter(ast);
  return [
    '{',
    ...result,
    '}',
  ].join('\n').replace(/,/gm, '');
};

export default stylish;
