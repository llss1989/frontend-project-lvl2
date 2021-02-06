import yaml from 'js-yaml';

const getParseData = (data, type) => {
  switch (type) {
    case 'json':
      return JSON.parse(data);
    case 'yml':
      return yaml.safeLoad(data);
    default:
      throw Error('Does not support this file type');
  }
};

export default getParseData;
