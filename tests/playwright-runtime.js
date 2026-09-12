import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const bundled = (process.env.USERPROFILE || '') + '/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const entry = process.env.APEX_PLAYWRIGHT_PATH || (existsSync(bundled) ? bundled : null);
export const { chromium } = await import(entry ? pathToFileURL(entry).href : 'playwright');
