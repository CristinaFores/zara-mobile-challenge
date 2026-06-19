import '@testing-library/jest-dom'

// Deterministic credentials for the test runtime. The API client reads these at
// import time and MSW handlers match against the same base URL, so requests are
// intercepted identically in local and CI runs (with or without a local .env).
process.env.API_BASE_URL = 'https://api.test'
process.env.API_KEY = 'test-api-key'

import { server } from '@/test-utils/msw/server'

// Fail any test that hits an un-mocked endpoint, so we never call the real network.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
