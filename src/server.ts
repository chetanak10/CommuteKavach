import Fastify from "fastify";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import jwt from "@fastify/jwt";
import { cfg } from "./config.js";
import { setupWS } from "./ws.js";
import authRoutes from "./auth/routes.js";
import routesApi from "./routes/routes.routes.js";
import incidentRoutes from "./incidents/incidents.routes.js";

const app = Fastify({ logger: true });

await app.register(swagger, { openapi: { info: { title: "CommuteIQ", version: "0.1.0" } } });
await app.register(swaggerUI, { routePrefix: "/docs" });
await app.register(jwt, { secret: cfg.jwtSecret });
app.decorate("authenticate", async (req:any, rep:any) => {
  try { await req.jwtVerify(); } catch { return rep.code(401).send({error:"unauthorized"}); }
});
await setupWS(app);
app.get("/healthz", async () => ({ ok: true }));
await app.register(authRoutes);
await app.register(routesApi);
await app.register(incidentRoutes);
app.ready().then(() => app.swagger());
app.listen({ port: cfg.port, host: "0.0.0.0" });
