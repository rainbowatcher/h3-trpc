import { Server, createServer } from "node:http"
import { it, expect, beforeAll, afterAll } from "vitest"
import { initTRPC, AnyRouter } from "@trpc/server"
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client"
import z from "zod"
import { createApp, toNodeListener } from "h3"
import { createH3Middleware } from "../src"

let server: Server, client: any;

beforeAll(() => {
  const { router, procedure } = initTRPC.create()
  
  const appRouter = router({
    hello: procedure.input(z.string()).query((opts) => {
      return `hello ${opts.input}`
    }),
  })
  
  type AppRouter = typeof appRouter
  
  const app = createApp()
  app.use("/trpc", createH3Middleware({ router: appRouter }))
  server = createServer(toNodeListener(app)).listen(3000)
  
  client = createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: "http://localhost:3000/trpc",
      }),
    ],
  })
})

afterAll(() => {
  server.close()
})

it("test hello", async () => {
  const resp = await client.hello.query("world")
  expect(resp).toEqual("hello world")
})
