// find a particular envelope by name
const perform = async (z, bundle) => {
  const response = await z.request({
    url:
      "https://api.staging.getmagistrate.com/v1/envelopes/" +
      bundle.inputData.id +
      "/",
    skipThrowForStatus: true,
  });
  if (response.status === 404) {
    return [];
  } else if (response.status >= 400) {
    throw new z.errors.ResponseError(response);
  }
  // this should return a single object
  return [response.data];
};

module.exports = {
  key: "envelope",
  noun: "Envelope",

  display: {
    label: "Get Envelope",
    description: "Gets an envelope based on unique id.",
  },

  operation: {
    perform,
    inputFields: [
      {
        key: "id",
        required: true,
        helpText:
          "Get the Envelope with this id. If it does not exist, this will return an empty array",
      },
    ],

    // In cases where Zapier needs to show an example record to the user, but we are unable to get a live example
    // from the API, Zapier will fallback to this hard-coded sample. It should reflect the data structure of
    // returned records, and have obvious placeholder values that we can show to any user.
    sample: {
      id: "c52fce6d-e72f-4637-a2c0-97fdfe5ebe46",
    },
  },
};
