import plain from './formatters/plain.js';
import json from './formatters/json.js';
import stylish from './formatters/stylish.js';
import getDatasFromBothFiles from './getData.js';
import parse from './parsers.js';
import buildAst from './buildAst.js';

const genDiff = (filepath1, filepath2, format = 'stylish') => {
  const [[dataFromFirstFile, typeOfFirstFile], [dataFromSecondFile,
    typeOfSecondFile]] = getDatasFromBothFiles(filepath1, filepath2);
  const [parsedDataFromFirstFile, parsedDataFromSecondFile] = [parse(dataFromFirstFile,
    typeOfFirstFile), parse(dataFromSecondFile, typeOfSecondFile)];
  const ast = buildAst(parsedDataFromFirstFile, parsedDataFromSecondFile);
  const formatters = {
    stylish: () => stylish(ast),
    json: () => json(ast),
    plain: () => plain(ast),
  };
  return formatters[format]();
};
export default genDiff;
