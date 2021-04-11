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
  // console.log(node)
  const currentIndent = node.status === undefined ? '  '.repeat((node.depth * 2)) : '  '.repeat((node.depth * 2) - 1);
  if (node.childrens.length !== 0) {
    return `\n${currentIndent}${node.nameOfKey}: {${iter(node.childrens)}\n${currentIndent}}`;
  }
  return parseCurrentNode.states[node.status](node, currentIndent);
};
parseCurrentNode.states = {
  added: (currentNode, currentIndent) => `\n${currentIndent}+ ${currentNode.nameOfKey}: ${getValue(currentNode.value, currentNode.depth + 1)}`,
  deleted: (currentNode, currentIndent) => `\n${currentIndent}- ${currentNode.nameOfKey}: ${getValue(currentNode.value, currentNode.depth + 1)}`,
  no_changed: (currentNode, currentIndent) => `\n${currentIndent}  ${currentNode.nameOfKey}: ${getValue(currentNode.value, currentNode.depth + 1)}`,
  updated: (currentNode, currentIndent) => `\n${currentIndent}- ${currentNode.nameOfKey}: ${getValue(currentNode.value[0], currentNode.depth + 1)}
${currentIndent}+ ${currentNode.nameOfKey}: ${getValue(currentNode.value[1], currentNode.depth + 1)}`,

};
const stylish = (ast) => {
  const iter = (tree) => {
    // console.log(`${JSON.stringify(tree, null, ' ')}XXXXXXXXXXX`);
    const lines = tree.map((node) => parseCurrentNode(node, iter));
    // console.log(lines)
    return lines;
  };
  const result = iter(ast).filter((x) => typeof(x) !== '');
  console.log(`${result}!!!!!!!!!!!!1`)
  return [
    '{',
    ...result,
    '}',
  ].join('\n');
};

export default stylish;
