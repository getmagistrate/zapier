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

const evaluateExpr = (expr, inputData) => {
  let op, args;

  // Try/catch is for true/false handling since those aren't
  // in arrays and can't be destructured.
  try {
    [op, ...args] = Array.isArray(expr) ? expr : JSON.parse(expr);
  } catch (error) {
    op = expr;
  }

  switch (op) {
    case true:
      return true;
    case false:
      return false;
    case "exists":
      return args[0] in inputData;
    case "not_exist":
      return !(args[0] in inputData);
    case "eq":
      return inputData[args[0]] == args[1]; // soft equality for '5' == 5, for example.
    case "ne":
      return inputData[args[0]] != args[1];
    case "and":
      return (
        evaluateExpr(args[0], inputData) && evaluateExpr(args[1], inputData)
      );
    case "or":
      return (
        evaluateExpr(args[0], inputData) || evaluateExpr(args[1], inputData)
      );
    default:
      throw new Error("Unrecognized operation " + tokens[0]);
  }
};

module.exports = {
  unflatten,
  evaluateExpr,
};
