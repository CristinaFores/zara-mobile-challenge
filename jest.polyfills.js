/**
 * Polyfills required by MSW v2 when running under jsdom.
 *
 * jsdom does not implement the WHATWG Fetch primitives (Request/Response/Headers)
 * nor the streaming/encoding globals MSW relies on. We load them from Node's
 * built-ins and `undici` *before* the test environment is set up (via `setupFiles`),
 * so MSW's request interception works the same as in a real runtime.
 *
 * The Fetch primitives are made `configurable`/`writable` so MSW's interceptors
 * can wrap them (otherwise `setupServer().listen()` throws "Cannot redefine property").
 */
const { TextDecoder, TextEncoder } = require('node:util')
const { ReadableStream, TransformStream, WritableStream } = require('node:stream/web')
const { BroadcastChannel } = require('node:worker_threads')

const define = (props) =>
  Object.defineProperties(
    globalThis,
    Object.fromEntries(
      Object.entries(props).map(([key, value]) => [
        key,
        { value, configurable: true, writable: true },
      ])
    )
  )

define({
  TextDecoder,
  TextEncoder,
  ReadableStream,
  TransformStream,
  WritableStream,
  BroadcastChannel,
})

const { Blob, File } = require('node:buffer')
const { fetch, Headers, FormData, Request, Response } = require('undici')

define({ fetch, Blob, File, Headers, FormData, Request, Response })
