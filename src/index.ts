import type { IncomingMessage, ServerResponse } from "node:http"
import h3 from "h3"
import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http"
import type { NodeHTTPCreateContextFnOptions, NodeHTTPHandlerOptions } from "@trpc/server/adapters/node-http"
import type { AnyRouter } from "@trpc/server"

export type CreateH3ContextOptions = NodeHTTPCreateContextFnOptions<IncomingMessage, ServerResponse>
export function createH3Middleware<TRouter extends AnyRouter>(
  opts: NodeHTTPHandlerOptions<TRouter, IncomingMessage, ServerResponse>,
): h3.EventHandler {
  return h3.defineEventHandler(async (e) => {
    const endpoint = h3.getRequestURL(e).pathname.slice(1)

    await nodeHTTPRequestHandler({
      ...opts,
      req: e.node.req,
      res: e.node.res,
      path: endpoint,
    })
  })
}