const mapInputDataKeysToAPI = (data) => {
  if (data instanceof Array) {
    return data.map(mapInputDataKeysToAPI);
  } else if (data instanceof Object) {
    const newObj = {};
    Object.keys(data).forEach((key) => {
      const newKey = key.split(".").slice(-1);
      newObj[newKey] = mapInputDataKeysToAPI(data[key]);
    });
    return newObj;
  } else {
    return data;
  }
};

const perform = async (z, bundle) => {
  const body = mapInputDataKeysToAPI(bundle.inputData);
  const response = await z.request({
    method: "POST",
    url: "https://api.staging.getmagistrate.com/v1/envelopes/",
    body,
  });
  // this should return a single object
  return response.data;
};

module.exports = {
  // see here for a full list of available properties:
  // https://github.com/zapier/zapier-platform/blob/main/packages/schema/docs/build/schema.md#createschema
  key: "envelope",
  noun: "Envelope",

  display: {
    label: "Create Envelope",
    description:
      "Creates a new envelope, probably with input from previous steps.",
  },

  operation: {
    perform,

    // `inputFields` defines the fields a user could provide
    // Zapier will pass them in as `bundle.inputData` later. They're optional.
    // End-users will map data into these fields. In general, they should have any fields that the API can accept. Be sure to accurately mark which fields are required!
    inputFields: [
      {
        key: "name",
        required: true,
        helpText:
          "The name of the envelope. Limited to 254 characters that are alphanumeric, spaces, numbers, or symbols.",
      },
      {
        key: "documents",
        label: "Documents",
        required: true,
        children: [
          {
            key: "documents.body",
            type: "text",
            label: "Body",
            required: true,
            helpText:
              "This is the body (text) of the contract. It should not include any signature blocks.",
          },
        ],
      },
      {
        key: "parties",
        label: "Parties",
        required: true,
        list: true,
        children: [
          {
            key: "parties.name",
            label: "Name",
            type: "string",
            required: true,
          },
          {
            key: "parties.email",
            label: "Email",
            type: "string",
            required: true,
          },
          {
            key: "parties.is_entity",
            type: "boolean",
            required: true,
          },
        ],
      },
      {
        key: "action",
        label: "Action",
        choices: ["draft", "send"],
        required: true,
      },
    ],

    // In cases where Zapier needs to show an example record to the user, but we are unable to get a live example
    // from the API, Zapier will fallback to this hard-coded sample. It should reflect the data structure of
    // returned records, and have obvious placeholder values that we can show to any user.
    sample: {
      id: 1,
      name: "Test",
    },

    // If fields are custom to each user (like spreadsheet columns), `outputFields` can create human labels
    // For a more complete example of using dynamic fields see
    // https://github.com/zapier/zapier-platform/tree/main/packages/cli#customdynamic-fields
    // Alternatively, a static field definition can be provided, to specify labels for the fields
    outputFields: [
      // these are placeholders to match the example `perform` above
      // {key: 'id', label: 'Person ID'},
      // {key: 'name', label: 'Person Name'}
    ],
  },
};
