import { createServer } from "node:http"
import { test } from "uvu"
import * as assert from "uvu/assert"
import { initTRPC } from "@trpc/server"
import z from "zod"
import { createApp, toNodeListener } from "h3"
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client"
import { createH3Middleware } from "../src"

const { router, procedure } = initTRPC.create()

const appRouter = router({
  hello: procedure.input(z.string()).query((opts) => {
    return `hello ${opts.input}`
  }),
})

type AppRouter = typeof appRouter

const app = createApp()
app.use("/trpc", createH3Middleware({ router: appRouter }))
const server = createServer(toNodeListener(app)).listen(3000)

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/trpc",
    }),
  ],
})

test("test hello", async () => {
  const resp = await client.hello.query("world")
  assert.equal(resp, "hello world")
  server.close()
})

test.run()