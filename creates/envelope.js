const commonInputFields = require("./commonInputFields");
const { unflatten } = require("./utils");

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
    label: "Use Plain Text",
    description:
      "Pass in the text of a document to creates an envelope and send it for signature.",
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
