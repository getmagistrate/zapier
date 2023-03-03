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

const fetchBlueprintDetails = async (z, bundle) => {
  const response = await z.request({
    url:
      "{{process.env.API_DOMAIN}}/v1/blueprints/" + bundle.inputData.slug + "/",
    method: "GET",
    params: { shape: "zapier" },
    skipThrowForStatus: true,
  });
  return response;
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

  // HACK: Making all the fields dynamic feels inefficient...
  // But it would take some hacking to get the list of fields that quality.
  field.altersDynamicFields = true;

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

const removeEmptyObjects = (data, rawFields) => {
  const objectFields = rawFields
    .filter((field) => field.type === "object")
    .map((field) => field.key);

  // Remove false objects
  for (const [key, value] of Object.entries(data)) {
    if (value === false && objectFields.includes(key)) {
      delete data[key];
    }
  }

  // 'copy' objects don't show up in the inputData, but they should behave like 'true' objects.
  // for purposes of deciding whether descendants should be removed.
  // So add 'copy' objects as 'true' objects.
  const copyFields = rawFields
    .map((field) => fieldMap(field, data))
    .filter(Boolean)
    .filter((field) => field.key.startsWith("context."))
    .filter((field) => field.type === "copy")
    .map((field) => field.key)
    .forEach((field) => (data[field] = true));

  // Remove decendants of objects since removed.
  const processed = {};

  loop1: for (const [key, value] of Object.entries(data)) {
    const ancestors = enumerateAncestors(key);

    for (let i = 0; i < ancestors.length; i++) {
      if (!(ancestors[i] in data)) {
        continue loop1;
      }
    }

    // All ancestors present, go ahead and add it.
    processed[key] = value;
  }

  // Remove 'true' objects since that's invalid in the data.
  for (const [key, value] of Object.entries(processed)) {
    if (objectFields.includes(key)) {
      delete processed[key];
    }
  }

  return processed;
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

    // Don't treat bare 'context' ancestor as an ancestor.
    if (ancestorKey !== "context") {
      accumulated.push(ancestorKey);
    }
  }
  return accumulated;
};

module.exports = {
  unflatten,
  fetchBlueprintDetails,
  evaluateExpr,
  fieldMap,
  descendantMap,
  enumerateAncestors,
  removeEmptyObjects,
};
