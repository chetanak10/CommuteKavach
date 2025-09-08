import { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../db.js";

export default async function incidentRoutes(f: FastifyInstance) {
  f.addHook("onRequest", (req:any, rep:any) => f.authenticate(req, rep));
  const reportSchema = z.object({
    lat: z.number(), lng: z.number(),
    type: z.string(), severity: z.number().min(1).max(5).default(1),
    description: z.string().max(200).optional()
  });
  f.post("/incidents/report", async (req:any, reply) => {
    const v = reportSchema.parse(req.body);
    await db.query(
      "INSERT INTO incidents(user_id,lat,lng,type,severity,description) VALUES($1,$2,$3,$4,$5,$6)",
      [req.user.sub, v.lat, v.lng, v.type, v.severity, v.description ?? null]
    );
    return reply.code(201).send({ ok:true });
  });
  f.get("/incidents/nearby", async (req:any) => {
    const lat = Number(req.query.lat), lng = Number(req.query.lng), r = Number(req.query.radius ?? 1000);
    const { rows } = await db.query("SELECT * FROM incidents WHERE created_at > now() - interval '6 hours'");
    const within = rows.filter((it:any) => haversine(lat,lng,it.lat,it.lng) <= r);
    return within;
  });
}
function haversine(lat1:number, lon1:number, lat2:number, lon2:number){
  const toRad = (x:number)=>x*Math.PI/180;
  const R=6371000, dLat=toRad(lat2-lat1), dLon=toRad(lon2-lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(a));
}
