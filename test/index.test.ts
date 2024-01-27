import { createServer } from "node:http"
import { afterAll, beforeAll, expect, it } from "vitest"
import { initTRPC } from "@trpc/server"
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client"
import z from "zod"
import { createApp, toNodeListener } from "h3"
import { createH3Middleware } from "../src"

const t = initTRPC.create()

const appRouter = t.router({
    hello: t.procedure
        .input(z.string())
        .query(opts => `hello ${opts.input}`),
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

afterAll(() => { server.close() })

it("test hello with batching", async () => {
    const resp = await client.hello.query("world")
    expect(resp).toEqual("hello world")
})
