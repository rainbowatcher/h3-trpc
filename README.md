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
import { createH3Middleware } from "h3-trpc"

const app = createApp()
const { router, procedure } = initTRPC.create()

const appRouter = router({
  // ...define your router
})

app.use("/trpc", createH3Middleware({ router: appRouter }))
const server = createServer(toNodeListener(app)).listen(3000)
```

## License

[MIT](./LICENSE) &copy; Made by ❤️