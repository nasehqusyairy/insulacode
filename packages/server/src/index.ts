import { serve } from "@hono/node-server"
import { serveStatic } from "@hono/node-server/serve-static"
import { Hono } from "hono"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = new Hono()

app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    service: "insulacode-server",
  })
})

const clientDist = path.resolve(__dirname, "../../client/dist")

app.use("/*", serveStatic({ root: clientDist }))

app.get("/*", serveStatic({ path: `${clientDist}/index.html` }))

const port = Number(process.env.PORT ?? 3000)

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(
      `Insula-code server running on http://localhost:${info.port}`,
    )
  },
)