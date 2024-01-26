import type { IncomingMessage, ServerResponse } from "node:http"
import h3 from "h3"
import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http"
import type { NodeHTTPCreateContextFnOptions, NodeHTTPHandlerOptions } from "@trpc/server/adapters/node-http"
import type { AnyRouter } from "@trpc/server"

export type CreateH3ContextOptions = NodeHTTPCreateContextFnOptions<IncomingMessage, ServerResponse<IncomingMessage>>

export type AdditionalMiddlewareOpts = { prefix?: `/${string}` };
export type CreateH3MiddlewareOptions<TRouter extends AnyRouter> = NodeHTTPHandlerOptions<
  TRouter,
  IncomingMessage,
  ServerResponse<IncomingMessage>
> &
  AdditionalMiddlewareOpts;

export function createH3Middleware<TRouter extends AnyRouter>(
  opts: CreateH3MiddlewareOptions<TRouter>,
): h3.EventHandler {
  return h3.defineEventHandler(async (e) => {
    const endpoint = h3.getRequestURL(e).pathname.slice(1)
    const { prefix, router, createContext } = opts
    const { req, res } = e.node

    if (prefix && !h3.getRequestURL(e).pathname.startsWith(prefix)) return e;

    await nodeHTTPRequestHandler({
      router,
      createContext,
      req,
      res,
      path: endpoint,
    })
  })
}