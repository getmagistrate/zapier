const commonInputFields = require("./commonInputFields");
const {
  unflatten,
  fieldMap,
  descendantMap,
  fetchBlueprintDetails,
  removeEmptyObjects,
} = require("./utils");

const perform = async (z, bundle) => {
  const rawFields = await fetchBlueprintDetails(z, bundle);
  const prunedData = removeEmptyObjects(
    bundle.inputData,
    z.JSON.parse(rawFields.data.context)
  );

  const body = unflatten(prunedData);
  const response = await z.request({
    method: "POST",
    url:
      "{{process.env.API_DOMAIN}}/v1/envelopes/blueprint/" +
      bundle.inputData.slug +
      "/",
    body,
  });
  // this should return a single object
  return response.data;
};

const errorField = (response, key, preface = "") => {
  if (response.data.detail) {
    return [
      {
        key,
        type: "copy",
        helpText: preface + response.data.detail,
      },
    ];
  }
};

const blueprintSlugField = async (z, bundle) => {
  const response = await z.request({
    url: "{{process.env.API_DOMAIN}}/v1/blueprints/official/",
    skipThrowForStatus: true,
  });

  if (response.status >= 400) {
    return errorField(
      response,
      "slug",
      "There was a problem while obtaining the list of blueprints: "
    );
  }

  const data = z.JSON.parse(response.content);

  return [
    {
      key: "slug",
      label: "Blueprint",
      required: true,
      choices: data,
      altersDynamicFields: true,
    },
  ];
};

const partiesField = async (z, bundle) => {
  if (!bundle.inputData.slug) {
    return [];
  }

  const response = await z.request({
    url:
      "{{process.env.API_DOMAIN}}/v1/blueprints/" + bundle.inputData.slug + "/",
    skipThrowForStatus: true,
  });

  if (response.status >= 400) {
    return errorField(
      response,
      "parties",
      "There was a problem while looking up the selected blueprint: "
    );
  }

  if (response.data.separate_parties) {
    return [commonInputFields.parties];
  }

  return [];
};

const contextField = async (z, bundle) => {
  if (!bundle.inputData.slug) {
    return [
      {
        key: "context",
        type: "copy",
        helpText:
          "You must select a blueprint from the list to set up this integration.",
      },
    ];
  }

  const response = await fetchBlueprintDetails(z, bundle);

  if (response.status >= 400) {
    return errorField(
      response,
      "context",
      "There was a problem while looking up the selected blueprint: "
    );
  }

  const fields = z.JSON.parse(response.data.context)
    .map((field) => fieldMap(field, bundle.inputData))
    .filter(Boolean);

  const remainingFieldKeys = fields.map((field) => field.key);

  return fields
    .map((field) => descendantMap(field, bundle.inputData, remainingFieldKeys))
    .filter(Boolean);
};

module.exports = {
  key: "blueprint_render",
  noun: "blueprintrender",

  display: {
    label: "Use Blueprint",
    description: "Generate a legal document using a blueprint.",
  },

  operation: {
    perform,

    inputFields: [
      blueprintSlugField,
      commonInputFields.name,
      contextField,
      partiesField,
      commonInputFields.webhook_url,
      commonInputFields.autosign,
      commonInputFields.suppress_emails,
      commonInputFields.action,
    ],

    sample: {
      slug: "official/saas-services-agreement",
      name: "Test SaaS Services Agreement",
      "context.basic.monthly_fee": 10000,
      "context.basic.term": 12,
      "context.basic.favor": "balanced",
      "context.basic.date": "2023-02-01",
      "context.basic.governing_law": "NY",
      "context.services": [
        { "context.services._only": "Custom blueprint generation" },
        { "context.services._only": "Electronic signatures" },
        { "context.services._only": "API access" },
      ],
      "context.company.name": "Magistrate Inc.",
      "context.company.email": "harry@getmagistrate.com",
      "context.company.is_entity": true,
      "context.company.authorized_human.name": "Harry Khanna",
      "context.company.authorized_human.title": "Chief Executive Officer",
      "context.customer.name": "BigCorp, Inc.",
      "context.customer.is_entity": true,
      "context.customer.email": "bigcorp@example.com",
      "context.customer.authorized_human.name": "Jane Smith",
      "context.customer.authorized_human.title": "Chief Executive Officer",
      action: "draft",
    },
  },
};
