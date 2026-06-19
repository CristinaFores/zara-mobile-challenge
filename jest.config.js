const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

/** @type {import('jest').Config} */
const config = {
  roots: ['<rootDir>/src'],
  testEnvironment: 'jsdom',
  // Load Fetch/stream polyfills before the test environment so MSW v2 works in jsdom.
  setupFiles: ['<rootDir>/jest.polyfills.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Resolve the Node build of msw (and other dual-package deps) under jsdom.
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  coverageProvider: 'v8',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.tsx',
    '!src/app/page.tsx',
    '!src/types/**',
    '!src/test-utils/**',
  ],
}

// MSW v2 and several of its deps ship as ESM, which Jest does not transform by
// default. next/jest forces its own `transformIgnorePatterns` and ignores the
// one passed in `config`, so we override it after the Next config is resolved.
const ESM_PACKAGES = [
  'msw',
  '@mswjs',
  '@open-draft',
  'until-async',
  'outvariant',
  'strict-event-emitter',
  'headers-polyfill',
  'rettime',
  'is-node-process',
  '@bundled-es-modules',
]

module.exports = async () => {
  const nextConfig = await createJestConfig(config)()

  nextConfig.transformIgnorePatterns = [
    `node_modules/(?!(?:\\.pnpm/)?(${ESM_PACKAGES.join('|')})/)`,
    '^.+\\.module\\.(css|sass|scss)$',
  ]

  return nextConfig
}
