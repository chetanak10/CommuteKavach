import "fastify";
declare module "fastify" {
  interface FastifyInstance {
    authenticate: (req:any, rep:any)=>Promise<void>;
    websocketBroadcast?: (p:any)=>void;
  }
}
declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: { sub: number };
  }
}
