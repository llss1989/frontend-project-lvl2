import _ from 'lodash';

const isPrimitiveOrObject = (value) => (_.isNil(value) || _.isNumber(value) || _.isBoolean(value) || _.isString(value) || typeof value === 'symbol' ? 'primitive' : 'object');
export default isPrimitiveOrObject;
