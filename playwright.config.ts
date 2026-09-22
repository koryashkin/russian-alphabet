import { defineConfig, devices } from '@playwright/test'

const pagesBase = '/russian-alphabet/'
const runsOnGitHub = Boolean(process.env.GITHUB_ACTIONS)

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: `http://127.0.0.1:4173${runsOnGitHub ? pagesBase : '/'}`, trace: 'retain-on-failure' },
  webServer: {
    command: `npm run preview -- --host 127.0.0.1${runsOnGitHub ? ` --base ${pagesBase}` : ''}`,
    url: `http://127.0.0.1:4173${runsOnGitHub ? pagesBase : '/'}`,
    reuseExistingServer: true,
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 5'] } },
  ],
})
