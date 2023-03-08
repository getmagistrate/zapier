const createEnvelope = require("./creates/envelope");
const getEnvelope = require("./searches/envelope");
const createBlueprintRender = require("./creates/blueprint_render");
const authentication = {
  type: "custom",
  test: {
    url: "{{process.env.API_DOMAIN}}/v1/me/",
  },
  connectionLabel: "{{email}}",
  fields: [
    {
      key: "apiKey",
      type: "string",
      required: true,
      helpText:
        "Found on your [integrations page](https://secure.getmagistrate.com/sign/integrations/).",
    },
  ],
};

const addApiKeyToHeader = (request, z, bundle) => {
  if (bundle.authData.apiKey) {
    request.headers.Authorization = `Token ${bundle.authData.apiKey}`;
  }
  return request;
};

const addHeaders = (request, z, bundle) => {
  request.headers["content-type"] = "application/json";
  request.headers["accept"] = "application/json";
  return request;
};

module.exports = {
  // This is just shorthand to reference the installed dependencies you have.
  // Zapier will need to know these before we can upload.
  version: require("./package.json").version,
  platformVersion: require("zapier-platform-core").version,
  authentication,
  beforeRequest: [addApiKeyToHeader, addHeaders],

  // If you want your trigger to show up, you better include it here!
  triggers: {},

  // If you want your searches to show up, you better include it here!
  searches: {
    [getEnvelope.key]: getEnvelope,
  },

  // If you want your creates to show up, you better include it here!
  creates: {
    [createEnvelope.key]: createEnvelope,
    [createBlueprintRender.key]: createBlueprintRender,
  },

  resources: {},
};
