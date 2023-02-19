/* globals describe, expect, test, it */

const zapier = require("zapier-platform-core");
const App = require("../../index");
const createEnvelope = require("../../creates/envelope");
const appTester = zapier.createAppTester(App);
zapier.tools.env.inject();

describe("creates.envelope", () => {
  it("should run", async () => {
    const bundle = {
      authData: {
        apiKey: process.env.API_KEY,
      },
      inputData: createEnvelope.operation.sample,
    };

    const results = await appTester(
      App.creates.envelope.operation.perform,
      bundle
    );
    expect(results).toBeDefined();
    expect(results).toHaveProperty("id");
    expect(results).toHaveProperty("name");
    expect(results).toHaveProperty("status");
    expect(results).toHaveProperty("source");
    expect(results["source"]).toEqual("zapier");

  });
});
