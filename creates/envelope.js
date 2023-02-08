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

  // Move the document `body` key to its rightful place for the API.
  body.documents = [{ body: body.body }];
  delete body.body;

  const response = await z.request({
    method: "POST",
    url: "https://api.staging.getmagistrate.com/v1/envelopes/",
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
      {
        key: "name",
        required: true,
        helpText:
          "The name of the envelope. Limited to 254 characters that are alphanumeric, spaces, numbers, or symbols.",
      },
      {
        key: "body",
        type: "text",
        label: "Body",
        required: true,
        helpText:
          "This is the body (text) of the contract. It should not include any signature blocks.",
      },
      {
        key: "parties",
        label: "Parties",
        required: true,
        children: [
          {
            key: "parties.name",
            label: "Name",
            type: "string",
            required: true,
            helpText:
              'The legal name of the party. For example, "Magistrate Inc." if the party is an entity. Or "Harry Khanna" if the party is a human being. Limited to 80 characters.',
          },
          {
            key: "parties.email",
            label: "Email",
            type: "string",
            required: true,
            helpText:
              "The email address of the party. If the party is an entity like a corporation, this should be the email address of the authorized signatory. Limited to 254 characters.",
          },
          {
            key: "parties.is_entity",
            type: "boolean",
            required: true,
            helpText:
              "If the party to the contract is an entity like a corporation, this should be true. If the party is a human being, this should be false.",
          },
        ],
      },
      {
        key: "autosign",
        label: "Autosign",
        type: "boolean",
        helpText:
          "If autosign is true, any signatures belonging to the creator of the envelope will be signed automatically. The creator will not receive an email soliciting their signature since they will have already signed.\n\nThis is ignored if the action is `draft`. This is also ignored if the creator of the envelope is not also a signatory.",
      },
      {
        key: "suppress_emails",
        label: "Suppress Emails",
        choices: ["creator"],
        helpText:
          "If provided, it must be the string `creator`. If this is provided, the creator of the envelope will not receive any emails related to the envelope.",
      },
      {
        key: "action",
        label: "Action",
        choices: ["draft", "send"],
        required: true,
        helpText:
          "`send` will generate an envelope and send it for signature to all parties in one step. **Caution**: This will `draft` will generate an envelope and save it as a draft. To make any edits or send it for signature, you must log into the web user interface.",
      },
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
          "parties.is_entity": false,
        },
      ],
      action: "draft",
    },
  },
};
