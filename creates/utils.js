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

const fieldMap = (field, inputData) => {
  // N.B. Processing of an object's descendants, e.g., removing them or adding
  // copy to them, appears in a different function.

  // Resolve required and disallowed into absolute true or false.
  field.required = evaluateExpr(field.required, inputData);
  field.disallowed = evaluateExpr(field.disallowed, inputData);

  if (field.disallowed) {
    // Remove all disallowed fields. If the field is an object,
    // descendants will be removed in another step.
    return null;
  }

  // disallowed shouldn't actually appear in the zapier inputField
  delete field.disallowed;

  if (field.type == "object") {
    if (field.required) {
      // If the field is an object, if required, make the field
      // a copy field with the object's copy.
      // Don't touch descendants.
      field.type = "copy";
      field.required = false;
    } else {
      // If the object is not required or disallowed,
      // it presents as a boolean field that the user must provide.
      field.type = "boolean";
      field.required = true;
    }
  }

  return field;
};

const descendantMap = (field, inputData, remainingFieldKeys) => {
  const ancestors = enumerateAncestors(field.key);

  for (let i = 0; i < ancestors.length; i++) {
    // If any ancestor of the field is missing, remove the field.
    if (!remainingFieldKeys.includes(ancestors[i])) {
      return null;
    }

    // If any ancestor of the field is equal to `false`, remove the field.
    // This would be if the boolean object anscestor has been flipped manually to `false`.
    if (inputData[ancestors[i]] == false) {
      return null;
    }
  }
  return field;
};

const enumerateAncestors = (key) => {
  const parts = key.split(".");
  const accumulated = [];
  for (let i = 0; i < parts.length - 1; i++) {
    let ancestorKey = "";
    for (let j = 0; j <= i; j++) {
      ancestorKey = ancestorKey.concat(parts[j]);

      if (j != i) {
        ancestorKey = ancestorKey.concat(".");
      }
    }
    accumulated.push(ancestorKey);
  }
  return accumulated;
};

module.exports = {
  unflatten,
  evaluateExpr,
  fieldMap,
  descendantMap,
  enumerateAncestors,
};
