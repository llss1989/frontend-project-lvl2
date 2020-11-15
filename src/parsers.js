import yaml from 'js-yaml';

const getParseData = (data, type) => {
  if (type === '.json') {
    return JSON.parse(data);
  }
  if (type === '.yaml') {
    return yaml.safeLoad(data);
  }
};

export default getParseData;
