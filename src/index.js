import plain from './formatters/plain.js';
import json from './formatters/json.js';
import stylish from './formatters/stylish.js';
import getData from './getData.js';
import parse from './parsers.js';
import buildAst from './buildAst.js';

const genDiff = (filepath1, filepath2, format = 'stylish') => {
  const ast = buildAst(parse(...getData(filepath1)), parse(...getData(filepath2)));
  const formatters = {
    stylish: stylish(ast),
    json: json(ast),
    plain: plain(ast),
  };
  return formatters[format];
};
export default genDiff;
