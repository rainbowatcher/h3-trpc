import * as h3 from "h3"
import { resolveHTTPResponse } from "@trpc/server/http"
import { TRPCError } from "@trpc/server"
import type { AnyRouter, MaybePromise, ProcedureType, inferRouterContext } from "@trpc/server"
import { getErrorShape } from "@trpc/server/shared"
import type { ResponseMetaFn } from "@trpc/server/dist/http/internals/types"

export type CreateContextFn<TRouter extends AnyRouter> = (event: h3.H3Event) => MaybePromise<inferRouterContext<TRouter>>

export type OnErrorPayload<TRouter extends AnyRouter> = {
    error: TRPCError
    type: ProcedureType | "unknown"
    path: string | undefined
    req: h3.H3Event["node"]["req"]
    input: unknown
    ctx: undefined | inferRouterContext<TRouter>
}

export type OnErrorFn<TRouter extends AnyRouter> = (opts: OnErrorPayload<TRouter>) => void

export type ResolveHTTPRequestOptions<TRouter extends AnyRouter> = {
    /**
   * The tRPC router to use.
   * @see https://trpc.io/docs/router
   */
    router: TRouter
    /**
   * An async function that returns the tRPC context.
   * @see https://trpc.io/docs/context
   */
    createContext?: CreateContextFn<TRouter>
    /**
   * A function that returns the response meta.
   * @see https://trpc.io/docs/caching#using-responsemeta-to-cache-responses
   */
    responseMeta?: ResponseMetaFn<TRouter>
    /**
   * A function that is called when an error occurs.
   * @see https://trpc.io/docs/error-handling#handling-errors
   */
    onError?: OnErrorFn<TRouter>
    batching?: {
        enabled: boolean
    }
}


export function createH3Middleware<TRouter extends AnyRouter>({
    router,
    createContext,
    responseMeta,
    onError,
    batching,
}: ResolveHTTPRequestOptions<TRouter>): h3.EventHandler {
    return h3.defineEventHandler(async (e) => {
        const {
            req,
            res,
        } = e.node
        const $url = h3.getRequestURL(e)
        let path: string
        if ($url.pathname.startsWith("/trpc/")) {
            path = $url.pathname.slice(6)
        }
        else {
            path = $url.pathname.slice(1)
        }

        if (path === null) {
            const error = getErrorShape({
                config: router._def._config,
                error: new TRPCError({
                    message:
                        'Query "trpc" not found - is the file named `[trpc]`.ts or `[...trpc].ts`?',
                    code: "INTERNAL_SERVER_ERROR",
                }),
                type: "unknown",
                ctx: undefined,
                path: undefined,
                input: undefined,
            })

            throw h3.createError({
                statusCode: 500,
                statusMessage: JSON.stringify(error),
            })
        }

        const httpResponse = await resolveHTTPResponse({
            batching,
            router,
            req: {
                method: req.method!,
                headers: req.headers,
                body: h3.isMethod(e, "GET") ? null : await h3.readBody(e),
                query: $url.searchParams,
            },
            path,
            createContext: async () => await createContext?.(e),
            responseMeta,
            onError: (o) => {
                onError?.({
                    ...o,
                    req,
                })
            },
        })

        const { status, headers, body } = httpResponse

        res.statusCode = status

        headers && Object.keys(headers).forEach((key) => {
            res.setHeader(key, headers[key]!)
        })

        return body
    })
}
