import path from 'path';
import fs from 'fs';

const getData = (config) => {
  const type = path.extname(config).slice(1);
  const filepath = path.resolve(process.cwd(), config);
  const data = fs.readFileSync(filepath, 'utf8');
  return [data, type];
};
const getDatasFromBothFiles = (filepath1, filepath2) => [getData(filepath1), getData(filepath2)];

export default getDatasFromBothFiles;
