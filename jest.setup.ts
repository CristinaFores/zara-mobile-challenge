import '@testing-library/jest-dom'

// Deterministic credentials for the test runtime. The API client reads these at
// import time and MSW handlers match against the same base URL, so requests are
// intercepted identically in local and CI runs (with or without a local .env).
process.env.API_BASE_URL = 'https://api.test'
process.env.API_KEY = 'test-api-key'
process.env.APP_URL = 'http://localhost:3000'

// jsdom does not yet implement the <search> landmark element (HTML Living Standard
// since 2023). Suppress the false-positive "unrecognized tag" error so it does not
// pollute test output — the element and its role="search" semantics are valid.
const originalError = console.error.bind(console)
console.error = (...args: Parameters<typeof console.error>) => {
  // React passes printf-style args: args[0] = 'The tag <%s> is unrecognized…', args[1] = 'search'
  if (typeof args[0] === 'string' && args[0].includes('is unrecognized') && args[1] === 'search')
    return
  originalError(...args)
}

import { server } from '@/test-utils/msw/server'

// Fail any test that hits an un-mocked endpoint, so we never call the real network.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
