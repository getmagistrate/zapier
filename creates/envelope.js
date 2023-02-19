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
            label: "Is the party an entity?",
            type: "boolean",
            required: true,
            helpText:
              "If the party to the contract is an entity like a corporation, this should be true. If the party is a human being, this should be false.",
          },
          {
            key: "parties.authorized_human.name",
            label: "Signatory's Name (Entities Only)",
            helpText:
              "The name of the human that is authorized to sign for the entity. **Required** if `is_entity` is true. **Ignored** if `is_entity` is false.",
          },
          {
            key: "parties.authorized_human.title",
            label: "Signatory's Title (Entities Only)",
            helpText:
              "The title of the human that is authorized to sign for the entity. **Ignored** if `is_entity` is false.",
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
          "parties.is_entity": true,
          "parties.authorized_human.name": "Jane Doe",
          "parties.authorized_human.title": "President",
        },
      ],
      action: "draft",
    },
  },
};
