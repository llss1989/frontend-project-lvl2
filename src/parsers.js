import yaml from 'js-yaml';

const getParseData = (data, type) => {
  if (type === '.json') {
    return JSON.parse(data);
  }
  if (type === '.yaml') {
    return yaml.safeLoad(data);
  }
  return Error;
};

export default getParseData;
