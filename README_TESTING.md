Playwright Automated Functional Testing

1. Install dependencies (requires Node.js and npm):

```bash
npm install
npx playwright install
```

2. Run tests:

```bash
npm test
```

3. Report:
 - HTML report generated at `tests/playwright-report`.
 - Screenshots saved under `tests/screenshots/`.
 - Accessibility JSON files saved as `tests/accessibility-<page>.json` on failures.

Notes:
 - These tests run pages directly via `file://` URLs. For dynamic APIs or full end-to-end testing, start a local server and update `utils.fileUrlFor` to point to `http://localhost:PORT/`.
 - A local analytics dashboard is available at `/analytics-dashboard.html` after the site is served locally.
 - GitHub Actions now includes a deploy workflow for GitHub Pages and a deployment verification script.
