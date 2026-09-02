const { devices } = require('@playwright/test');
const path = require('path');

const TEST_BASE_URL =
  process.env.TEST_BASE_URL ||
  process.env.PLAYWRIGHT_BASE_URL ||
  process.env.BASE_URL ||
  'http://127.0.0.1:5000';

const activeProjects = process.env.CI
  ? ['chromium']
  : ['chromium', 'firefox', 'mobile-chrome'];

const projectMap = {
  chromium: { use: { ...devices['Desktop Chrome'] } },
  firefox: { use: { ...devices['Desktop Firefox'] } },
  webkit: { use: { ...devices['Desktop Safari'] } },
  'mobile-chrome': { use: { ...devices['Pixel 5'] } },
  'tablet-safari': { use: { ...devices['iPad (gen 9)'] } }
};

module.exports = {
  testDir: path.join(__dirname, 'tests'),
  testMatch: ['**/*.@(spec|test).?(c|m)[jt]s'],
  testIgnore: [
    '**/node_modules/**',
    '**/backend_*.js',
    '**/security-hardening.spec.js'
  ],
  timeout: 60000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  reporter: [
    ['list'],
    ['html', {
      outputFolder: path.join(__dirname, 'tests/playwright-report')
    }]
  ],
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 10000,
    ignoreHTTPSErrors: true,
    baseURL: TEST_BASE_URL
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 5000',
    url: 'http://127.0.0.1:5000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  },
  projects: activeProjects.map((name) => ({
    name,
    ...projectMap[name]
  }))
};