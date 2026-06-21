import axios, { type AxiosInstance } from 'axios'

const appClient: AxiosInstance = axios.create({
  baseURL: process.env.APP_URL ?? 'http://localhost:3000',
})

export default appClient
