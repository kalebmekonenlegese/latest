const sanitizeString = (value) => {
  if (typeof value !== 'string') return value;
  return value.replace(/<[^>]*>/g, '').trim();
};

const sanitizeObject = (input) => {
  if (Array.isArray(input)) return input.map(sanitizeObject);
  if (typeof input === 'object' && input !== null) {
    return Object.entries(input).reduce((acc, [key, value]) => {
      acc[key] = sanitizeObject(value);
      return acc;
    }, {});
  }
  return sanitizeString(input);
};

module.exports = {
  sanitizeString,
  sanitizeObject
};
