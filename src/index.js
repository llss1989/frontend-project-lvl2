import render from './render.js';
import buildAst from './buildAst.js';

const genDiff = (filepath1, filepath2, format = 'stylish') => render(format, buildAst(filepath1, filepath2));
export default genDiff;
