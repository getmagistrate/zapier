const unflatten = (obj, skipFirstKey) => {
  // Given the flat nature of Zapier keys, turn it into
  // a nested object Magistrate's API consumes.
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const keys = key.split(".");
    let nested = result;
    const start = skipFirstKey ? 1 : 0;
    for (let i = start; i < keys.length - 1; i++) {
      const k = keys[i];
      nested[k] = nested[k] || {};
      nested = nested[k];
    }
    const lastKey = keys[keys.length - 1];
    if (Array.isArray(value)) {
      nested[lastKey] = value.map((item) => unflatten(item, true));
    } else if (lastKey === "_only") {
      return value;
    } else {
      nested[lastKey] = value;
    }
  }
  return result;
};

module.exports = {
  unflatten,
};
