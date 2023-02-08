/* globals describe, expect, test, it */

const zapier = require("zapier-platform-core");
const App = require("../../index");
const appTester = zapier.createAppTester(App);
zapier.tools.env.inject();

describe("creates.envelope", () => {
  it("should run", async () => {
    const bundle = {
      authData: {
        apiKey: process.env.API_KEY,
      },
      inputData: {
        name: "Test Envelope",
        documents: [{ "documents.body": "Test Body" }],
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
    };

    const results = await appTester(
      App.creates.envelope.operation.perform,
      bundle
    );
    expect(results).toHaveProperty("id");
  });
});
