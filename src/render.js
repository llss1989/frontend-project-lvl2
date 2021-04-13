import stylish from './formatters/stylish.js';
import plain from './formatters/plain.js';
import json from './formatters/json.js';

const render = (format, ast) => {
  const renderStates = {
    stylish: () => stylish(ast),
    plain: () => plain(ast),
    json: () => json(ast),
  };
  return renderStates[format]();
};

export default render;
