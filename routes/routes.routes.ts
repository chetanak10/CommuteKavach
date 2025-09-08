import { FastifyInstance } from "fastify";
import { z } from "zod";
import { createRoute, getUserRoutes, getRoute } from "./routes.service.js";
import { etaMinutes } from "../services/maps.js";
import { getWeatherPenalty } from "../services/weather.js";
import { getAqiPenalty } from "../services/aqi.js";
import { weatherPenalty, aqiPenalty, finalScore } from "../scoring.js";

export default async function routesApi(f: FastifyInstance) {
  f.addHook("onRequest", (req:any, rep:any) => f.authenticate(req, rep));
  const saveSchema = z.object({
    name: z.string().max(60),
    from: z.object({ lat: z.number(), lng: z.number() }),
    to: z.object({ lat: z.number(), lng: z.number() })
  });
  f.post("/routes", async (req: any, reply) => {
    const v = saveSchema.parse(req.body);
    const id = await createRoute(req.user.sub, v);
    return reply.code(201).send({ id });
  });
  f.get("/routes", async (req: any) => getUserRoutes(req.user.sub));
  f.get("/routes/:id/score", async (req: any) => {
    const id = Number(req.params.id);
    const r = await getRoute(req.user.sub, id);
    if (!r) return { error: "not_found" };
    const eta = await etaMinutes({ lat:r.from_lat,lng:r.from_lng }, { lat:r.to_lat,lng:r.to_lng });
    const wp = await getWeatherPenalty(r.to_lat, r.to_lng);
    const ap = await getAqiPenalty(r.to_lat, r.to_lng);
    const wpen = weatherPenalty(wp);
    const apen = aqiPenalty(ap);
    const score = finalScore(eta, wpen, apen);
    if (score < 50) f.websocketBroadcast?.({ routeId:id, score, reason:"low_score" });
    return { eta_min: eta, weather_penalty: wpen, aqi_penalty: apen, score };
  });
}
