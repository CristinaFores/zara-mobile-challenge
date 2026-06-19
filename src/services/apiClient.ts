import axios, { type AxiosInstance } from 'axios'

/**
 * Pre-configured Axios instance for the mobile catalog API.
 *
 * Every request made through this client automatically includes:
 * - `baseURL` — the external API origin read from the `API_BASE_URL` environment variable.
 * - `x-api-key` header — the secret key read from the `API_KEY` environment variable.
 *
 * Both values are server-side only. They are never exposed to the browser.
 * Services import this client instead of calling `axios` directly,
 * so credentials are configured in exactly one place.
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.API_BASE_URL,
  headers: {
    'x-api-key': process.env.API_KEY,
  },
})

export default apiClient
