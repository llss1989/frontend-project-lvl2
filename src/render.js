import stylish from './formatters/stylish.js';
import plain from './formatters/plain.js';
import json from './formatters/json.js';

const render = (format, ast) => {
  if (format === 'stylish') {
    return stylish(ast);
  }
  if (format === 'plain') {
    return plain(ast);
  }
  if (format === 'json') {
    return json(ast);
  }
  throw Error('Hello from gendiff!');
};

export default render;
