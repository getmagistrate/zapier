const commonInputFields = require("./commonInputFields");

// create a particular blueprintrender by name
const perform = async (z, bundle) => {
  const response = await z.request({
    method: "POST",
    url: "https://jsonplaceholder.typicode.com/posts",
    // if `body` is an object, it'll automatically get run through JSON.stringify
    // if you don't want to send JSON, pass a string in your chosen format here instead
    body: {
      name: bundle.inputData.name,
    },
  });
  // this should return a single object
  return response.data;
};

const blueprintSlugField = async (z, bundle) => {
  const response = await z.request(
    "{{process.env.API_DOMAIN}}/v1/blueprints/official/"
  );
  return [
    {
      key: "slug",
      label: "Blueprint",
      required: true,
      choices: response.data,
    },
  ];
};

module.exports = {
  // see here for a full list of available properties:
  // https://github.com/zapier/zapier-platform/blob/main/packages/schema/docs/build/schema.md#createschema
  key: "blueprint_render",
  noun: "blueprintrender",

  display: {
    label: "Use Blueprint",
    description: "Generate a legal document using a blueprint.",
  },

  operation: {
    perform,

    // `inputFields` defines the fields a user could provide
    // Zapier will pass them in as `bundle.inputData` later. They're optional.
    // End-users will map data into these fields. In general, they should have any fields that the API can accept. Be sure to accurately mark which fields are required!
    inputFields: [
      blueprintSlugField,
      commonInputFields.name,
      commonInputFields.webhook_url,
      commonInputFields.autosign,
      commonInputFields.suppress_emails,
      commonInputFields.action,
    ],

    // In cases where Zapier needs to show an example record to the user, but we are unable to get a live example
    // from the API, Zapier will fallback to this hard-coded sample. It should reflect the data structure of
    // returned records, and have obvious placeholder values that we can show to any user.
    sample: {
      slug: "official/safe",
      name: "Simple Agreement for Future Equity (SAFE)",
      context: {
        details: {
          purchase_amount: 50000,
          date: "2022-06-01",
          governing_law: "CA",
        },
        company: {
          name: "Magistrate Inc.",
          email: "harry@getmagistrate.com",
          is_entity: true,
          state_of_incorporation: "DE",
          entity_form: "Corporation",
          authorized_human: {
            name: "Harry Khanna",
            title: "Chief Executive Officer",
          },
        },
        investor: {
          name: "Lisa Vedernikova Khanna",
          is_entity: false,
          email: "lisa@getmagistrate.com",
        },
      },
      action: "draft",
    },
  },
};
