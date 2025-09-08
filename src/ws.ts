import { FastifyInstance } from "fastify";
import fastifyWebsocket from "@fastify/websocket";

export async function setupWS(f: FastifyInstance) {
  await f.register(fastifyWebsocket);
  const clients = new Set<any>();
  f.get("/ws", { websocket: true }, (connection) => {
    clients.add(connection);
    connection.socket.on("close", () => clients.delete(connection));
  });
  f.decorate("websocketBroadcast", (payload:any) => {
    for (const c of clients) {
      try { c.socket.send(JSON.stringify(payload)); } catch {}
    }
  });
}
declare module "fastify" {
  interface FastifyInstance { websocketBroadcast?: (p:any)=>void }
}
