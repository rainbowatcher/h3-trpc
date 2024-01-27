[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/rainbowatcher/ts-starter/ci.yml)](https://github.com/rainbowatcher/ts-starter/actions)
![GitHub License](https://img.shields.io/github/license/rainbowatcher/ts-starter)
![GitHub package.json version](https://img.shields.io/github/package-json/v/rainbowatcher/ts-starter)

# h3-trpc

h3 integration with trpc.

## Usage

1. Install

```bash
pnpm i -D h3-trpc
```

2. Import

```typescript
// server.ts
import { createServer } from "node:http"
import { createH3Middleware } from "h3-trpc"
import { initTRPC } from "@trpc/server"
import * as h3 from "h3"

const app = createApp()
const t = initTRPC.create()

const appRouter = t.router({
  hello: t.procedure
      .input(z.string())
      .query(opts => `hello ${opts.input}`),
})

export type AppRouter = typeof appRouter

const app = h3.createApp()
app.use("/trpc", createH3Middleware({ router: appRouter }))
// You can set the route path to "/" or simply leave it unset
// e.g. app.use(createH3Middleware({ router: appRouter }))
createServer(h3.toNodeListener(app)).listen(3000)
```

```ts
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client"

client = createTRPCProxyClient<AppRouter>({
    links: [
        httpBatchLink({
            // The base path of the request URL depends on how the route path is configured.
            url: "http://localhost:3000/trpc",
        }),
    ],
})
const resp = await client.hello.query("world")
```

## License

[MIT](./LICENSE) &copy; Made by ❤️