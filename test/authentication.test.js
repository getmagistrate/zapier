/* globals describe, it, expect */

const zapier = require('zapier-platform-core');

const App = require('../index');
const appTester = zapier.createAppTester(App);
zapier.tools.env.inject();

describe('custom auth', () => {
  it("passes authentication and returns json", async () => {
    const bundle = {
      authData: {
        apiKey: process.env.API_KEY,
      },
    };

    const response = await appTester(App.authentication.test, bundle);
    expect(response).toHaveProperty("uuid");
    expect(response).toHaveProperty("name");
    expect(response).toHaveProperty("email");
  });

  it('fails on bad auth', async () => {
    const bundle = {
      authData: {
        apiKey: 'bad',
      },
    };

    try {
      await appTester(App.authentication.test, bundle);
    } catch (error) {
      expect(error.message).toContain('Invalid token');
      return;
    }
    throw new Error('appTester should have thrown');
  });
});