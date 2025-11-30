/* Playwright config for basic headless tests */
module.exports = {
  timeout: 30000,
  use: {
    headless: true,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 10000
  },
};
