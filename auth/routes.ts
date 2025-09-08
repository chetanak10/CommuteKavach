import { FastifyInstance } from "fastify";
import { z } from "zod";
import { login, register } from "./service.js";

export default async function authRoutes(f: FastifyInstance) {
  const body = z.object({ email: z.string().email(), password: z.string().min(6) });
  f.post("/auth/register", async (req, reply) => {
    const v = body.parse(req.body);
    const token = await register(v.email, v.password);
    return reply.send({ access_token: token, token_type: "bearer" });
  });
  f.post("/auth/login", async (req, reply) => {
    const v = body.parse(req.body);
    const token = await login(v.email, v.password);
    return reply.send({ access_token: token, token_type: "bearer" });
  });
}
