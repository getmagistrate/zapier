module.exports = {
  name: {
    key: "name",
    required: true,
    helpText:
      "The name of the envelope. Limited to 254 characters that are alphanumeric, spaces, numbers, or symbols.",
  },
  parties: {
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
  webhook_url: {
    key: "webhook_url",
    label: "Webhook URL",
    type: "string",
    helpText:
      "The URL where Magistrate will `POST` webhooks related to this envelope. If this is provided, the API will immediately `POST` a webhook of type `webhook_url_verification` to the endpoint, and if it does not return a `2xx` response within a couple seconds, the whole API call fail with a `400` response.",
  },
  autosign: {
    key: "autosign",
    label: "Autosign",
    type: "boolean",
    helpText:
      "If autosign is true, any signatures belonging to the creator of the envelope will be signed automatically. The creator will not receive an email soliciting their signature since they will have already signed.\n\nThis is ignored if the action is `draft`. This is also ignored if the creator of the envelope is not also a signatory.",
  },
  suppress_emails: {
    key: "suppress_emails",
    label: "Suppress Emails",
    choices: ["creator"],
    helpText:
      "If provided, it must be the string `creator`. If this is provided, the creator of the envelope will not receive any emails related to the envelope.",
  },
  action: {
    key: "action",
    label: "Action",
    choices: ["draft", "send"],
    required: true,
    helpText:
      "`send` will generate an envelope and send it for signature to all parties in one step. **Caution**: Using `send` will immediately email all parties to the contract. `draft` will generate an envelope and save it as a draft. To make any edits or send it for signature, you must log into the web user interface.",
  },

  commonInputFields: [
    {
      key: "body",
      type: "text",
      label: "Body",
      required: true,
      helpText:
        "This is the body (text) of the contract. It should not include any signature blocks.",
    },
  ],
};
