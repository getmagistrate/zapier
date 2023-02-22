const commonInputFields = require("./commonInputFields");

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
    } else {
      nested[lastKey] = value;
    }
  }
  return result;
};

const perform = async (z, bundle) => {
  const body = unflatten(bundle.inputData);

  // Move the document `body` key to its rightful place for the API.
  body.documents = [{ body: body.body }];
  delete body.body;

  const response = await z.request({
    method: "POST",
    url: "{{process.env.API_DOMAIN}}/v1/envelopes/" + bundle.inputData.id + "/",
    body,
  });
  // this should return a single object
  return response.data;
};

module.exports = {
  key: "envelope",
  noun: "Envelope",

  display: {
    label: "Create Envelope",
    description:
      "Creates a new envelope, probably with input from previous steps.",
  },

  operation: {
    perform,
    inputFields: [
      commonInputFields.name,
      {
        key: "body",
        type: "text",
        label: "Body",
        required: true,
        helpText:
          "This is the body (text) of the contract. It should not include any signature blocks.",
      },
      commonInputFields.parties,
      commonInputFields.webhook_url,
      commonInputFields.autosign,
      commonInputFields.suppress_emails,
      commonInputFields.action,
    ],

    sample: {
      name: "Test Envelope",
      body: "Test Body",
      parties: [
        {
          "parties.name": "Party A",
          "parties.email": "partyA@example.com",
          "parties.is_entity": false,
        },
        {
          "parties.name": "Party B",
          "parties.email": "partyB@example.com",
          "parties.is_entity": true,
          "parties.authorized_human.name": "Jane Doe",
          "parties.authorized_human.title": "President",
        },
      ],
      action: "draft",
    },
  },
};
