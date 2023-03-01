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

const descendsFromOptionalHandler = (fields, bundle) => {
  const filtered = fields.filter((f) => {
    if (f.descendsFromOptional !== null) {
      const optionalObj = bundle.inputData[f.descendsFromOptional];
      if (optionalObj === false) {
        return false;
      }
    }
    return true;
  });

  // Get rid of the now-unnecessary `descendsFromOptional` key.
  const pruned = filtered.map((f) => {
    const { descendsFromOptional, ...rest } = f;
    return rest;
  });
  return pruned;
};

module.exports = {
  unflatten,
  descendsFromOptionalHandler,
};
