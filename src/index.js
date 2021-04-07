import stylish from './stylish.js';
import buildAst from './buildAst.js';

const genDiff = (filepath1, filepath2, format = 'stylish') => stylish(format, buildAst(filepath1, filepath2));

export default genDiff;
