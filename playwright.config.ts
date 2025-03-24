import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 30000,
  globalTimeout: 600000,
  reporter: 'list',
  testDir: './tests',
    name: 'chromium',
    use: {
      headless: true,
      bypassCSP: true, // add this to disable cors
      launchOptions: {
        args: ['--disable-web-security'], // add this to disable cors
      },
    },
});