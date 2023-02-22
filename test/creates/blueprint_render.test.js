/* globals describe, expect, test, it */

const zapier = require("zapier-platform-core");
const blueprint_render = require("../../creates/blueprint_render");

// Use this to make test calls into your app:
const App = require("../../index");
const appTester = zapier.createAppTester(App);
// read the `.env` file into the environment, if available
zapier.tools.env.inject();

describe("creates.blueprint_render", () => {
  it("should run", async () => {
    const bundle = {
      authData: {
        apiKey: process.env.API_KEY,
      },
      inputData: blueprint_render.operation.sample,
    };

    const results = await appTester(
      App.creates.blueprint_render.operation.perform,
      bundle
    );

    expect(results).toBeDefined();
    expect(results).toHaveProperty("id");
    expect(results).toHaveProperty("name");
    // FIXME
    // expect(results).toHaveProperty("status");
    // expect(results).toHaveProperty("source");
    // expect(results["source"]).toEqual("zapier");
  });

  it("should generate the blueprintSlugField", async () => {
    const bundle = {};

    const results = await appTester(
      App.creates.blueprint_render.operation.inputFields[0],
      bundle
    );

    expect(results).toBeDefined();
    expect(results).toHaveLength(1);
    expect(results[0]).toHaveProperty("key");
    expect(results[0]).toHaveProperty("choices");
    expect(results[0].choices).toContain("official/safe");
  });

  it("should generate the partiesField with no separate parties", async () => {
    const bundle = { inputData: { slug: "official/safe" } };

    const results = await appTester(
      App.creates.blueprint_render.operation.inputFields[2],
      bundle
    );

    expect(results).toBeDefined();
    expect(results).toHaveLength(0);
  });

  it.skip("should generate the partiesField with separate parties", async () => {
    // Skipping until we have an official blueprint w/ separate parties
    const bundle = { inputData: { slug: "aescher/boat-sharing-agreement" } };

    const results = await appTester(
      App.creates.blueprint_render.operation.inputFields[2],
      bundle
    );

    expect(results).toBeDefined();
    expect(results).toHaveLength(1);
    expect(results[0]).toHaveProperty("key");
  });

});
