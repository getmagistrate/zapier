/* globals describe, expect, test, it */

const zapier = require("zapier-platform-core");
const App = require("../../index");
const getEnvelope = require("../../searches/envelope");
const appTester = zapier.createAppTester(App);
zapier.tools.env.inject();

describe("searches.envelope", () => {
  it("should run", async () => {
    const bundle = {
      authData: {
        apiKey: process.env.API_KEY,
      },
      inputData: getEnvelope.operation.sample,
    };

    const results = await appTester(
      App.searches.envelope.operation.perform,
      bundle
    );
    expect(results).toBeDefined();
    expect(results[0]).toHaveProperty("id");
    expect(results[0]).toHaveProperty("name");
    expect(results[0]).toHaveProperty("status");
  });

  it("should return an empty array for bad IDs", async () => {
    const bundle = {
      authData: {
        apiKey: process.env.API_KEY,
      },
      inputData: { id: 1 },
    };

    const results = await appTester(
      App.searches.envelope.operation.perform,
      bundle
    );
    expect(results).toBeDefined();
    expect(results).toHaveLength(0);
  });
});
