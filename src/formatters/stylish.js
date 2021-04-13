import isPrimitiveOrObject from './index.js';

const getValue = (valueKey, depth) => {
  const currentIndent = '  '.repeat(depth * 2);
  const closeBracketIndent = '  '.repeat(depth * 2 - 2);
  if (typeof (valueKey) !== 'object' || valueKey === null) {
    return valueKey;
  }
  const lines = Object.entries(valueKey).map(([key, currentValue]) => `${currentIndent}${key}: ${getValue(currentValue, depth + 1)}`);
  return ['{',
    ...lines,
    `${closeBracketIndent}}`].join('\n');
};

const checkIndentNeeded = (depth) => {
  const checkIndentNeededStates = {
    true: '',
    false: '\n',
  };
  return checkIndentNeededStates[depth === 1];
};

const parseCurrentNode = (node, iter) => {
  const currentIndent = node.status === undefined ? '  '.repeat((node.depth * 2)) : '  '.repeat((node.depth * 2) - 1);
  const parseCurrentNodeStates = {
    added: () => `${checkIndentNeeded(node.depth)}${currentIndent}+ ${node.nameOfKey}: ${getValue(node.value, node.depth + 1)}`,
    deleted: () => `${checkIndentNeeded(node.depth)}${currentIndent}- ${node.nameOfKey}: ${getValue(node.value, node.depth + 1)}`,
    no_changed: () => `${checkIndentNeeded(node.depth)}${currentIndent}  ${node.nameOfKey}: ${getValue(node.value, node.depth + 1)}`,
    updated: () => `${checkIndentNeeded(node.depth)}${currentIndent}- ${node.nameOfKey}: ${getValue(node.value[0], node.depth + 1)}\n${currentIndent}+ ${node.nameOfKey}: ${getValue(node.value[1], node.depth + 1)}`,
  };
  if (node.childrens.length !== 0) {
    return node.depth === 1 ? `${currentIndent}${node.nameOfKey}: {${iter(node.childrens)}\n${currentIndent}}` : `\n${currentIndent}${node.nameOfKey}: {${iter(node.childrens)}\n${currentIndent}}`;
  }
  return parseCurrentNodeStates[node.status](node, currentIndent);
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
